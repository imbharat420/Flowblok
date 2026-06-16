"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  OPERATORS,
  operatorsForType,
  evaluateLogic,
  type LogicCondition,
  type LogicOperator,
  type LogicRule,
  type PreviewContext,
} from "@/lib/logic";
import {
  LOGIC_PRESETS,
  PRESET_CATEGORIES,
  SUBJECTS,
  SUBJECT_GROUPS,
  presetToRule,
  subjectByKey,
} from "@/lib/logic-presets";
import { Eye, EyeOff, Plus, Trash2, Wand2, Search, Check } from "lucide-react";

const newId = () => "lc_" + Math.random().toString(36).slice(2, 8);

function blankCondition(): LogicCondition {
  const subj = SUBJECTS[0];
  return { id: newId(), subject: subj.key, operator: operatorsForType(subj.type)[0] };
}

export function LogicBuilder({
  rule,
  onChange,
  ctx,
}: {
  rule: LogicRule | undefined;
  onChange: (rule: LogicRule) => void;
  ctx: PreviewContext;
}) {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const current: LogicRule = rule ?? { action: "show", match: "all", conditions: [] };

  const visible = useMemo(() => evaluateLogic(current, ctx), [current, ctx]);

  const set = (patch: Partial<LogicRule>) => onChange({ ...current, ...patch });
  const setCond = (id: string, patch: Partial<LogicCondition>) =>
    set({ conditions: current.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCond = () => set({ conditions: [...current.conditions, blankCondition()] });
  const removeCond = (id: string) => set({ conditions: current.conditions.filter((c) => c.id !== id) });

  return (
    <div className="space-y-3 text-[13px]">
      {/* live result */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-2.5 py-2",
          visible ? "border-ok/30 bg-ok/10 text-ok" : "border-warn/30 bg-warn/10 text-warn",
        )}
      >
        {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        <span className="font-medium">{visible ? "Visible" : "Hidden"}</span>
        <span className="text-fg-muted">for the current preview audience</span>
      </div>

      {/* action + match */}
      <div className="flex items-center gap-2">
        <Segmented
          value={current.action}
          onChange={(v) => set({ action: v as LogicRule["action"] })}
          options={[{ key: "show", label: "Show" }, { key: "hide", label: "Hide" }]}
        />
        <span className="text-fg-muted">when</span>
        {current.conditions.length > 1 && (
          <Segmented
            value={current.match}
            onChange={(v) => set({ match: v as LogicRule["match"] })}
            options={[{ key: "all", label: "ALL" }, { key: "any", label: "ANY" }]}
          />
        )}
      </div>

      {/* conditions */}
      {current.conditions.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-center text-[12px] text-fg-subtle">
          Always visible — add a condition or pick a preset.
        </p>
      ) : (
        <div className="space-y-2">
          {current.conditions.map((c) => (
            <ConditionRow key={c.id} cond={c} onChange={(p) => setCond(c.id, p)} onRemove={() => removeCond(c.id)} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={addCond} className="flex items-center gap-1 text-[12px] text-accent hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add condition
        </button>
        <span className="text-fg-subtle">·</span>
        <button onClick={() => setPresetsOpen((v) => !v)} className="flex items-center gap-1 text-[12px] text-accent hover:underline">
          <Wand2 className="h-3.5 w-3.5" /> Use a preset
        </button>
      </div>

      {presetsOpen && (
        <PresetPicker
          onPick={(p) => {
            onChange(presetToRule(p));
            setPresetsOpen(false);
          }}
          onClose={() => setPresetsOpen(false)}
        />
      )}
    </div>
  );
}

function ConditionRow({
  cond,
  onChange,
  onRemove,
}: {
  cond: LogicCondition;
  onChange: (p: Partial<LogicCondition>) => void;
  onRemove: () => void;
}) {
  const subj = subjectByKey(cond.subject);
  const ops = subj ? operatorsForType(subj.type) : (Object.keys(OPERATORS) as LogicOperator[]);
  const meta = OPERATORS[cond.operator];

  return (
    <div className="rounded-md border border-border bg-bg p-2">
      <div className="flex items-center gap-1.5">
        <select
          value={cond.subject}
          onChange={(e) => {
            const s = subjectByKey(e.target.value)!;
            onChange({ subject: e.target.value, operator: operatorsForType(s.type)[0], value: "" });
          }}
          className="min-w-0 flex-1 rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none"
        >
          {SUBJECT_GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {SUBJECTS.filter((s) => s.group === g).map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button onClick={onRemove} className="grid h-6 w-6 shrink-0 place-items-center rounded text-fg-subtle hover:text-err">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <select
          value={cond.operator}
          onChange={(e) => onChange({ operator: e.target.value as LogicOperator, value: "" })}
          className="rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none"
        >
          {ops.map((o) => (
            <option key={o} value={o}>{OPERATORS[o].label}</option>
          ))}
        </select>
        {meta.needsValue && <ValueInput subjType={subj?.type} values={subj?.values} kind={meta.valueKind} value={cond.value ?? ""} onChange={(v) => onChange({ value: v })} />}
      </div>
    </div>
  );
}

function ValueInput({
  subjType,
  values,
  kind,
  value,
  onChange,
}: {
  subjType?: string;
  values?: string[];
  kind: "none" | "scalar" | "list" | "range";
  value: string;
  onChange: (v: string) => void;
}) {
  if (kind === "range") {
    const [a, b] = value.split("..");
    return (
      <div className="flex flex-1 items-center gap-1">
        <input value={a ?? ""} onChange={(e) => onChange(`${e.target.value}..${b ?? ""}`)} placeholder="from" className="w-full rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none" />
        <span className="text-fg-subtle">–</span>
        <input value={b ?? ""} onChange={(e) => onChange(`${a ?? ""}..${e.target.value}`)} placeholder="to" className="w-full rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none" />
      </div>
    );
  }
  if (subjType === "enum" && values && kind === "scalar") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none">
        <option value="">—</option>
        {values.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  return (
    <input
      type={subjType === "number" ? "number" : subjType === "date" ? "text" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={kind === "list" ? "a, b, c" : subjType === "date" ? "2026-12-01 or now+3d" : "value"}
      className="flex-1 rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none"
    />
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn("rounded px-2 py-0.5 text-[12px] font-medium", value === o.key ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PresetPicker({
  onPick,
  onClose,
}: {
  onPick: (p: (typeof LOGIC_PRESETS)[number]) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const filtered = LOGIC_PRESETS.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (!q || p.label.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div className="rounded-md border border-border-strong bg-bg p-2">
      <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
        <Search className="h-3.5 w-3.5 text-fg-subtle" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search presets…" className="flex-1 bg-transparent text-[12px] text-fg outline-none" />
        <button onClick={onClose} className="text-[11px] text-fg-muted hover:text-fg">close</button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {["All", ...PRESET_CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-2 py-0.5 text-[11px]", cat === c ? "border-accent bg-accent/10 text-accent" : "border-border text-fg-muted hover:text-fg")}>
            {c}
          </button>
        ))}
      </div>
      <div className="max-h-[260px] space-y-1 overflow-y-auto">
        {filtered.map((p) => (
          <button key={p.id} onClick={() => onPick(p)} className="flex w-full items-start gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-left hover:border-accent">
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-fg">{p.label}</span>
              <span className="block text-[11px] text-fg-subtle">{p.description}</span>
            </span>
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-subtle" />
          </button>
        ))}
        {filtered.length === 0 && <p className="py-4 text-center text-[12px] text-fg-muted">No presets match.</p>}
      </div>
    </div>
  );
}
