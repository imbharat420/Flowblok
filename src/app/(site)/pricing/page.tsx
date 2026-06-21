import Link from "next/link";
import { Check, Minus, ArrowUpRight } from "lucide-react";
import { Reveal, Magnetic } from "../_components/fx";
import { PricingPlans } from "../_components/pricing-plans";

export const metadata = {
  title: "Pricing — Flowblok",
  description: "Simple, transparent pricing. Start free and scale to enterprise with SSO, SOC 2 and a 99.99% SLA.",
};

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "Content types", values: ["3", "Unlimited", "Unlimited"] },
  { label: "Editors", values: ["2", "Unlimited", "Unlimited"] },
  { label: "Workflows & automation", values: [false, true, true] },
  { label: "Localization", values: [false, true, true] },
  { label: "Role-based access", values: [false, true, true] },
  { label: "Version history", values: ["7 days", "90 days", "Unlimited"] },
  { label: "SSO & SCIM", values: [false, false, true] },
  { label: "Audit logs", values: [false, false, true] },
  { label: "Uptime SLA", values: ["—", "99.9%", "99.99%"] },
  { label: "Support", values: ["Community", "Priority", "Dedicated"] },
];

const FAQ = [
  { q: "Is there really a free tier?", a: "Yes — Starter is free forever for small projects, with full API access and no credit card required." },
  { q: "How does per-editor pricing work?", a: "You only pay for teammates who edit content. Developers using API keys and read-only viewers are always free." },
  { q: "Can I switch plans anytime?", a: "Absolutely. Upgrade, downgrade or cancel at any time — changes are prorated automatically." },
  { q: "Do you offer non-profit or startup discounts?", a: "We do. Reach out and we'll get you set up with a discounted Business plan." },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-12 pt-40 text-center md:pt-48">
        <span className="aura left-1/2 top-16 h-[420px] w-[420px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-[800px]">
          <Reveal><p className="kicker">Pricing</p></Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-5 max-w-[16ch] font-display text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.98]">
              Pricing that scales with <span className="text-brand">you</span>.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-[50ch] text-[clamp(1rem,2vw,1.15rem)] text-[var(--ink-dim)]">
              Start free, invite your team, and only pay for what you use. No surprises, cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-[1180px]">
          <PricingPlans />
        </div>
      </section>

      {/* comparison */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1000px]">
          <Reveal className="text-center">
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)]">Compare plans</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 overflow-hidden rounded-2xl" style={{ border: "1px solid var(--line)" }}>
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--line)]" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th className="p-4 font-normal text-[var(--ink-dim)]">Feature</th>
                    {["Starter", "Business", "Enterprise"].map((h) => (
                      <th key={h} className="p-4 text-center font-display text-[15px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--line)] last:border-0">
                      <td className="p-4 text-[var(--ink)]">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="p-4 text-center">
                          {typeof v === "boolean" ? (
                            v ? <Check className="mx-auto h-4 w-4 text-[var(--a3)]" /> : <Minus className="mx-auto h-4 w-4 text-[var(--ink-faint)]" />
                          ) : (
                            <span className="text-[var(--ink-dim)]">{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* faq */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-[820px]">
          <Reveal className="text-center"><h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)]">Questions, answered</h2></Reveal>
          <div className="mt-10 space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 70} style={{ display: "block" }}>
                <details className="group panel p-5 [&_summary]:cursor-pointer">
                  <summary className="flex list-none items-center justify-between font-display text-[16px] text-[var(--ink)]">
                    {f.q}
                    <span className="text-[var(--ink-faint)] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-dim)]">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(1.8rem,4.5vw,3rem)]">Ready when you are.</h2>
          <Magnetic className="mt-8 inline-block">
            <Link href="/register" data-cursor className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-medium">
              Start free <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </Reveal>
      </section>
    </>
  );
}
