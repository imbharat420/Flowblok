import type { ReactNode } from "react";
import Link from "next/link";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Boxes, ArrowLeft, ShieldCheck, Zap, Globe2 } from "lucide-react";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-site", display: "swap" });

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`site grain min-h-screen ${display.variable} ${body.variable} ${mono.variable}`}>
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* brand panel */}
        <aside className="relative hidden overflow-hidden border-r border-[var(--line)] lg:block">
          <div className="blueprint absolute inset-0" />
          <span className="aura -left-20 top-24 h-[460px] w-[460px]" />
          <span className="aura bottom-10 right-0 h-[380px] w-[380px]" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,92,255,0.5), transparent 70%)" }} />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link href="/" className="flex w-fit items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: "var(--grad-brand)" }}>
                <Boxes className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-[18px] tracking-tight">Flowblok</span>
            </Link>

            <div>
              <h2 className="max-w-[16ch] font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.04]">
                Content infrastructure for teams that <span className="text-brand">ship</span>.
              </h2>
              <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-[var(--ink-dim)]">
                Model anything, edit it visually, automate it with workflows and deliver everywhere
                through one fast API.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { icon: Zap, t: "Workflows & AI automation" },
                  { icon: Globe2, t: "Omnichannel headless delivery" },
                  { icon: ShieldCheck, t: "SOC 2-ready governance" },
                ].map((f) => (
                  <div key={f.t} className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)" }}>
                      <f.icon className="h-4 w-4 text-[var(--a3)]" />
                    </span>
                    {f.t}
                  </div>
                ))}
              </div>
            </div>

            <p className="font-mono-site text-[11px] text-[var(--ink-faint)]">© {new Date().getFullYear()} Flowblok, Inc.</p>
          </div>
        </aside>

        {/* form column */}
        <main className="relative flex items-center justify-center px-6 py-12">
          <Link href="/" className="absolute left-6 top-6 flex items-center gap-1.5 text-[13px] text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          {children}
        </main>
      </div>
    </div>
  );
}
