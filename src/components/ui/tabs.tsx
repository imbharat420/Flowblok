"use client";

import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export interface TabDef {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[13px] font-medium transition-colors",
              active === t.key ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {t.label}
            {active === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}
