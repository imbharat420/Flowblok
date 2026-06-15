"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { CornerDownLeft } from "lucide-react";

// Command palette stub — Cmd/Ctrl+K. In the full product this EXECUTES actions
// (move cards, set properties, trigger AI), per 04-FRONTEND-SPEC.md. Here it navigates.
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const items = NAV.map((n) => ({ label: `Go to ${n.label}`, slug: n.slug, icon: n.icon }));
    if (!query) return items;
    return items.filter((i) => i.label.toLowerCase().includes(query));
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter" && results[active]) {
        router.push(`/${results[active].slug}`);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          placeholder="Search or run a command…"
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle"
        />
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-fg-muted">No results</p>
          )}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={r.slug}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  router.push(`/${r.slug}`);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px]",
                  i === active ? "bg-surface-3 text-fg" : "text-fg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{r.label}</span>
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-fg-subtle" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
