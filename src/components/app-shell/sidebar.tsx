"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUP_LABELS, NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "./sidebar-context";
import { SpaceSwitcher } from "./space-switcher";

const GROUP_ORDER: NavItem["group"][] = ["workspace", "build", "data", "grow", "system"];

export function Sidebar() {
  const pathname = usePathname();
  const { can } = useAuth();
  const { open, setOpen } = useSidebar();
  // Only show modules the current role is allowed to manage (super admin sees all).
  const visible = NAV.filter((n) => can(n.capability));

  // Close the mobile drawer whenever navigation lands on a new route.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      {/* dim backdrop behind the drawer on mobile / tablet */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
      {/* Notion-style multi-space switcher */}
      <SpaceSwitcher />

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {GROUP_ORDER.filter((g) => visible.some((n) => n.group === g)).map((group) => (
          <div key={group} className="mb-4">
            <p className="label-caps px-2.5 pb-1.5 pt-2">{GROUP_LABELS[group]}</p>
            {visible.filter((n) => n.group === group).map((item) => {
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
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      </aside>
    </>
  );
}
