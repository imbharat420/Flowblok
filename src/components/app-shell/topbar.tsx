"use client";

import { Search, Bell, Sun, Moon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CommandPalette } from "./command-palette";

export function Topbar({ title, breadcrumb }: { title: string; breadcrumb?: string[] }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-5">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        {breadcrumb?.map((b) => (
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

      <button
        className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>

      <button className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover">
        <Plus className="h-3.5 w-3.5" />
        Create
      </button>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
