import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "ok" | "warn" | "err" | "info" | "accent";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface text-fg-muted",
  ok: "border-ok/30 bg-ok/10 text-ok",
  warn: "border-warn/30 bg-warn/10 text-warn",
  err: "border-err/30 bg-err/10 text-err",
  info: "border-info/30 bg-info/10 text-info",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

// Status is conveyed with a dot + label (never color alone) for accessibility.
export function Badge({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  const dotColor: Record<BadgeTone, string> = {
    neutral: "bg-fg-subtle",
    ok: "bg-ok",
    warn: "bg-warn",
    err: "bg-err",
    info: "bg-info",
    accent: "bg-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone])} />}
      {children}
    </span>
  );
}
