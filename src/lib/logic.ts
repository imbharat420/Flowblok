// Conditional-logic model + evaluator for block visibility (the "Logic" tab).
// A block stores a LogicRule on props._logic; the renderer evaluates it against a
// runtime PreviewContext to decide show/hide. Presets + subjects live in logic-presets.ts.

export type LogicOperator =
  | "eq" | "neq" | "in" | "nin" | "gt" | "gte" | "lt" | "lte"
  | "contains" | "exists" | "not_exists" | "truthy" | "falsy" | "between";

export type SubjectType = "boolean" | "enum" | "string" | "number" | "date";

export interface LogicCondition {
  id: string;
  subject: string; // dot-path into the context, e.g. "user.role"
  operator: LogicOperator;
  value?: string; // scalar; list as "a,b"; range as "a..b" (supports now, now+3d)
}

export interface LogicRule {
  action: "show" | "hide";
  match: "all" | "any";
  conditions: LogicCondition[];
}

export interface LogicSubject {
  key: string;
  label: string;
  type: SubjectType;
  group: string;
  values?: string[];
  sample?: string;
  description?: string;
}

// ----- operator metadata (drives the builder UI) -----

interface OpMeta {
  label: string;
  needsValue: boolean;
  valueKind: "none" | "scalar" | "list" | "range";
}

export const OPERATORS: Record<LogicOperator, OpMeta> = {
  eq: { label: "is", needsValue: true, valueKind: "scalar" },
  neq: { label: "is not", needsValue: true, valueKind: "scalar" },
  in: { label: "is any of", needsValue: true, valueKind: "list" },
  nin: { label: "is none of", needsValue: true, valueKind: "list" },
  gt: { label: ">", needsValue: true, valueKind: "scalar" },
  gte: { label: "≥", needsValue: true, valueKind: "scalar" },
  lt: { label: "<", needsValue: true, valueKind: "scalar" },
  lte: { label: "≤", needsValue: true, valueKind: "scalar" },
  contains: { label: "contains", needsValue: true, valueKind: "scalar" },
  between: { label: "between", needsValue: true, valueKind: "range" },
  exists: { label: "is set", needsValue: false, valueKind: "none" },
  not_exists: { label: "is empty", needsValue: false, valueKind: "none" },
  truthy: { label: "is true", needsValue: false, valueKind: "none" },
  falsy: { label: "is false", needsValue: false, valueKind: "none" },
};

export function operatorsForType(type: SubjectType): LogicOperator[] {
  switch (type) {
    case "boolean": return ["truthy", "falsy", "exists", "not_exists"];
    case "enum": return ["eq", "neq", "in", "nin", "exists", "not_exists"];
    case "number": return ["eq", "neq", "gt", "gte", "lt", "lte", "between", "exists"];
    case "date": return ["gt", "gte", "lt", "lte", "between", "exists"];
    case "string": default: return ["eq", "neq", "contains", "in", "nin", "exists", "not_exists"];
  }
}

// ----- evaluation -----

export type PreviewContext = Record<string, unknown>;

function getPath(ctx: PreviewContext, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, ctx);
}

function asTime(raw: string, now: number): number | null {
  const s = raw.trim();
  if (s === "now") return now;
  const rel = s.match(/^now([+-])(\d+)d$/);
  if (rel) return now + (rel[1] === "+" ? 1 : -1) * Number(rel[2]) * 86400000;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

function resolveValue(raw: string | undefined, ctx: PreviewContext): string | undefined {
  if (raw == null) return raw;
  // allow a value that points at another context path (e.g. "resource.ownerId")
  if (/^[a-zA-Z_][\w.]*\.\w+$/.test(raw)) {
    const v = getPath(ctx, raw);
    if (v !== undefined) return String(v);
  }
  return raw;
}

function evalCondition(c: LogicCondition, ctx: PreviewContext, now: number): boolean {
  const left = getPath(ctx, c.subject);
  const op = c.operator;
  switch (op) {
    case "exists": return left !== undefined && left !== null && left !== "";
    case "not_exists": return left === undefined || left === null || left === "";
    case "truthy": return Boolean(left);
    case "falsy": return !left;
  }
  const raw = resolveValue(c.value, ctx);
  if (raw == null) return false;
  const list = raw.split(",").map((s) => s.trim());
  switch (op) {
    case "eq": return String(left) === raw;
    case "neq": return String(left) !== raw;
    case "in": return list.includes(String(left));
    case "nin": return !list.includes(String(left));
    case "contains": return String(left ?? "").toLowerCase().includes(raw.toLowerCase());
    case "gt": case "gte": case "lt": case "lte": {
      const ln = Number(left), rn = Number(raw);
      if (Number.isNaN(ln) || Number.isNaN(rn)) return false;
      return op === "gt" ? ln > rn : op === "gte" ? ln >= rn : op === "lt" ? ln < rn : ln <= rn;
    }
    case "between": {
      const [a, b] = raw.split("..");
      if (a == null || b == null) return false;
      // try date range first (supports now, now±Nd), else numeric
      const lt = typeof left === "string" || left instanceof Date ? Date.parse(String(left)) : NaN;
      const at = asTime(a, now), bt = asTime(b, now);
      if (!Number.isNaN(lt) && at != null && bt != null) return lt >= at && lt <= bt;
      const ln = Number(left);
      return !Number.isNaN(ln) && ln >= Number(a) && ln <= Number(b);
    }
    default: return false;
  }
}

/** Returns whether the block is VISIBLE under the given context. */
export function evaluateLogic(rule: LogicRule | undefined, ctx: PreviewContext, now = Date.now()): boolean {
  if (!rule || rule.conditions.length === 0) return true; // no rule = always visible
  const results = rule.conditions.map((c) => evalCondition(c, ctx, now));
  const matched = rule.match === "all" ? results.every(Boolean) : results.some(Boolean);
  return rule.action === "show" ? matched : !matched;
}

export function summarizeRule(rule: LogicRule | undefined): string {
  if (!rule || rule.conditions.length === 0) return "Always visible";
  const verb = rule.action === "show" ? "Show" : "Hide";
  const join = rule.match === "all" ? " and " : " or ";
  const parts = rule.conditions.map((c) => {
    const m = OPERATORS[c.operator];
    return m.needsValue ? `${c.subject} ${m.label} ${c.value ?? ""}` : `${c.subject} ${m.label}`;
  });
  return `${verb} when ${parts.join(join)}`;
}
