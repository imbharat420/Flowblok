"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Right-side contextual panel (Radix-free for the viz). Esc closes; backdrop closes.
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-[14px] font-medium text-fg">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
}
