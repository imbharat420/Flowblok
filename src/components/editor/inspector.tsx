"use client";

import { cn } from "@/lib/cn";
import type { BlockNode, ComponentDef, DataBinding, FieldDef } from "@/lib/types";
import { DataBinder } from "./data-binder";
import { LogicBuilder } from "./logic-builder";
import { EventsBuilder } from "./events-builder";
import type { LogicRule, PreviewContext } from "@/lib/logic";
import { Paintbrush, Database, GitBranch, Shield, Zap, Search, Sparkles, Trash2, X } from "lucide-react";

export const INSPECTOR_TABS = [
  { key: "design", label: "Design", icon: Paintbrush },
  { key: "data", label: "Data", icon: Database },
  { key: "logic", label: "Logic", icon: GitBranch },
  { key: "permissions", label: "Permissions", icon: Shield },
  { key: "events", label: "Events", icon: Zap },
  { key: "seo", label: "SEO", icon: Search },
  { key: "ai", label: "AI", icon: Sparkles },
] as const;

export type TabKey = (typeof INSPECTOR_TABS)[number]["key"];

const ROLES = ["Guest", "User", "Editor", "Admin"];

export function Inspector({
  node,
  def,
  active,
  onActive,
  onProp,
  onBinding,
  ctx,
  mobileOpen,
  onMobileClose,
  onRemove,
}: {
  node: BlockNode | null;
  def: ComponentDef | null;
  active: TabKey;
  onActive: (t: TabKey) => void;
  onProp: (key: string, value: unknown) => void;
  onBinding: (b: DataBinding) => void;
  ctx: PreviewContext;
  // Mobile bottom-sheet controls (ignored on desktop, where the panel is fixed).
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onRemove?: () => void;
}) {
  const binding = node?.props?._binding as DataBinding | undefined;

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface",
        "lg:w-[320px] lg:shrink-0 lg:border-l lg:border-border",
        "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:max-h-[72vh] max-lg:rounded-t-2xl max-lg:border max-lg:border-border max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300",
        mobileOpen ? "max-lg:translate-y-0" : "max-lg:translate-y-[110%]",
      )}
    >
      <div className="mx-auto mb-1 mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong lg:hidden" />

      {/* mobile sheet header: title + remove + close */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:hidden">
        <span className="truncate text-[13px] font-medium text-fg">
          {node ? `Edit ${def?.label ?? node.component}` : "Edit block"}
        </span>
        <div className="flex items-center gap-1">
          {onRemove && (
            <button
              onClick={onRemove}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-fg-muted hover:text-err"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
          <button
            onClick={onMobileClose}
            title="Close"
            className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5">
        {INSPECTOR_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onActive(t.key)}
              title={t.label}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors",
                active === t.key ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!node ? (
          <p className="mt-8 text-center text-[13px] text-fg-muted">Select a block to edit its {active}.</p>
        ) : (
          <>
            <p className="label-caps mb-3">
              {def?.label ?? node.component} · {active}
            </p>

            {active === "design" &&
              (def && def.fields.length ? (
                <div className="space-y-3">
                  {def.fields.map((f) => (
                    <Field key={f.key} field={f} value={node.props[f.key]} onChange={(v) => onProp(f.key, v)} />
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-fg-muted">No editable design fields.</p>
              ))}

            {active === "data" && <DataBinder binding={binding} onChange={onBinding} />}

            {active === "logic" && (
              <LogicBuilder
                rule={node.props._logic as LogicRule | undefined}
                onChange={(r) => onProp("_logic", r)}
                ctx={ctx}
              />
            )}

            {active === "permissions" && (
              <div className="space-y-2 text-[13px]">
                <p className="text-fg-muted">Who can see this block.</p>
                {ROLES.map((r, i) => (
                  <label key={r} className="flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-2">
                    <input type="checkbox" defaultChecked={i < 2} className="accent-[var(--accent)]" />
                    <span className="text-fg">{r}</span>
                  </label>
                ))}
              </div>
            )}

            {active === "events" && (
              <EventsBuilder
                handlers={node.props._events as import("@/lib/events").EventHandler[] | undefined}
                onChange={(h) => onProp("_events", h)}
              />
            )}

            {active === "seo" && (
              <div className="space-y-3 text-[13px]">
                <Field field={{ key: "metaTitle", label: "Meta title", type: "text" }} value={node.props.metaTitle} onChange={(v) => onProp("metaTitle", v)} />
                <Field field={{ key: "metaDesc", label: "Meta description", type: "textarea" }} value={node.props.metaDesc} onChange={(v) => onProp("metaDesc", v)} />
                <p className="text-[12px] text-fg-subtle">Page-level SEO also feeds the sitemap and Open Graph tags.</p>
              </div>
            )}

            {active === "ai" && (
              <div className="space-y-2 text-[13px]">
                <p className="text-fg-muted">Ask AI to edit this block.</p>
                <textarea
                  placeholder="e.g. Make the headline punchier and add a 3-column feature grid"
                  className="h-24 w-full resize-none rounded-md border border-border bg-bg p-2.5 text-[13px] text-fg outline-none placeholder:text-fg-subtle"
                />
                <button className="w-full rounded-md bg-accent py-1.5 text-[13px] font-medium text-accent-fg">Generate</button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: Pick<FieldDef, "key" | "label" | "type" | "options">;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const val = value == null ? "" : String(value);
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-fg-muted">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="h-20 w-full resize-none rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none"
        />
      ) : field.type === "select" ? (
        <select
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none"
        >
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="color" value={val || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 rounded border border-border bg-bg" />
          <input value={val} onChange={(e) => onChange(e.target.value)} className="flex-1 rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-fg outline-none" />
        </div>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={val}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none"
        />
      )}
    </label>
  );
}
