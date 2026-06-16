"use client";

import { useEffect, useState } from "react";
import type { DataBinding } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type Source = DataBinding["source"];

const SOURCES: { key: Source; label: string; hint: string }[] = [
  { key: "static", label: "Static", hint: "Hard-coded content entered in Design." },
  { key: "database", label: "Database", hint: "Pick a table; fields auto-load and map." },
  { key: "api", label: "API", hint: "Bind to an auto-generated endpoint." },
  { key: "workflow", label: "Workflow", hint: "Render the output of a workflow run." },
  { key: "ai", label: "AI", hint: "Generate content from a prompt." },
  { key: "crm", label: "CRM", hint: "Pull leads, contacts, companies or deals." },
  { key: "commerce", label: "Commerce", hint: "Bind to products or orders." },
];

const CRM_ENTITIES = [
  { ref: "leads", label: "Leads" },
  { ref: "contacts", label: "Contacts" },
  { ref: "companies", label: "Companies" },
  { ref: "deals", label: "Deals (pipeline)" },
];

interface Option {
  ref: string;
  label: string;
}

// Fetches the real options for each source so a block can REFERENCE actual flows.
async function fetchOptions(source: Source): Promise<Option[]> {
  switch (source) {
    case "database": {
      const d = await fetch("/api/database/tables").then((r) => r.json());
      return (d.items ?? []).map((t: { id: string; name: string }) => ({ ref: t.id, label: t.name }));
    }
    case "workflow": {
      const d = await fetch("/api/workflows").then((r) => r.json());
      return (d.items ?? []).map((w: { id: string; name: string }) => ({ ref: w.id, label: w.name }));
    }
    case "api": {
      const d = await fetch("/api/apis").then((r) => r.json());
      return (d.items ?? []).map((e: { id: string; method: string; path: string }) => ({
        ref: e.id,
        label: `${e.method} ${e.path}`,
      }));
    }
    case "commerce": {
      const d = await fetch("/api/commerce/products").then((r) => r.json());
      return (d.items ?? []).map((p: { id: string; name: string }) => ({ ref: p.id, label: p.name }));
    }
    case "crm":
      return CRM_ENTITIES;
    default:
      return [];
  }
}

export function DataBinder({
  binding,
  onChange,
}: {
  binding: DataBinding | undefined;
  onChange: (b: DataBinding) => void;
}) {
  const source: Source = binding?.source ?? "static";
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (source === "static" || source === "ai") {
      setOptions([]);
      return;
    }
    setLoading(true);
    fetchOptions(source).then((opts) => {
      if (alive) {
        setOptions(opts);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [source]);

  const pick = (s: Source) => onChange({ source: s });
  const active = SOURCES.find((s) => s.key === source)!;

  return (
    <div className="space-y-3 text-[13px]">
      <p className="text-fg-muted">Bind this block to a data source — no code.</p>

      <div className="space-y-1.5">
        {SOURCES.map((s) => (
          <label
            key={s.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2",
              source === s.key ? "border-accent bg-accent/10" : "border-border bg-bg hover:border-border-strong",
            )}
          >
            <input
              type="radio"
              name="data-source"
              checked={source === s.key}
              onChange={() => pick(s.key)}
              className="accent-[var(--accent)]"
            />
            <span className="text-fg">{s.label}</span>
          </label>
        ))}
      </div>

      {/* source-specific configuration */}
      {source === "ai" ? (
        <div className="rounded-md border border-border bg-bg p-2.5">
          <p className="mb-1.5 text-[12px] text-fg-muted">Prompt</p>
          <textarea
            value={binding?.prompt ?? ""}
            onChange={(e) => onChange({ source: "ai", prompt: e.target.value })}
            placeholder="e.g. Summarize the latest 3 blog posts as cards"
            className="h-20 w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
          />
        </div>
      ) : source !== "static" ? (
        <div className="rounded-md border border-border bg-bg p-2.5">
          <p className="mb-1.5 text-[12px] text-fg-muted">
            {source === "database" ? "Table" : source === "workflow" ? "Workflow" : source === "api" ? "Endpoint" : source === "commerce" ? "Product / collection" : "Entity"}
          </p>
          {loading ? (
            <span className="flex items-center gap-2 text-[12px] text-fg-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading {source}…
            </span>
          ) : (
            <select
              value={binding?.ref ?? ""}
              onChange={(e) => {
                const opt = options.find((o) => o.ref === e.target.value);
                onChange({ source, ref: opt?.ref, refLabel: opt?.label });
              }}
              className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
            >
              <option value="">Select…</option>
              {options.map((o) => (
                <option key={o.ref} value={o.ref}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {binding?.ref && (
            <p className="mt-2 font-mono text-[11px] text-fg-subtle">
              bound → {source}:{binding.ref}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-2.5 text-[12px] text-fg-subtle">{active.hint}</p>
      )}
    </div>
  );
}
