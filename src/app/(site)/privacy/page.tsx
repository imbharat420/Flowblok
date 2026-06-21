import { Reveal } from "../_components/fx";
import { LegalToc } from "../_components/legal-toc";

export const metadata = {
  title: "Privacy Policy — Flowblok",
  description: "How Flowblok collects, uses, shares and protects your information.",
};

const SECTIONS: { id: string; label: string; title: string; body: React.ReactNode }[] = [
  {
    id: "intro", label: "Introduction", title: "1. Introduction",
    body: (
      <>
        <p>Flowblok, Inc. (“Flowblok,” “we,” “us”) builds a composable content platform. This Privacy Policy explains what information we collect, why we collect it, how we use and share it, and the choices you have. It applies to our marketing site, web application and APIs (the “Services”).</p>
        <p>By using the Services you agree to the practices described here. If you do not agree, please do not use the Services.</p>
      </>
    ),
  },
  {
    id: "collect", label: "Information we collect", title: "2. Information we collect",
    body: (
      <>
        <p>We collect information in three ways:</p>
        <ul>
          <li><strong>Information you provide</strong> — account details (name, email, password), content you create, billing details and support requests.</li>
          <li><strong>Information collected automatically</strong> — device and browser data, IP address, pages viewed, and usage events, gathered via cookies and similar technologies.</li>
          <li><strong>Information from third parties</strong> — identity, authentication and payment data from providers you connect (e.g. SSO or payment processors).</li>
        </ul>
      </>
    ),
  },
  {
    id: "use", label: "How we use information", title: "3. How we use information",
    body: (
      <>
        <p>We use information to provide, secure and improve the Services, including to:</p>
        <ul>
          <li>Authenticate accounts and deliver email verification codes.</li>
          <li>Operate, maintain and personalize the platform.</li>
          <li>Detect, prevent and respond to fraud, abuse and security incidents.</li>
          <li>Communicate product updates and respond to support requests.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "bases", label: "Legal bases", title: "4. Legal bases for processing",
    body: <p>Where the GDPR applies, we process personal data on the bases of performance of a contract, our legitimate interests (such as securing and improving the Services), your consent (which you may withdraw at any time), and compliance with legal obligations.</p>,
  },
  {
    id: "cookies", label: "Cookies & tracking", title: "5. Cookies & tracking",
    body: <p>We use strictly-necessary cookies to keep you signed in and secure, and optional analytics cookies to understand usage. You can control non-essential cookies through your browser settings or our in-product controls. Disabling essential cookies may break core functionality.</p>,
  },
  {
    id: "sharing", label: "How we share data", title: "6. How we share information",
    body: (
      <>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul>
          <li><strong>Service providers</strong> (hosting, analytics, email and payments) under contract and only as needed.</li>
          <li><strong>Your organization</strong> — administrators and members of spaces you belong to.</li>
          <li><strong>Legal & safety</strong> recipients when required by law or to protect rights and safety.</li>
          <li><strong>Business transfers</strong> in connection with a merger, acquisition or asset sale.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention", label: "Data retention", title: "7. Data retention",
    body: <p>We retain personal data for as long as your account is active or as needed to provide the Services, then delete or anonymize it within a reasonable period, unless a longer retention is required by law. Content you delete is removed from active systems and purged from backups on a rolling schedule.</p>,
  },
  {
    id: "security", label: "Security", title: "8. Security",
    body: <p>We protect data with encryption in transit and at rest, least-privilege access controls, audit logging, and routine security reviews. Our platform is built toward SOC 2 controls. No method of transmission or storage is perfectly secure, but we work continuously to safeguard your information.</p>,
  },
  {
    id: "rights", label: "Your rights", title: "9. Your rights & choices",
    body: (
      <>
        <p>Depending on your location you may have the right to access, correct, export, delete or restrict processing of your personal data, and to object to certain processing. To exercise these rights, contact us at the address below — we will respond within the timeframes required by law.</p>
      </>
    ),
  },
  {
    id: "transfers", label: "International transfers", title: "10. International data transfers",
    body: <p>We operate globally and may transfer data to countries other than your own. Where required, we use appropriate safeguards such as Standard Contractual Clauses to protect your information during these transfers.</p>,
  },
  {
    id: "children", label: "Children's privacy", title: "11. Children’s privacy",
    body: <p>The Services are not directed to children under 16, and we do not knowingly collect their personal data. If you believe a child has provided us information, contact us and we will delete it.</p>,
  },
  {
    id: "changes", label: "Changes", title: "12. Changes to this policy",
    body: <p>We may update this policy from time to time. Material changes will be announced in-product or by email, and the “last updated” date below will change. Continued use of the Services after an update constitutes acceptance.</p>,
  },
  {
    id: "contact", label: "Contact", title: "13. Contact us",
    body: <p>Questions about this policy or your data? Email <a href="mailto:privacy@flowblok.com">privacy@flowblok.com</a> or write to Flowblok, Inc., Privacy Office. We’re here to help.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-10 pt-40 md:pt-48">
        <span className="aura -right-20 top-20 h-[400px] w-[400px]" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,92,255,0.45), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1100px]">
          <Reveal><p className="kicker">Legal</p></Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.0]">Privacy Policy</h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-[var(--ink-dim)]">
              Your trust matters. This page explains, in plain language, how we handle your data across the Flowblok platform.
            </p>
            <p className="mt-2 font-mono-site text-[12px] text-[var(--ink-faint)]">Last updated · {new Date().getFullYear()}-01-01</p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[230px_1fr]">
          <LegalToc items={SECTIONS.map((s) => ({ id: s.id, label: s.label }))} />

          <div className="legal-prose max-w-[68ch]">
            {SECTIONS.map((s, i) => (
              <Reveal key={s.id} delay={Math.min(i, 4) * 40} id={s.id} as="article" style={{ scrollMarginTop: 110, display: "block" }}>
                <h2 className="font-display text-[clamp(1.4rem,3vw,1.9rem)] leading-tight">{s.title}</h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--ink-dim)]">{s.body}</div>
                {i < SECTIONS.length - 1 && <hr className="my-10 border-[var(--line)]" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
