import Link from "next/link";
import {
  LayoutTemplate, PenLine, Workflow, Plug, Globe2, Languages, ShieldCheck, Image as ImageIcon,
  Sparkles, History, Webhook, GitBranch, Database, Boxes, ArrowUpRight, Check,
} from "lucide-react";
import { Reveal, SpotlightTracker, TiltCard, CountUp, Magnetic } from "../_components/fx";

export const metadata = {
  title: "Platform — Flowblok",
  description: "Content modeling, visual editing, workflows, headless APIs, localization, governance and AI — one composable platform.",
};

const PILLARS = [
  {
    id: "modeling", tag: "Model", icon: LayoutTemplate, title: "Content modeling without migrations",
    body: "Design schema-driven content types with nested blocks, references, validation and reusable components. Evolve your model live — no database surgery, no downtime.",
    points: ["Nested block trees & components", "Typed references & relations", "Field-level validation rules", "Reusable presets across spaces"],
  },
  {
    id: "editor", tag: "Edit", icon: PenLine, title: "A visual editor editors love",
    body: "In-context, drag-and-drop editing with live preview. Marketers compose pages from blocks; developers keep full control of the schema and rendering.",
    points: ["Drag-and-drop page builder", "Live preview & side-by-side", "Version history & restore", "Real-time draft → review → publish"],
  },
  {
    id: "workflows", tag: "Automate", icon: Workflow, title: "Workflows on a real engine",
    body: "A node-based automation engine: triggers, branching logic, AI agents with tools & memory, approvals and 200+ actions. Test runs are live and inspectable.",
    points: ["Trigger → logic → action graph", "AI Agent nodes (model/memory/tools)", "Webhooks, schedules & forms", "Human-in-the-loop approvals"],
  },
  {
    id: "apis", tag: "Deliver", icon: Plug, title: "Headless APIs, instantly",
    body: "Every content type is exposed over typed REST & GraphQL the moment you create it — globally cached, versioned and predictable.",
    points: ["REST & GraphQL out of the box", "Edge-cached, low latency", "Draft & published environments", "Webhooks on every change"],
  },
];

const GRID = [
  { icon: Globe2, title: "Omnichannel delivery", body: "One source of truth to web, mobile, kiosk and voice.", id: "channels" },
  { icon: Languages, title: "Localization", body: "Per-field translations, fallbacks and locale workflows.", id: "i18n" },
  { icon: ShieldCheck, title: "Governance & roles", body: "Granular permissions, audit logs, SOC 2-ready controls.", id: "governance" },
  { icon: ImageIcon, title: "Asset pipeline", body: "Smart media library, on-the-fly transforms, global CDN.", id: "assets" },
  { icon: History, title: "Versioning", body: "Every change tracked; diff, restore and roll back.", id: "versioning" },
  { icon: Webhook, title: "Webhooks & events", body: "Fire events into your stack on any content change.", id: "events" },
  { icon: GitBranch, title: "Environments", body: "Branch content, preview, then promote with confidence.", id: "environments" },
  { icon: Database, title: "Structured data", body: "Tables, CRM, commerce objects — model your whole domain.", id: "commerce" },
  { icon: Sparkles, title: "AI assist", body: "Generate, translate and classify with agents on your data.", id: "ai" },
];

const STATS = [
  { value: 12, suffix: "+", label: "Content surfaces" },
  { value: 200, suffix: "+", label: "Workflow actions" },
  { value: 40, suffix: "+", label: "Locales supported" },
  { value: 99.99, suffix: "%", decimals: 2, label: "Uptime SLA" },
];

export default function FeaturesPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-40 text-center md:pt-48">
        <div className="blueprint absolute inset-0" />
        <span className="aura left-1/2 top-20 h-[460px] w-[460px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-[900px]">
          <Reveal><p className="kicker">The platform</p></Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.98]">
              Everything between <span className="text-brand">idea</span> and <span className="text-brand">published</span>.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-[56ch] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-[var(--ink-dim)]">
              Flowblok unifies content modeling, visual editing, automation and delivery so your team
              ships faster — without stitching five tools together.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <Magnetic className="mt-9 inline-block">
              <Link href="/register" data-cursor className="btn-brand inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium">
                Start free <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* pillars — alternating rows */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-[1180px] space-y-24">
          {PILLARS.map((p, i) => (
            <div key={p.id} id={p.id} style={{ scrollMarginTop: 110 }} className="grid items-center gap-12 lg:grid-cols-2">
              <Reveal className={i % 2 ? "lg:order-2" : ""}>
                <span className="kicker">{p.tag}</span>
                <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.05]">{p.title}</h2>
                <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-[var(--ink-dim)]">{p.body}</p>
                <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5 text-[14px] text-[var(--ink)]">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: "var(--grad-brand)" }}>
                        <Check className="h-3 w-3 text-white" />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={120} className={i % 2 ? "lg:order-1" : ""}>
                <TiltCard className="panel overflow-hidden" max={7}>
                  <SpotlightTracker className="spotlight">
                    <div className="flex items-center gap-1.5 border-b border-[var(--line)] px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                      <p.icon className="ml-2 h-3.5 w-3.5 text-[var(--ink-faint)]" />
                    </div>
                    <div className="p-6">
                      <div className="mb-4 h-40 rounded-xl" style={{ background: `linear-gradient(135deg, rgba(59,108,255,0.3), rgba(124,92,255,0.18), rgba(34,211,238,0.12))` }} />
                      <div className="space-y-2.5">
                        <div className="h-3 w-2/3 rounded-full bg-white/12" />
                        <div className="h-3 w-1/2 rounded-full bg-white/8" />
                        <div className="h-3 w-3/4 rounded-full bg-white/8" />
                      </div>
                    </div>
                  </SpotlightTracker>
                </TiltCard>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* stats */}
      <section className="mt-12 border-y border-[var(--line)] px-6 py-16">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-none text-grad">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <p className="mt-2 text-[13px] text-[var(--ink-dim)]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* capability grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <p className="kicker">And the rest of the toolkit</p>
            <h2 className="mx-auto mt-4 max-w-[20ch] font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05]">
              Enterprise muscle, startup speed.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GRID.map((g, i) => (
              <Reveal key={g.title} delay={(i % 3) * 70} id={g.id} style={{ display: "block", scrollMarginTop: 110 }}>
                <SpotlightTracker className="spotlight panel h-full p-6">
                  <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-[var(--ink)]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)" }}>
                    <g.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-[17px]">{g.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-dim)]">{g.body}</p>
                </SpotlightTracker>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28">
        <Reveal>
          <div className="relative mx-auto max-w-[1000px] overflow-hidden rounded-[28px] p-12 text-center md:p-16" style={{ background: "linear-gradient(135deg, rgba(59,108,255,0.16), rgba(124,92,255,0.12))", border: "1px solid var(--line-strong)" }}>
            <span className="grid h-12 w-12 mx-auto place-items-center rounded-2xl text-white" style={{ background: "var(--grad-brand)" }}>
              <Boxes className="h-6 w-6" />
            </span>
            <h2 className="mx-auto mt-5 max-w-[20ch] font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05]">
              See it on your own content.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link href="/register" data-cursor className="btn-brand flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium">
                  Create your account <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Link href="/pricing" data-cursor className="btn-ghost flex items-center px-6 py-3.5 text-[15px] text-[var(--ink)]">
                View pricing
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
