"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MailCheck, Loader2, ArrowRight, AlertCircle, Info } from "lucide-react";
import { OtpInput } from "../_components/otp-input";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem("flowblok_otp_email"));
    const h = sessionStorage.getItem("flowblok_otp_hint");
    setHint(h && h !== "undefined" ? h : "");
  }, []);

  const verify = async (value: string) => {
    if (!email || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: value }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setBusy(false);
      setError(data?.error ?? "Verification failed.");
      return;
    }
    sessionStorage.removeItem("flowblok_otp_email");
    sessionStorage.removeItem("flowblok_otp_mode");
    sessionStorage.removeItem("flowblok_otp_hint");
    router.push("/dashboard");
  };

  const resend = async () => {
    if (!email) return;
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      if (data.devCode) {
        setHint(data.devCode);
        sessionStorage.setItem("flowblok_otp_hint", data.devCode);
      }
      setResent(true);
      setError("");
      setTimeout(() => setResent(false), 2500);
    } else if (data?.error) {
      setError(data.error);
    }
  };

  if (email === null) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <p className="font-display text-[22px]">No verification in progress</p>
        <p className="mt-2 text-[14px] text-[var(--ink-dim)]">Start by creating an account or signing in.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register" className="btn-brand px-5 py-2.5 text-[14px] font-medium">Create account</Link>
          <Link href="/login" className="btn-ghost px-5 py-2.5 text-[14px] text-[var(--ink)]">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <span className="fade-up grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: "var(--grad-brand)" }}>
        <MailCheck className="h-6 w-6" />
      </span>
      <h1 className="fade-up mt-6 font-display text-[30px] tracking-tight" style={{ ["--d" as string]: "40ms" }}>
        Check your inbox
      </h1>
      <p className="fade-up mt-2 text-[14px] leading-relaxed text-[var(--ink-dim)]" style={{ ["--d" as string]: "90ms" }}>
        We sent a 6-digit code to <span className="text-[var(--ink)]">{email}</span>. Enter it below to continue.
      </p>

      {hint && (
        <p className="fade-up mt-5 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "rgba(34,211,238,0.08)", color: "#a5f3fc", border: "1px solid rgba(34,211,238,0.2)", ["--d" as string]: "120ms" }}>
          <Info className="h-4 w-4 shrink-0" />
          Demo mode — no email is sent. Your code is{" "}
          <span className="font-mono-site font-semibold tracking-widest text-white">{hint}</span>
        </p>
      )}

      <div className="fade-up mt-7" style={{ ["--d" as string]: "160ms" }}>
        <OtpInput value={code} onChange={setCode} onComplete={verify} />
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}>
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <button
        onClick={() => verify(code)}
        disabled={busy || code.replace(/\s/g, "").length !== 6}
        className="fade-up btn-brand mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-[15px] font-medium disabled:opacity-50"
        style={{ ["--d" as string]: "220ms" }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & continue <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="fade-up mt-5 text-center text-[13px] text-[var(--ink-faint)]" style={{ ["--d" as string]: "280ms" }}>
        Didn&apos;t get it?{" "}
        <button onClick={resend} className="text-[var(--a3)] underline-offset-4 hover:underline">
          {resent ? "New code sent ✓" : "Resend code"}
        </button>
      </p>
    </div>
  );
}
