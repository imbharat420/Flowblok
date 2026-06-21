import type { ReactNode } from "react";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { SiteNav } from "./_components/site-nav";
import { SiteFooter } from "./_components/site-footer";
import { Cursor, ScrollProgress } from "./_components/fx";

// Distinctive type pairing: Bricolage Grotesque (characterful display) over
// Hanken Grotesk (clean body), with JetBrains Mono for technical labels.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-site", display: "swap" });

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`site grain min-h-screen ${display.variable} ${body.variable} ${mono.variable}`}>
      <ScrollProgress />
      <Cursor />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
