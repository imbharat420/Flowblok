"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentDef } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Search, X } from "lucide-react";

// Relocated "Add block" — a centered, searchable picker (no longer an inline panel),
// so the layers/canvas get the full page. Storyblok-style insert experience.
export function BlockPicker({
  open,
  registry,
  onPick,
  onClose,
  contextLabel,
}: {
  open: boolean;
  registry: ComponentDef[];
  onPick: (name: string) => void;
  onClose: () => void;
  contextLabel?: string;
}) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? registry.filter((c) => c.label.toLowerCase().includes(query) || c.name.includes(query))
      : registry;
    const map = new Map<string, ComponentDef[]>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return [...map.entries()];
  }, [registry, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]" onClick={onClose}>
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
          <Search className="h-4 w-4 text-fg-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={contextLabel ? `Add block to ${contextLabel}…` : "Search blocks…"}
            className="flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-subtle"
          />
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {groups.length === 0 && <p className="py-8 text-center text-[13px] text-fg-muted">No blocks match.</p>}
          {groups.map(([cat, items]) => (
            <div key={cat} className="mb-4 last:mb-0">
              <p className="label-caps mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => onPick(c.name)}
                    className={cn(
                      "rounded-md border border-border bg-bg px-3 py-2.5 text-left transition-colors",
                      "hover:border-accent hover:bg-surface-2",
                    )}
                  >
                    <span className="block text-[13px] font-medium text-fg">{c.label}</span>
                    <span className="block truncate font-mono text-[11px] text-fg-subtle">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
