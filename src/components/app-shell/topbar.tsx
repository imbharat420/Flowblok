"use client";

import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ShieldCheck,
  Check,
  Settings,
  LogOut,
  FileText,
  Component,
  Database,
  Workflow,
  ShoppingBag,
  Boxes,
  Inbox,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommandPalette } from "./command-palette";
import { useAuth } from "@/lib/auth-context";
import { useSpaces } from "@/lib/space-context";
import { ROLES, ROLE_LABEL, isSuperAdmin } from "@/lib/rbac";
import { cn } from "@/lib/cn";

// Global "quick create" shortcuts — each jumps to the module where that thing
// is created, so the topbar "+ Create" is a real launcher instead of a dead end.
const CREATE_ITEMS = [
  { label: "New page", href: "/pages", icon: FileText },
  { label: "New component", href: "/components", icon: Component },
  { label: "New table", href: "/database", icon: Database },
  { label: "New workflow", href: "/workflows", icon: Workflow },
  { label: "New product", href: "/commerce", icon: ShoppingBag },
  { label: "New space", href: "/spaces", icon: Boxes },
] as const;

// No seeded notifications — populated by real activity.
const NOTIFICATIONS: { id: string; title: string; time: string }[] = [];

export function Topbar({ title, breadcrumb }: { title: string; breadcrumb?: string[] }) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [roleOpen, setRoleOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const { user, setRole } = useAuth();
  const { current } = useSpaces();
  // The leading breadcrumb is the active space. The legacy "Acme Digital"
  // placeholder passed by pages is dropped so a fresh/empty account shows none.
  const crumbs = current?.name ? [current.name] : (breadcrumb ?? []).filter((c) => c !== "Acme Digital");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    setRoleOpen(false);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "fb_role=; path=/; max-age=0; samesite=lax";
    router.push("/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-5">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        {crumbs.map((b) => (
          <span key={b} className="flex items-center gap-2 text-fg-muted">
            {b}
            <span className="text-fg-subtle">/</span>
          </span>
        ))}
        <span className="truncate font-medium text-fg">{title}</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setPaletteOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search or run a command</span>
        <kbd className="ml-2 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
          ⌘K
        </kbd>
      </button>

      <button
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen((v) => !v);
            setNotifRead(true);
          }}
          className="relative grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {!notifRead && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-[13px] font-medium text-fg">Notifications</span>
                <span className="text-[11px] text-fg-subtle">{NOTIFICATIONS.length} recent</span>
              </div>
              {NOTIFICATIONS.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 px-3 py-8 text-center">
                  <Inbox className="h-5 w-5 text-fg-subtle" />
                  <p className="text-[12px] text-fg-muted">You&apos;re all caught up</p>
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto p-1">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.id} className="rounded-md px-2.5 py-2 hover:bg-surface-2">
                      <p className="text-[12.5px] leading-snug text-fg">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-fg-subtle">{n.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick create */}
      <div className="relative">
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
        {createOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCreateOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border border-border-strong bg-surface p-1 shadow-xl">
              {CREATE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg"
                  >
                    <Icon className="h-3.5 w-3.5" /> {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* role switcher — preview the app as any role; Owner = super admin */}
      <div className="relative">
        <button
          onClick={() => setRoleOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-left transition-colors hover:border-border-strong"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-fg">
            {user.name.charAt(0)}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[12px] font-medium text-fg">{user.name.split(" ")[0]}</span>
            <span className="flex items-center gap-1 text-[10px] text-fg-muted">
              {isSuperAdmin(user.role) && <ShieldCheck className="h-2.5 w-2.5 text-accent" />}
              {ROLE_LABEL[user.role]}
            </span>
          </span>
        </button>
        {roleOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setRoleOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-xl">
              {/* account header */}
              <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-semibold text-accent-fg">
                  {user.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-fg">{user.name}</span>
                  <span className="block truncate text-[11px] text-fg-muted">{user.email}</span>
                </span>
              </div>
              <div className="p-1">
                <Link
                  href="/account"
                  onClick={() => setRoleOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  <Settings className="h-3.5 w-3.5" /> Account settings
                </Link>
              </div>
              <div className="border-t border-border" />
              <p className="label-caps px-3 pb-1 pt-2.5">View as role</p>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setRoleOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px]",
                    user.role === r ? "bg-surface-3 text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {isSuperAdmin(r) && <ShieldCheck className="h-3.5 w-3.5 text-accent" />}
                  <span className="flex-1">{ROLE_LABEL[r]}</span>
                  {user.role === r && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              ))}
              <div className="mt-1 border-t border-border p-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
