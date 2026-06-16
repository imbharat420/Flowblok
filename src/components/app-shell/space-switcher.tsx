"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSpaces, spaceColor } from "@/lib/space-context";
import { cn } from "@/lib/cn";
import { ChevronsUpDown, Check, Plus, Settings, Boxes, Loader2 } from "lucide-react";

function Avatar({ id, name, size = 28 }: { id: string; name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-md font-semibold text-white"
      style={{ width: size, height: size, background: spaceColor(id), fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function SpaceSwitcher() {
  const { spaces, current, switchSpace, createSpace } = useSpaces();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: string) => {
    switchSpace(id);
    setOpen(false);
    router.push("/dashboard");
  };

  const submitCreate = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    const s = await createSpace(newName.trim());
    setBusy(false);
    if (s) {
      setNewName("");
      setCreating(false);
      setOpen(false);
      router.push("/dashboard");
    }
  };

  return (
    <div ref={ref} className="relative m-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
      >
        {current ? <Avatar id={current.id} name={current.name} /> : <span className="h-7 w-7 rounded-md bg-surface-3" />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">{current?.name ?? "Loading…"}</span>
          <span className="block truncate text-[11px] text-fg-muted">{current ? `${current.plan} plan` : ""}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl">
          {/* current space header */}
          {current && (
            <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
              <Avatar id={current.id} name={current.name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-fg">{current.name}</p>
                <p className="truncate text-[11px] text-fg-muted">{current.plan} · {current.members} members</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
                title="Space settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* space list */}
          <div className="max-h-[280px] overflow-y-auto p-1.5">
            <p className="label-caps px-2 pb-1 pt-1.5">Spaces</p>
            {spaces.map((s) => (
              <button
                key={s.id}
                onClick={() => pick(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px]",
                  s.id === current?.id ? "bg-surface-3 text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Avatar id={s.id} name={s.name} size={22} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">{s.name}</span>
                  <span className="block truncate text-[11px] text-fg-subtle">{s.plan}</span>
                </span>
                {s.id === current?.id && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </button>
            ))}

            {creating ? (
              <div className="mt-1 flex items-center gap-1.5 px-1">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitCreate()}
                  placeholder="New space name…"
                  className="min-w-0 flex-1 rounded border border-border bg-bg px-2 py-1 text-[13px] text-fg outline-none"
                />
                <button onClick={submitCreate} disabled={busy} className="grid h-7 w-7 place-items-center rounded bg-accent text-accent-fg">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="mt-0.5 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-accent hover:bg-surface-2"
              >
                <span className="grid h-[22px] w-[22px] place-items-center rounded-md border border-dashed border-border">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                New space
              </button>
            )}
          </div>

          <div className="border-t border-border p-1.5">
            <Link
              href="/spaces"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <Boxes className="h-4 w-4" /> Manage all spaces
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
