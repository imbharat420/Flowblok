// Node handler registry + the core handlers. Each handler receives resolved
// input items and returns output items (optionally split across named ports).
//
// Additional handlers (email, sms, slack, db, crm, stripe, loop, schedule…)
// register themselves by importing this module and calling registerHandler.

import type { ExecItem, WorkflowNode } from "@/lib/types";
import { resolveValue } from "./expressions";
import { assertSafeUrl } from "./net";

// Sub-nodes attached to this node via its sub-ports (AI Agent uses these).
export interface SubNodes {
  model?: WorkflowNode;
  memory?: WorkflowNode;
  tools: WorkflowNode[];
}

export interface NodeExecContext {
  node: WorkflowNode;
  items: ExecItem[];
  now: string;
  vars: Record<string, unknown>;
  /** Sub-nodes attached to this node (Chat Model / Memory / Tool). */
  subNodes: SubNodes;
  /** Resolve a credential's raw secret data by id (server-side only). */
  getCredential: (id: string) => Record<string, string> | undefined;
  /** Resolve config[key] (evaluating {{expressions}}) against an item. */
  getParam: (key: string, item?: ExecItem) => unknown;
  /** Append a line to this node's run log. */
  log: (msg: string) => void;
}

export interface HandlerOutput {
  items?: ExecItem[]; // main output (default port)
  branches?: Record<string, ExecItem[]>; // port -> items (e.g. If => true/false)
}

export type NodeHandler = (ctx: NodeExecContext) => Promise<HandlerOutput> | HandlerOutput;

const HANDLERS: Record<string, NodeHandler> = {};

export function registerHandler(type: string, handler: NodeHandler): void {
  HANDLERS[type] = handler;
}

export function getHandler(type: string): NodeHandler {
  return HANDLERS[type] ?? passthrough;
}

// ── helpers ────────────────────────────────────────────────────────────────

export function toItems(result: unknown): ExecItem[] {
  if (Array.isArray(result)) {
    return result.map((r) =>
      r && typeof r === "object" && "json" in (r as object)
        ? (r as ExecItem)
        : { json: (r ?? {}) as Record<string, unknown> },
    );
  }
  if (result && typeof result === "object") return [{ json: result as Record<string, unknown> }];
  return [{ json: { value: result } }];
}

function compare(left: unknown, op: string, right: unknown): boolean {
  switch (op) {
    case "equals":
      return String(left) === String(right);
    case "not equals":
      return String(left) !== String(right);
    case "contains":
      return String(left).includes(String(right));
    case "greater than":
      return Number(left) > Number(right);
    case "less than":
      return Number(left) < Number(right);
    case "is empty":
      return left === undefined || left === null || left === "";
    default:
      return false;
  }
}

// ── core handlers ────────────────────────────────────────────────────────────

/** Default: pass input straight through (used by triggers and any node without
 *  a dedicated handler). */
export const passthrough: NodeHandler = ({ items }) => ({ items });

const ifHandler: NodeHandler = ({ items, getParam, log }) => {
  const yes: ExecItem[] = [];
  const no: ExecItem[] = [];
  for (const item of items) {
    const pass = compare(getParam("left", item), String(getParam("operator", item) ?? "equals"), getParam("right", item));
    (pass ? yes : no).push(item);
  }
  log(`${yes.length} matched · ${no.length} did not`);
  return { items: yes, branches: { true: yes, false: no } };
};

const codeHandler: NodeHandler = async ({ items, node, log }) => {
  const code = String(node.config?.code ?? "return items;");
  // Run as an async function so author code may `await`, and any rejection
  // surfaces to the engine's try/catch instead of becoming an unhandled
  // rejection after the node was already logged.
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as FunctionConstructor;

  // n8n-imported Code nodes (marked with config._n8n) follow n8n's convention
  // where `items` are { json } wrappers accessed as `items[i].json.field`, and
  // `$json` / `$input` are available. Native Code nodes keep our simpler
  // convention where `items` is the array of plain json objects.
  const isN8n = !!(node.config && (node.config as Record<string, unknown>)._n8n);

  let result: unknown;
  if (isN8n) {
    const wrapped = items.map((i) => ({ json: i.json }));
    const $input = {
      all: () => wrapped,
      first: () => wrapped[0],
      last: () => wrapped[wrapped.length - 1],
      item: wrapped[0],
    };
    const fn = new AsyncFunction("items", "$json", "$input", `"use strict";\n${code}`);
    result = await fn(wrapped, wrapped[0]?.json ?? {}, $input);
  } else {
    const fn = new AsyncFunction("items", "$json", `"use strict";\n${code}`);
    result = await fn(
      items.map((i) => i.json),
      items[0]?.json ?? {},
    );
  }

  const out = toItems(result);
  log(`returned ${out.length} item(s)`);
  return { items: out };
};

const httpHandler: NodeHandler = async ({ items, getParam, log, getCredential }) => {
  const src = items.length ? items : [{ json: {} }];
  const out: ExecItem[] = [];
  for (const item of src) {
    const method = String(getParam("method", item) ?? "GET").toUpperCase();
    const url = String(getParam("url", item) ?? "");
    const bodyRaw = getParam("body", item);
    log(`${method} ${url}`);
    if (!url) throw new Error("HTTP node: URL is empty");
    assertSafeUrl(url); // block SSRF to internal/loopback hosts
    const hasBody = method !== "GET" && method !== "HEAD" && bodyRaw !== undefined && bodyRaw !== "";

    const headers: Record<string, string> = {};
    if (hasBody) headers["content-type"] = "application/json";
    // Header Auth: pull the header name/value from a credential (server-side).
    if (String(getParam("authentication", item) ?? "None") === "Header Auth") {
      const cred = getCredential(String(getParam("credential", item) ?? ""));
      const value = cred?.value ?? cred?.token ?? cred?.apiKey ?? cred?.key ?? "";
      if (value) {
        headers[cred?.name || cred?.header || "Authorization"] = value;
        log("auth: header from credential");
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000); // bound hung requests
    try {
      const res = await fetch(url, {
        method,
        headers: Object.keys(headers).length ? headers : undefined,
        body: hasBody ? (typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw)) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* keep as text */
      }
      out.push({ json: { status: res.status, ok: res.ok, body: parsed } });
    } finally {
      clearTimeout(timer);
    }
  }
  return { items: out };
};

const filterHandler: NodeHandler = ({ items, getParam, log }) => {
  const kept = items.filter((item) =>
    compare(getParam("left", item), String(getParam("operator", item) ?? "equals"), getParam("right", item)),
  );
  log(`${kept.length} of ${items.length} kept`);
  return { items: kept };
};

const switchHandler: NodeHandler = ({ items, getParam, log }) => {
  const ports = 4; // matches the node type's declared outputs ["0".."3"]
  const branches: Record<string, ExecItem[]> = {};
  for (let i = 0; i < ports; i++) branches[String(i)] = [];
  for (const item of items) {
    const raw = getParam("output", item);
    let idx = Number(raw);
    if (!Number.isFinite(idx)) idx = 0;
    idx = Math.min(Math.max(0, Math.trunc(idx)), ports - 1);
    branches[String(idx)].push(item);
  }
  log(Object.entries(branches).map(([p, b]) => `${p}:${b.length}`).join(" · "));
  return { items: branches["0"], branches };
};

// Merge / passthrough-style nodes: the engine already concatenates items
// arriving on multiple inbound edges into a node's input, so a passthrough
// effectively merges those streams.
const mergeHandler: NodeHandler = ({ items, log }) => {
  log(`merged ${items.length} item(s)`);
  return { items };
};

const stopErrorHandler: NodeHandler = ({ getParam, items }) => {
  const type = String(getParam("errorType", items[0]) ?? "Error Message");
  if (type === "Error Object") {
    const raw = getParam("errorObject", items[0]);
    const text = typeof raw === "string" ? raw : JSON.stringify(raw ?? {});
    throw new Error(text || "Workflow stopped");
  }
  throw new Error(String(getParam("errorMessage", items[0]) ?? "An error occurred!"));
};

const waitHandler: NodeHandler = async ({ items, getParam, log }) => {
  const amount = Number(getParam("amount", items[0]) ?? 0);
  const unit = String(getParam("unit", items[0]) ?? "seconds");
  const mult = unit === "hours" ? 3600 : unit === "minutes" ? 60 : 1;
  const ms = Math.min(Math.max(0, amount) * mult * 1000, 10_000); // capped at 10s inside a run
  log(`wait ${amount} ${unit} (capped to ${ms}ms)`);
  await new Promise((r) => setTimeout(r, ms));
  return { items };
};

registerHandler("if", ifHandler);
registerHandler("filter", filterHandler);
registerHandler("switch", switchHandler);
registerHandler("merge", mergeHandler);
registerHandler("stop_error", stopErrorHandler);
registerHandler("code", codeHandler);
registerHandler("http", httpHandler);
registerHandler("wait", waitHandler);
// triggers explicitly pass through (their items come from the run seed)
registerHandler("manual_trigger", passthrough);
registerHandler("webhook", passthrough);
registerHandler("schedule", passthrough);
registerHandler("form_submit", passthrough);
