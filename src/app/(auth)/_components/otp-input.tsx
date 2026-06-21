"use client";

import { useRef } from "react";

// Six-box OTP entry with auto-advance, backspace, arrow keys and paste support.
export function OtpInput({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setAt = (i: number, ch: string) => {
    const next = value.split("");
    next[i] = ch;
    const joined = next.join("").replace(/\s/g, " ").slice(0, 6);
    const clean = joined.replace(/\s+$/g, "");
    onChange(clean);
    if (clean.replace(/\s/g, "").length === 6 && /^\d{6}$/.test(clean)) onComplete?.(clean);
  };

  const onInput = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    if (!ch) return;
    setAt(i, ch);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i].trim()) {
        setAt(i, " ");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, " ");
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    onChange(text);
    refs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) onComplete?.(text);
  };

  return (
    <div className="flex gap-2.5" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-14 w-12 rounded-xl text-center font-display text-[22px] text-[var(--ink)] outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${d.trim() ? "rgba(124,92,255,0.6)" : "var(--line-strong)"}`,
          }}
        />
      ))}
    </div>
  );
}
