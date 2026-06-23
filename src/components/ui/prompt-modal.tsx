"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// Minimal single-field create modal. Mirrors the CreateSpaceModal pattern so
// every "New …" action across the app behaves the same: type a name, Enter to
// confirm, Escape to dismiss.
export function PromptModal({
  title,
  label,
  placeholder,
  submitLabel = "Create",
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  placeholder?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[16vh]" onClick={onClose}>
      <div
        className="w-full max-w-[440px] rounded-lg border border-border-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[14px] font-medium text-fg">{title}</h2>
        </div>
        <div className="space-y-3 p-4 text-[13px]">
          <label className="block">
            <span className="mb-1 block text-[12px] text-fg-muted">{label}</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={placeholder}
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" disabled={!value.trim()} onClick={submit}>
            <Check className="h-3.5 w-3.5" /> {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
