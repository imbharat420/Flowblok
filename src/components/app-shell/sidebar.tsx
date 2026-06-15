"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUP_LABELS, NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { ChevronsUpDown } from "lucide-react";

const GROUP_ORDER: NavItem["group"][] = ["workspace", "build", "data", "grow", "system"];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface">
      {/* org / space switcher */}
      <button className="m-2 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] font-semibold text-accent-fg">
          A
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">Acme Digital</span>
          <span className="block truncate text-[11px] text-fg-muted">Professional plan</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-fg-subtle" />
      </button>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {GROUP_ORDER.map((group) => (
          <div key={group} className="mb-4">
            <p className="label-caps px-2.5 pb-1.5 pt-2">{GROUP_LABELS[group]}</p>
            {NAV.filter((n) => n.group === group).map((item) => {
              const href = `/${item.slug}`;
              const active = pathname === href || pathname.startsWith(href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-surface-3 font-medium text-fg"
                      : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {!item.ready && (
                    <span className="rounded bg-surface-3 px-1 text-[9px] font-medium uppercase tracking-wide text-fg-subtle">
                      soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
