"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, Menu, X, ArrowUpRight } from "lucide-react";
import { Magnetic } from "./fx";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[65] flex justify-center px-4 pt-4">
      <nav
        className="pointer-events-auto flex w-full max-w-[1180px] items-center gap-2 rounded-full px-3 py-2 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(10,12,16,0.72)" : "rgba(10,12,16,0.18)",
          border: `1px solid ${scrolled ? "var(--line-strong)" : "var(--line)"}`,
          backdropFilter: "blur(16px)",
          boxShadow: scrolled ? "0 12px 40px -16px rgba(0,0,0,0.8)" : "none",
        }}
      >
        <Link href="/" className="group flex items-center gap-2 pl-1.5 pr-3" data-cursor>
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-white"
            style={{ background: "var(--grad-brand)" }}
          >
            <Boxes className="h-4 w-4" />
          </span>
          <span className="font-display text-[16px] tracking-tight text-[var(--ink)]">Flowblok</span>
        </Link>

        <div className="mx-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-cursor
                className="relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors"
                style={{ color: active ? "var(--ink)" : "var(--ink-dim)" }}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                )}
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/login" data-cursor className="rounded-full px-3.5 py-1.5 text-[13px] text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]">
            Sign in
          </Link>
          <Magnetic>
            <Link
              href="/register"
              data-cursor
              className="btn-brand flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium"
            >
              Start free <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] md:hidden"
          style={{ border: "1px solid var(--line-strong)" }}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {open && (
        <div className="pointer-events-auto fixed inset-x-4 top-20 z-[64] rounded-2xl p-3 md:hidden" style={{ background: "rgba(12,14,18,0.96)", border: "1px solid var(--line-strong)", backdropFilter: "blur(16px)" }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 text-[15px] text-[var(--ink)] hover:bg-white/5">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-3">
            <Link href="/login" className="rounded-full py-2.5 text-center text-[14px] btn-ghost text-[var(--ink)]">
              Sign in
            </Link>
            <Link href="/register" className="btn-brand py-2.5 text-center text-[14px] font-medium">
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
