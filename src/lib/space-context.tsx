"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Space } from "@/server/spaces/spaces.types";

// Deterministic avatar color per space (Notion-style colored tiles).
const PALETTE = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#ca8a04", "#dc2626"];
export function spaceColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

interface SpaceValue {
  spaces: Space[];
  current: Space | null;
  loading: boolean;
  switchSpace: (id: string) => void;
  createSpace: (name: string) => Promise<Space | null>;
  refresh: () => Promise<void>;
}

const SpaceContext = createContext<SpaceValue | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const d = await fetch("/api/spaces").then((r) => r.json());
    const items: Space[] = d.items ?? [];
    setSpaces(items);
    setLoading(false);
    return;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Resolve the active space once the list loads (cookie → fallback first).
  useEffect(() => {
    if (!spaces.length) return;
    const fromCookie = readCookie("fb_space");
    const valid = fromCookie && spaces.some((s) => s.id === fromCookie) ? fromCookie : spaces[0].id;
    setCurrentId((prev) => (prev && spaces.some((s) => s.id === prev) ? prev : valid));
  }, [spaces]);

  const switchSpace = useCallback((id: string) => {
    setCurrentId(id);
    document.cookie = `fb_space=${id}; path=/; samesite=lax; max-age=31536000`;
  }, []);

  const createSpace = useCallback(
    async (name: string): Promise<Space | null> => {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      const space = (await res.json()) as Space;
      await refresh();
      switchSpace(space.id);
      return space;
    },
    [refresh, switchSpace],
  );

  const current = spaces.find((s) => s.id === currentId) ?? spaces[0] ?? null;

  return (
    <SpaceContext.Provider value={{ spaces, current, loading, switchSpace, createSpace, refresh }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpaces(): SpaceValue {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpaces must be used within <SpaceProvider>");
  return ctx;
}
