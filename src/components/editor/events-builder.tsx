"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import {
  TRIGGER_LABELS,
  TRIGGERS,
  summarizeHandler,
  type ActionConfigField,
  type EventAction,
  type EventHandler,
  type EventTrigger,
} from "@/lib/events";
import {
  ACTION_TYPES,
  EVENT_RECIPES,
  RECIPE_CATEGORIES,
  actionTypeByKey,
  recipeToHandler,
  type EventRecipe,
} from "@/lib/event-recipes";
import { Plus, Trash2, Wand2, Search, Zap } from "lucide-react";

const newId = (): string => "ev_" + Math.random().toString(36).slice(2, 8);

function blankAction(): EventAction {
  return { id: newId(), type: ACTION_TYPES[0].type, config: {} };
}

function blankHandler(): EventHandler {
  return { id: newId(), trigger: "on_click", actions: [blankAction()] };
}

export function EventsBuilder({
  handlers,
  onChange,
}: {
  handlers: EventHandler[] | undefined;
  onChange: (h: EventHandler[]) => void;
}) {
  const [recipesOpen, setRecipesOpen] = useState(false);
  const list: EventHandler[] = handlers ?? [];

  const setHandler = (id: string, patch: Partial<EventHandler>) =>
    onChange(list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const addHandler = () => onChange([...list, blankHandler()]);
  const removeHandler = (id: string) => onChange(list.filter((h) => h.id !== id));

  return (
    <div className="space-y-3 text-[13px]">
      <p className="text-fg-muted">Trigger one or more actions on interaction.</p>

      {list.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-[12px] text-fg-subtle">
          No interactions yet — add an event or pick a recipe.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((h) => (
            <HandlerCard
              key={h.id}
              handler={h}
              onChange={(patch) => setHandler(h.id, patch)}
              onRemove={() => removeHandler(h.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={addHandler} className="flex items-center gap-1 text-[12px] text-accent hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add event
        </button>
        <span className="text-fg-subtle">·</span>
        <button
          onClick={() => setRecipesOpen((v) => !v)}
          className="flex items-center gap-1 text-[12px] text-accent hover:underline"
        >
          <Wand2 className="h-3.5 w-3.5" /> Use a recipe
        </button>
      </div>

      {recipesOpen && (
        <RecipePicker
          onPick={(r) => {
            onChange([...list, recipeToHandler(r)]);
            setRecipesOpen(false);
          }}
          onClose={() => setRecipesOpen(false)}
        />
      )}
    </div>
  );
}

function HandlerCard({
  handler,
  onChange,
  onRemove,
}: {
  handler: EventHandler;
  onChange: (patch: Partial<EventHandler>) => void;
  onRemove: () => void;
}) {
  const setAction = (id: string, patch: Partial<EventAction>) =>
    onChange({ actions: handler.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const addAction = () => onChange({ actions: [...handler.actions, blankAction()] });
  const removeAction = (id: string) => onChange({ actions: handler.actions.filter((a) => a.id !== id) });

  return (
    <div className="rounded-md border border-border bg-bg p-2.5">
      {/* trigger */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
        <select
          value={handler.trigger}
          onChange={(e) => onChange({ trigger: e.target.value as EventTrigger })}
          className="min-w-0 flex-1 rounded border border-border bg-surface px-1.5 py-1 text-[12px] text-fg outline-none"
        >
          {TRIGGERS.map((t) => (
            <option key={t} value={t}>
              {TRIGGER_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          onClick={onRemove}
          title="Remove event"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-fg-subtle hover:text-err"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* actions */}
      <div className="mt-2 space-y-2 border-l border-border pl-2.5">
        {handler.actions.map((a) => (
          <ActionRow
            key={a.id}
            action={a}
            onChange={(patch) => setAction(a.id, patch)}
            onRemove={() => removeAction(a.id)}
          />
        ))}
        <button onClick={addAction} className="flex items-center gap-1 text-[12px] text-accent hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add action
        </button>
      </div>

      {/* summary */}
      <p className="mt-2 truncate border-t border-border pt-2 text-[11px] text-fg-subtle">
        {summarizeHandler(handler)}
      </p>
    </div>
  );
}

function ActionRow({
  action,
  onChange,
  onRemove,
}: {
  action: EventAction;
  onChange: (patch: Partial<EventAction>) => void;
  onRemove: () => void;
}) {
  const def = actionTypeByKey(action.type);
  const Icon = getIcon(def?.icon ?? "Box");

  const setField = (key: string, value: string) =>
    onChange({ config: { ...action.config, [key]: value } });

  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-fg-muted" />
        <select
          value={action.type}
          onChange={(e) => onChange({ type: e.target.value, config: {} })}
          className="min-w-0 flex-1 rounded border border-border bg-bg px-1.5 py-1 text-[12px] text-fg outline-none"
        >
          {ACTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={onRemove}
          title="Remove action"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-fg-subtle hover:text-err"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {def && def.configFields.length > 0 && (
        <div className="mt-2 space-y-2">
          {def.configFields.map((f) => (
            <ConfigField
              key={f.key}
              field={f}
              value={action.config[f.key] ?? ""}
              onChange={(v) => setField(f.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: ActionConfigField;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputCls =
    "w-full rounded border border-border bg-bg px-1.5 py-1 text-[12px] text-fg outline-none";

  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] text-fg-muted">
        {field.label}
        {field.required && <span className="text-err">*</span>}
      </span>
      {field.type === "boolean" ? (
        <label className="flex items-center gap-2 text-[12px] text-fg">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="accent-[var(--accent)]"
          />
          <span className="text-fg-muted">{value === "true" ? "Yes" : "No"}</span>
        </label>
      ) : field.type === "enum" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">—</option>
          {field.values?.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ) : field.type === "richtext" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-16 w-full resize-none rounded border border-border bg-bg px-1.5 py-1 text-[12px] text-fg outline-none"
        />
      ) : field.type === "number" ? (
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : field.type === "map" ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="key=val, key=val"
          className={cn(inputCls, "font-mono")}
        />
      ) : field.type === "ref" ? (
        <div className="flex items-center gap-1.5">
          <input value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "flex-1")} />
          {field.refKind && (
            <span className="shrink-0 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] text-fg-subtle">
              {field.refKind}
            </span>
          )}
        </div>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </label>
  );
}

function RecipePicker({
  onPick,
  onClose,
}: {
  onPick: (r: EventRecipe) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const filtered = EVENT_RECIPES.filter(
    (r) =>
      (cat === "All" || r.category === cat) &&
      (!q ||
        r.label.toLowerCase().includes(q.toLowerCase()) ||
        r.description.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div className="rounded-md border border-border-strong bg-bg p-2">
      <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
        <Search className="h-3.5 w-3.5 text-fg-subtle" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recipes…"
          className="flex-1 bg-transparent text-[12px] text-fg outline-none"
        />
        <button onClick={onClose} className="text-[11px] text-fg-muted hover:text-fg">
          close
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {["All", ...RECIPE_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px]",
              cat === c ? "border-accent bg-accent/10 text-accent" : "border-border text-fg-muted hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="max-h-[280px] space-y-1 overflow-y-auto">
        {filtered.map((r) => {
          const Icon = getIcon(r.icon);
          return (
            <button
              key={r.id}
              onClick={() => onPick(r)}
              className="flex w-full items-start gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-left hover:border-accent"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium text-fg">{r.label}</span>
                <span className="block text-[11px] text-fg-subtle">{r.description}</span>
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-[12px] text-fg-muted">No recipes match.</p>
        )}
      </div>
    </div>
  );
}
