import Link from "next/link";
import { Boxes, Github, Twitter, Linkedin } from "lucide-react";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Content modeling", href: "/features#modeling" },
      { label: "Visual editor", href: "/features#editor" },
      { label: "Workflows & automation", href: "/features#workflows" },
      { label: "Headless APIs", href: "/features#apis" },
      { label: "Open the app", href: "/dashboard" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Marketing teams", href: "/features#teams" },
      { label: "Developers", href: "/features#apis" },
      { label: "Commerce", href: "/features#commerce" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-[var(--line)] px-6 pb-10 pt-20">
      <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1.4fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: "var(--grad-brand)" }}>
              <Boxes className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-[18px] tracking-tight">Flowblok</span>
          </Link>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--ink-dim)]">
            The composable content platform for serious teams — model anything, ship everywhere, automate the boring parts.
          </p>
          <div className="mt-6 flex gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
                style={{ border: "1px solid var(--line)" }}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="kicker mb-4">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[14px] text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1180px] flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-[12px] text-[var(--ink-faint)] sm:flex-row">
        <span>© {new Date().getFullYear()} Flowblok, Inc. All rights reserved.</span>
        <span className="font-mono-site">Crafted with intent · Dark mode forever</span>
      </div>
    </footer>
  );
}
