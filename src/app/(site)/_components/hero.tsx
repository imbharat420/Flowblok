"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Play, Sparkles } from "lucide-react";
import { ParticleField } from "./particle-field";
import { Magnetic } from "./fx";

const HEAD_1 = ["Content", "infrastructure"];
const HEAD_2 = ["for", "teams", "that", "ship."];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-kicker", { y: 16, opacity: 0, duration: 0.6 })
        .from(".hero-word", { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.06 }, "-=0.3")
        .from(".hero-sub", { y: 18, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-cta", { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.45")
        .from(".hero-proof", { opacity: 0, duration: 0.8 }, "-=0.3")
        .from(panel.current, { y: 60, opacity: 0, rotateX: 12, duration: 1.1 }, "-=0.9");

      // scroll parallax on the product panel
      gsap.to(panel.current, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden px-6 pb-24 pt-40 md:pt-48">
      <ParticleField className="absolute inset-0 h-full w-full opacity-70" />
      <div className="blueprint absolute inset-0 -z-0" />
      <span className="aura -left-40 top-10 h-[520px] w-[520px]" />
      <span className="aura -right-32 top-40 h-[420px] w-[420px]" style={{ animationDelay: "-6s", background: "radial-gradient(circle at 50% 50%, rgba(124,92,255,0.5), transparent 70%)" }} />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="hero-kicker mx-auto mb-7 flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[12px]" style={{ border: "1px solid var(--line-strong)", background: "rgba(255,255,255,0.03)" }}>
          <Sparkles className="h-3.5 w-3.5 text-[var(--a3)]" />
          <span className="text-[var(--ink-dim)]">New — AI content workflows & visual editing</span>
        </div>

        <h1 className="mx-auto max-w-[16ch] text-center font-display text-[clamp(2.6rem,8vw,6.2rem)] leading-[0.95]">
          <span className="block overflow-hidden">
            {HEAD_1.map((w) => (
              <span key={w} className="hero-word mr-[0.2em] inline-block text-grad">{w}</span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {HEAD_2.map((w) => (
              <span key={w} className="hero-word mr-[0.2em] inline-block">{w}</span>
            ))}
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-7 max-w-[58ch] text-center text-[clamp(1rem,2.2vw,1.25rem)] leading-relaxed text-[var(--ink-dim)]">
          Model any content, edit it visually, automate it with workflows, and deliver it to every
          channel through a single API. The headless CMS your developers and marketers actually agree on.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic className="hero-cta">
            <Link href="/register" data-cursor className="btn-brand flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium">
              Start building free <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Magnetic>
          <Link href="/features" data-cursor className="hero-cta btn-ghost flex items-center gap-2 px-6 py-3.5 text-[15px] text-[var(--ink)]">
            <Play className="h-4 w-4" /> See the platform
          </Link>
        </div>

        <p className="hero-proof mt-6 text-center text-[12px] text-[var(--ink-faint)]">
          No credit card · 14-day Business trial · SOC 2-ready
        </p>

        {/* product panel — tilted browser mock */}
        <div className="hero-proof mt-16 [perspective:1600px]">
          <div
            ref={panel}
            className="panel mx-auto max-w-[980px] overflow-hidden"
            style={{ transform: "rotateX(8deg)", transformStyle: "preserve-3d", boxShadow: "0 60px 120px -40px rgba(0,0,0,0.8)" }}
          >
            <div className="flex items-center gap-1.5 border-b border-[var(--line)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono-site text-[11px] text-[var(--ink-faint)]">app.flowblok.com/content</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-0">
              <div className="hidden border-r border-[var(--line)] p-4 sm:block">
                {["Content", "Components", "Workflows", "Assets", "APIs", "Analytics"].map((s, i) => (
                  <div key={s} className="mb-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px]" style={{ background: i === 0 ? "rgba(255,255,255,0.06)" : "transparent", color: i === 0 ? "var(--ink)" : "var(--ink-dim)" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: i === 0 ? "var(--a1)" : "var(--ink-faint)" }} />
                    {s}
                  </div>
                ))}
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-32 rounded-full bg-white/10" />
                  <div className="h-7 w-24 rounded-full" style={{ background: "var(--grad-brand)", opacity: 0.85 }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-[var(--line)] p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="mb-2 h-16 rounded-lg" style={{ background: `linear-gradient(135deg, rgba(59,108,255,${0.25 - i * 0.02}), rgba(124,92,255,0.12))` }} />
                      <div className="mb-1.5 h-2.5 w-3/4 rounded-full bg-white/12" />
                      <div className="h-2 w-1/2 rounded-full bg-white/7" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
