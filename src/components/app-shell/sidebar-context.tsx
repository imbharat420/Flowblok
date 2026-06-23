"use client";

import { createContext, useContext, useState } from "react";

// Shared open/close state for the mobile sidebar drawer. The Sidebar lives in
// the (app) layout while the Topbar (which holds the hamburger) is rendered
// per-page, so they coordinate through this context. On md+ the sidebar is
// always visible and this state is inert.
const SidebarContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
