import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between">
        <p className="label-caps">{label}</p>
        {Icon && <Icon className="h-3.5 w-3.5 text-fg-subtle" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="nums text-2xl font-semibold text-fg">{value}</span>
        {delta && (
          <span className={cn("text-[12px] font-medium", delta.positive ? "text-ok" : "text-fg-muted")}>
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
