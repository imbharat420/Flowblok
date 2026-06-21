"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "./fx";

const TIERS = [
  {
    name: "Starter", monthly: 0, annual: 0, note: "for side projects",
    features: ["1 space", "2 editors", "10k API requests / mo", "REST & GraphQL", "Community support"],
    cta: "Start free", highlight: false,
  },
  {
    name: "Business", monthly: 49, annual: 39, note: "per editor / mo",
    features: ["Unlimited content types", "Workflows & automation", "Localization", "Role-based access", "Version history", "Priority support"],
    cta: "Start 14-day trial", highlight: true,
  },
  {
    name: "Enterprise", monthly: null, annual: null, note: "for scale",
    features: ["SSO & SCIM", "SOC 2 + audit logs", "Dedicated infrastructure", "99.99% uptime SLA", "Solutions engineering", "Custom contracts"],
    cta: "Talk to sales", highlight: false,
  },
];

export function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      <Reveal className="flex items-center justify-center gap-3">
        <span className={`text-[13px] ${!annual ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`}>Monthly</span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className="relative h-7 w-13 rounded-full transition-colors"
          style={{ width: 52, background: annual ? "var(--grad-brand)" : "rgba(255,255,255,0.1)" }}
          aria-label="Toggle billing period"
        >
          <span
            className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
            style={{ left: annual ? 26 : 4 }}
          />
        </button>
        <span className={`text-[13px] ${annual ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`}>
          Annual <span className="text-[var(--a3)]">·save 20%</span>
        </span>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {TIERS.map((t, i) => {
          const price = t.monthly === null ? "Custom" : `$${annual ? t.annual : t.monthly}`;
          return (
            <Reveal key={t.name} delay={i * 90} style={{ display: "block" }}>
              <div
                className="panel relative h-full p-7"
                style={t.highlight ? { borderColor: "transparent", boxShadow: "0 0 0 1px rgba(124,92,255,0.5), 0 30px 80px -30px rgba(59,108,255,0.5)" } : undefined}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-medium text-white" style={{ background: "var(--grad-brand)" }}>
                    Most popular
                  </span>
                )}
                <p className="font-display text-[20px]">{t.name}</p>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="font-display text-[44px] leading-none text-grad">{price}</span>
                  <span className="mb-1.5 text-[13px] text-[var(--ink-faint)]">{t.monthly === null ? "" : t.note}</span>
                </div>
                {t.monthly !== null && annual && t.monthly > 0 && (
                  <p className="mt-1 text-[12px] text-[var(--a3)]">billed annually</p>
                )}
                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[var(--ink-dim)]">
                      <Check className="h-4 w-4 shrink-0 text-[var(--a3)]" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.name === "Enterprise" ? "/register" : "/register"}
                  data-cursor
                  className={`mt-7 flex w-full items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium ${t.highlight ? "btn-brand" : "btn-ghost text-[var(--ink)]"}`}
                >
                  {t.cta}
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
