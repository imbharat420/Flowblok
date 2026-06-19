"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import type { ExecItem, NodeParam, NodeRunLog, NodeType, WorkflowNode } from "@/lib/types";
import { visibleParams } from "@/lib/params";
import { X, Play, Loader2 } from "lucide-react";

type CredOption = { id: string; name: string; type: string };

// n8n-style Node Detail View: a full-screen modal with INPUT | Parameters/
// Settings | OUTPUT. Opened by double-clicking a node on the canvas.
export function NodeDetailView({
  node,
  nodeType,
  runLog,
  running,
  credentials,
  onChangeName,
  onChangeConfig,
  onRun,
  onClose,
}: {
  node: WorkflowNode;
  nodeType?: NodeType;
  runLog: NodeRunLog | null;
  running: boolean;
  credentials?: CredOption[];
  onChangeName: (name: string) => void;
  onChangeConfig: (key: string, value: unknown) => void;
  onRun: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"parameters" | "settings">("parameters");
  const Icon = getIcon(nodeType?.icon ?? "Box");
  const params = visibleParams(nodeType?.params, node.config);
  const notes = String(node.config?._notes ?? "");
  const continueOnFail = Boolean(node.config?._continueOnFail);

  return (
    <div className="fixed inset-0 z-[60] flex bg-black/60" onClick={onClose}>
      <div
        className="m-auto flex h-[88vh] w-[94vw] max-w-[1240px] flex-col overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-fg-muted">
            <Icon className="h-4 w-4" />
          </span>
          <input
            value={node.name}
            onChange={(e) => onChangeName(e.target.value)}
            className="min-w-0 max-w-[280px] bg-transparent text-[14px] font-medium text-fg outline-none"
          />
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
            {nodeType?.label ?? node.type}
          </span>
          <div className="flex-1" />
          <button
            onClick={onRun}
            disabled={running}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Execute step
          </button>
          <button onClick={onClose} className="text-fg-muted hover:text-fg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* three panes */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_1.3fr_1fr]">
          <Pane title="Input" items={runLog?.inputSample} empty="No input yet — run to populate" />

          <div className="flex min-h-0 flex-col border-border md:border-x">
            <div className="flex shrink-0 gap-1 border-b border-border px-3 py-2">
              {(["parameters", "settings"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] font-medium capitalize",
                    tab === t ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {tab === "parameters" ? (
                params.length ? (
                  params.map((p) => (
                    <FxField
                      key={p.key}
                      param={p}
                      value={node.config?.[p.key]}
                      credentials={credentials}
                      onChange={(v) => onChangeConfig(p.key, v)}
                    />
                  ))
                ) : (
                  <p className="text-[12px] text-fg-muted">This node has no parameters.</p>
                )
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-fg-muted">Notes</span>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => onChangeConfig("_notes", e.target.value)}
                      placeholder="Notes about this node…"
                      className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex items-start gap-2 text-[13px] text-fg">
                    <input
                      type="checkbox"
                      checked={continueOnFail}
                      onChange={(e) => onChangeConfig("_continueOnFail", e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-accent"
                    />
                    <span>
                      Continue on fail
                      <span className="mt-0.5 block text-[11px] text-fg-subtle">
                        Keep running the workflow even if this node errors.
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <Pane
            title="Output"
            items={runLog?.output}
            empty="No output yet — run to populate"
            error={runLog?.error}
            messages={runLog?.messages}
            status={runLog?.status}
          />
        </div>
      </div>
    </div>
  );
}

function Pane({
  title,
  items,
  empty,
  error,
  messages,
  status,
}: {
  title: string;
  items?: ExecItem[];
  empty: string;
  error?: string;
  messages?: string[];
  status?: string;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{title}</span>
        {items && items.length > 0 && (
          <span className="text-[11px] text-fg-subtle">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        )}
        {status && (
          <span className={cn("text-[11px]", status === "error" ? "text-err" : status === "skipped" ? "text-fg-subtle" : "text-ok")}>
            {status}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 text-[12px]">
        {error && <p className="mb-2 rounded border border-err/30 bg-err/5 px-2 py-1 text-err">{error}</p>}
        {messages && messages.length > 0 && <p className="mb-2 text-[11px] text-fg-subtle">{messages.join(" · ")}</p>}
        {items && items.length > 0 ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-fg">
            {JSON.stringify(items.map((i) => i.json), null, 2)}
          </pre>
        ) : (
          <p className="text-[12px] text-fg-subtle">{empty}</p>
        )}
      </div>
    </div>
  );
}

// A parameter field with an n8n-style fx expression toggle: when on, the value
// is edited as a {{ … }} expression instead of the typed control.
function FxField({
  param,
  value,
  credentials,
  onChange,
}: {
  param: NodeParam;
  value: unknown;
  credentials?: CredOption[];
  onChange: (v: unknown) => void;
}) {
  const exprable = param.type !== "boolean" && param.type !== "credential";
  const [fx, setFx] = useState(typeof value === "string" && value.includes("{{"));
  const base = "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent";

  return (
    <label className="mb-4 block">
      <span className="mb-1 flex items-center justify-between">
        <span className="text-[12px] text-fg-muted">{param.label}</span>
        {exprable && (
          <button
            type="button"
            title="Toggle expression"
            onClick={() => setFx((v) => !v)}
            className={cn(
              "rounded border px-1.5 font-mono text-[10px]",
              fx ? "border-accent text-accent" : "border-border text-fg-subtle hover:text-fg",
            )}
          >
            fx
          </button>
        )}
      </span>
      {fx ? (
        <textarea
          rows={2}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="{{ $json.field }}"
          className={cn(base, "font-mono text-[12px]")}
        />
      ) : param.type === "credential" ? (
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">— none —</option>
          {(credentials ?? [])
            .filter((c) => !param.credentialType || c.type === param.credentialType)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
        </select>
      ) : param.type === "textarea" ? (
        <textarea
          rows={4}
          value={String(value ?? param.default ?? "")}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, "font-mono text-[12px]")}
        />
      ) : param.type === "select" ? (
        <select value={String(value ?? param.default ?? "")} onChange={(e) => onChange(e.target.value)} className={base}>
          {(param.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : param.type === "number" ? (
        <input
          type="number"
          value={value === undefined || value === null ? String(param.default ?? "") : String(value)}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={base}
        />
      ) : (
        <input
          type="text"
          value={String(value ?? param.default ?? "")}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
      {param.hint && <span className="mt-1 block text-[11px] text-fg-subtle">{param.hint}</span>}
    </label>
  );
}
