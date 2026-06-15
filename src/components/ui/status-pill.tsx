import { cn } from "@/lib/cn";
import type { ContentStatus } from "@/lib/types";

const MAP: Record<ContentStatus, { label: string; dot: string; text: string }> = {
  published: { label: "Published", dot: "bg-ok", text: "text-ok" },
  review: { label: "In review", dot: "bg-warn", text: "text-warn" },
  draft: { label: "Draft", dot: "bg-fg-subtle", text: "text-fg-muted" },
};

// Status is encoded with BOTH color and a label (never color alone) — a11y rule from the design system.
export function StatusPill({ status }: { status: ContentStatus }) {
  const s = MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium">
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      <span className={s.text}>{s.label}</span>
    </span>
  );
}
