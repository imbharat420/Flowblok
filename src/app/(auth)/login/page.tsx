"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boxes, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Couldn't sign you in.");
      return;
    }
    sessionStorage.setItem("flowblok_otp_email", data.email);
    sessionStorage.setItem("flowblok_otp_mode", "login");
    if (data.devCode) sessionStorage.setItem("flowblok_otp_hint", data.devCode);
    else sessionStorage.removeItem("flowblok_otp_hint");
    router.push("/verify");
  };

  return (
    <div className="w-full max-w-[400px]">
      <span className="fade-up grid h-11 w-11 place-items-center rounded-xl text-white lg:hidden" style={{ background: "var(--grad-brand)" }}>
        <Boxes className="h-5 w-5" />
      </span>
      <h1 className="fade-up mt-6 font-display text-[30px] tracking-tight lg:mt-0" style={{ ["--d" as string]: "40ms" }}>
        Welcome back
      </h1>
      <p className="fade-up mt-2 text-[14px] text-[var(--ink-dim)]" style={{ ["--d" as string]: "90ms" }}>
        New to Flowblok?{" "}
        <Link href="/register" className="text-[var(--a3)] underline-offset-4 hover:underline">Create an account</Link>.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="fade-up" style={{ ["--d" as string]: "140ms" }}>
          <label className="mb-1.5 block text-[12px] text-[var(--ink-dim)]">Email</label>
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
        </div>
        <div className="fade-up" style={{ ["--d" as string]: "190ms" }}>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[12px] text-[var(--ink-dim)]">Password</label>
            <span className="text-[12px] text-[var(--ink-faint)]">Forgot?</span>
          </div>
          <div className="relative">
            <input className="field pr-11" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink)]">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}>
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="fade-up btn-brand flex w-full items-center justify-center gap-2 py-3.5 text-[15px] font-medium disabled:opacity-60" style={{ ["--d" as string]: "250ms" }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue with email <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="fade-up mt-6 text-center text-[12px] text-[var(--ink-faint)]" style={{ ["--d" as string]: "320ms" }}>
        We&apos;ll send a 6-digit code to verify it&apos;s you.
      </p>
    </div>
  );
}
