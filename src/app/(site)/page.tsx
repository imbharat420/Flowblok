import Link from "next/link";
import {
  LayoutTemplate, Workflow, Plug, Globe2, Image as ImageIcon, ShieldCheck,
  Languages, GitBranch, Sparkles, Database, Code2, Boxes, ArrowUpRight, Check, Quote,
} from "lucide-react";
import { Hero } from "./_components/hero";
import { Reveal, Marquee, CountUp, TiltCard, SpotlightTracker, Magnetic } from "./_components/fx";

export const metadata = {
  title: "Flowblok — Content infrastructure for teams that ship",
  description:
    "A composable, API-first CMS: model any content, edit it visually, automate it with workflows, and deliver everywhere through one API.",
};

const TRUSTED = ["Northwind", "Lumen", "Vertex", "Cobalt", "Atlas", "Monarch", "Halcyon", "Ardent"];

const FEATURES = [
  { icon: LayoutTemplate, title: "Visual content modeling", body: "Schema-driven content types with nested blocks, references and validation — no migrations, no fear.", span: "lg:col-span-2", id: "modeling" },
  { icon: Workflow, title: "Workflows & automation", body: "Trigger → logic → action. Approvals, webhooks, AI steps and 200+ integrations on a real engine.", id: "workflows" },
  { icon: Plug, title: "Headless APIs", body: "REST & GraphQL, instantly. Strongly typed, globally cached, versioned.", id: "apis" },
  { icon: Globe2, title: "Omnichannel delivery", body: "One source of truth → web, mobile, kiosk, voice. Deliver content anywhere a fetch lives.", span: "lg:col-span-2", id: "channels" },
  { icon: Languages, title: "Localization", body: "Per-field translations, fallbacks and locale workflows built in.", id: "i18n" },
  { icon: ShieldCheck, title: "Roles & governance", body: "Granular permissions, audit trails and SOC 2-ready controls.", id: "governance" },
  { icon: ImageIcon, title: "Asset pipeline", body: "Smart media library with on-the-fly transforms and global CDN.", id: "assets" },
  { icon: Sparkles, title: "AI everywhere", body: "Generate, translate and classify content with agents wired to your data.", id: "ai" },
];

const STATS = [
  { value: 99.99, suffix: "%", decimals: 2, label: "Delivery uptime" },
  { value: 42, suffix: "ms", label: "Median API latency" },
  { value: 200, suffix: "+", label: "Native integrations" },
  { value: 18, suffix: "K", label: "Teams shipping" },
];

const INTEGRATIONS = ["Next.js", "React", "Vue", "Svelte", "Astro", "Shopify", "Stripe", "Slack", "Vercel", "GitHub", "Figma", "Algolia", "Segment", "Postgres", "Webhooks"];

const TESTIMONIALS = [
  { quote: "We cut our content release cycle from days to minutes. The workflow engine alone replaced three tools.", name: "Priya N.", role: "Head of Content, Vertex" },
  { quote: "Finally a CMS our engineers and editors both love. The visual editor is genuinely best-in-class.", name: "Marcus L.", role: "VP Engineering, Cobalt" },
  { quote: "The API is fast, typed and predictable. We modeled our entire commerce catalog in an afternoon.", name: "Sofia R.", role: "Staff Engineer, Atlas" },
];

const TIERS = [
  { name: "Starter", price: "$0", note: "for side projects", features: ["1 space", "2 editors", "REST & GraphQL", "Community support"], cta: "Start free", highlight: false },
  { name: "Business", price: "$49", note: "per editor / mo", features: ["Unlimited content types", "Workflows & automation", "Localization", "Role-based access", "Priority support"], cta: "Start 14-day trial", highlight: true },
  { name: "Enterprise", price: "Custom", note: "for scale", features: ["SSO & SCIM", "SOC 2 + audit logs", "Dedicated infra", "99.99% SLA", "Solutions engineering"], cta: "Talk to sales", highlight: false },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* trusted-by marquee */}
      <section className="border-y border-[var(--line)] py-8">
        <p className="kicker mb-6 text-center">Trusted by content teams at</p>
        <Marquee duration={40}>
          {TRUSTED.map((t) => (
            <span key={t} className="font-display px-8 text-[26px] text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]">
              {t}
            </span>
          ))}
        </Marquee>
      </section>

      {/* feature bento */}
      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <p className="kicker">The platform</p>
            <h2 className="mt-4 max-w-[20ch] font-display text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
              One platform from <span className="text-brand">model</span> to <span className="text-brand">channel</span>.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80} className={f.span ?? ""} style={{ display: "block" }}>
                <SpotlightTracker className="spotlight panel group h-full p-6">
                  <div className="flex h-full flex-col">
                    <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl text-[var(--ink)]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)" }}>
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-[19px] tracking-tight">{f.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-dim)]">{f.body}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-[12px] text-[var(--ink-faint)] transition-colors group-hover:text-[var(--a3)]">
                      Learn more <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </SpotlightTracker>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3D showcase / parallax tiles */}
      <section className="relative overflow-hidden px-6 py-28">
        <span className="aura left-1/2 top-1/3 h-[460px] w-[460px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <p className="kicker">Composable by design</p>
            <h2 className="mx-auto mt-4 max-w-[22ch] font-display text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
              Blocks you can <span className="text-brand">see</span>, structure you can <span className="text-brand">trust</span>.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-5 [perspective:1400px] sm:grid-cols-3">
            {["Hero", "Editorial", "Commerce"].map((label, i) => (
              <Reveal key={label} delay={i * 120} style={{ display: "block" }}>
                <TiltCard className="panel xray overflow-hidden p-0" max={10}>
                  <SpotlightTracker className="h-full">
                    <div className="h-56" style={{ background: `linear-gradient(135deg, rgba(59,108,255,0.${5 - i}), rgba(124,92,255,0.25), rgba(34,211,238,0.15))` }} />
                    <div className="flex items-center justify-between p-5">
                      <span className="font-display text-[18px]">{label} blocks</span>
                      <span className="font-mono-site text-[11px] text-[var(--ink-faint)]">v{i + 2}.0</span>
                    </div>
                  </SpotlightTracker>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats band */}
      <section className="border-y border-[var(--line)] px-6 py-20">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="text-center">
              <div className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-grad">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <p className="mt-3 text-[13px] text-[var(--ink-dim)]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* integrations marquee */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <p className="kicker">An ecosystem, not an island</p>
            <h2 className="mx-auto mt-4 max-w-[20ch] font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05]">
              Plugs into the stack you already run.
            </h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            <Marquee duration={34}>
              {INTEGRATIONS.map((n) => <Chip key={n} label={n} />)}
            </Marquee>
            <Marquee duration={42} reverse>
              {[...INTEGRATIONS].reverse().map((n) => <Chip key={n} label={n} />)}
            </Marquee>
          </div>
        </div>
      </section>

      {/* automation split */}
      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="kicker">Automation</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04]">
              Workflows that move work <span className="text-brand">forward</span>.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-[var(--ink-dim)]">
              A real node-based engine: triggers, branching logic, AI agents, approvals and 200+ actions.
              Automate publishing, enrichment, translation and notifications — visually.
            </p>
            <ul className="mt-7 space-y-3">
              {["Drag-and-drop builder with live test runs", "AI Agent nodes with tools & memory", "Webhooks, schedules and form triggers", "Human-in-the-loop approvals"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                  <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "var(--grad-brand)" }}>
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Magnetic className="mt-8 block">
              <Link href="/features#workflows" data-cursor className="btn-ghost inline-flex items-center gap-2 px-5 py-3 text-[14px] text-[var(--ink)]">
                Explore workflows <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </Reveal>
          <Reveal delay={120}>
            <SpotlightTracker className="spotlight panel p-6">
              <div className="space-y-3">
                {[
                  { icon: GitBranch, label: "When order paid", tone: "var(--ok)" },
                  { icon: Sparkles, label: "AI Agent · enrich product", tone: "var(--a2)" },
                  { icon: Database, label: "Update catalog", tone: "var(--a1)" },
                  { icon: Code2, label: "Notify #launches", tone: "var(--a3)" },
                ].map((n, i) => (
                  <div key={n.label} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3.5" style={{ background: "rgba(255,255,255,0.02)", marginLeft: `${i * 14}px` }}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: n.tone }}>
                      <n.icon className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] text-[var(--ink)]">{n.label}</span>
                    <span className="ml-auto h-2 w-2 rounded-full" style={{ background: n.tone, animation: "pulse-ring 2.4s infinite" }} />
                  </div>
                ))}
              </div>
            </SpotlightTracker>
          </Reveal>
        </div>
      </section>

      {/* testimonials */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <Reveal><p className="kicker text-center">Loved by teams</p></Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100} style={{ display: "block" }}>
                <div className="panel h-full p-7">
                  <Quote className="h-7 w-7 text-[var(--a2)]" />
                  <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink)]">“{t.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[13px] text-white" style={{ background: "var(--grad-brand)" }}>
                      {t.name[0]}
                    </span>
                    <div>
                      <p className="text-[13px] text-[var(--ink)]">{t.name}</p>
                      <p className="text-[12px] text-[var(--ink-faint)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* pricing teaser */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <p className="kicker">Pricing</p>
            <h2 className="mx-auto mt-4 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]">
              Start free. Scale when you’re ready.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90} style={{ display: "block" }}>
                <div className={`panel relative h-full p-7 ${t.highlight ? "ring-1" : ""}`} style={t.highlight ? { borderColor: "transparent", boxShadow: "0 0 0 1px rgba(124,92,255,0.5), 0 30px 80px -30px rgba(59,108,255,0.5)" } : undefined}>
                  {t.highlight && (
                    <span className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-medium text-white" style={{ background: "var(--grad-brand)" }}>Most popular</span>
                  )}
                  <p className="font-display text-[20px]">{t.name}</p>
                  <div className="mt-3 flex items-end gap-1.5">
                    <span className="font-display text-[42px] leading-none text-grad">{t.price}</span>
                    <span className="mb-1 text-[13px] text-[var(--ink-faint)]">{t.note}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-[var(--ink-dim)]">
                        <Check className="h-4 w-4 text-[var(--a3)]" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" data-cursor className={`mt-7 flex w-full items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium ${t.highlight ? "btn-brand" : "btn-ghost text-[var(--ink)]"}`}>
                    {t.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] text-[var(--ink-faint)]">
            See the full breakdown on the <Link href="/pricing" className="text-[var(--a3)] underline-offset-4 hover:underline">pricing page</Link>.
          </p>
        </div>
      </section>

      {/* final CTA */}
      <section className="px-6 pb-28 pt-10">
        <Reveal>
          <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[28px] p-12 text-center md:p-20" style={{ background: "linear-gradient(135deg, rgba(59,108,255,0.16), rgba(124,92,255,0.12), rgba(34,211,238,0.08))", border: "1px solid var(--line-strong)" }}>
            <span className="aura left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2" />
            <div className="relative">
              <span className="grid h-12 w-12 mx-auto place-items-center rounded-2xl text-white" style={{ background: "var(--grad-brand)" }}>
                <Boxes className="h-6 w-6" />
              </span>
              <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">
                Ship your next idea on Flowblok.
              </h2>
              <p className="mx-auto mt-4 max-w-[46ch] text-[15px] text-[var(--ink-dim)]">
                Spin up a space in seconds. Bring your team, your stack and your content model.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Magnetic>
                  <Link href="/register" data-cursor className="btn-brand flex items-center gap-2 px-7 py-3.5 text-[15px] font-medium">
                    Create your account <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <Link href="/login" data-cursor className="btn-ghost flex items-center px-7 py-3.5 text-[15px] text-[var(--ink)]">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] text-[var(--ink-dim)]" style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--grad-brand)" }} />
      {label}
    </span>
  );
}
