# Flowblok — Open Questions & Decisions To Confirm

> Per `docs/Prompt.md` ("make a full question list ... before generating a final plan"). These are the
> genuine decisions that change scope, cost, risk, or architecture. Each has a **recommended default**
> (what the planning docs currently assume) so work can proceed even before you answer. Override any default
> and the sibling docs (`01-PRD.md` … `08-DESIGN-SYSTEM.md`) will be adjusted to match.

**Legend:** 🔴 blocks first build · 🟠 shapes a phase · 🟡 can defer

---

## 1. Strategy, scope & sequencing

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 1.1 🔴 | Confirm the **build sequence**: AI Website Generator → Visual CMS → Template Marketplace → Commerce → CRM → Plugin Ecosystem? | Yes — this is the 75%-success path; everything-at-once = 5%. | Entire roadmap |
| 1.2 🔴 | What is the **single MVP wedge** we ship first to real users? | "One-prompt → editable business website + CMS + deploy" (no commerce/CRM/marketplace in v1). | MVP definition |
| 1.3 🟠 | Is this **VC-funded** (build the full DXOS) or **bootstrapped** (narrow, revenue-first)? | Assume lean MVP that proves the AI-generator wedge, then raise. | Team size, pace |
| 1.4 🟠 | Single founder/small team, or the **8–10 person** team in the analysis? | Plan written for 8–10; MVP achievable with 4–5 if scope held. | Timeline realism |
| 1.5 🟡 | Open-source core (the Prompt mentions "open source type project") or closed SaaS? | Open-core: OSS engine + paid cloud/marketplace. Confirm. | Licensing, GTM |

## 2. AI

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 2.1 🔴 | **BYO-key** (each tenant supplies OpenAI/Claude/Gemini keys) or **platform-managed credits**, or both? | Both: platform credits by default, BYO-key for power users/enterprise. | Cost model, billing, legal |
| 2.2 🟠 | Primary model for generation — default to **Claude (latest)** for code/structure, with provider routing? | Yes; route by task (design/copy/code), allow per-tenant override. | Quality, cost |
| 2.3 🟠 | Do generated components/pages become **owned by the tenant** with no usage restriction? | Yes — tenant owns output; no lock-in. | Legal/ToS |
| 2.4 🟡 | Acceptable **AI spend cap** per tier before throttling? | Define per tier ($19/$99/$299); hard cap + overage. | Margin protection |

## 3. Data, tenancy & deployment

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 3.1 🔴 | **Supabase** (managed Postgres + Auth + RLS) for MVP, migrating to self-managed later — agreed? | Yes — fastest path; abstract data access to allow migration. | Architecture |
| 3.2 🟠 | Where do **generated end-user sites** deploy — our edge/CDN, or one-click to the user's Vercel/Netlify, or both? | Both: hosted-by-us default + export/connect option. | Infra cost, scope |
| 3.3 🟠 | **Custom domains + SSL** in MVP or phase 2? | Phase 2 (use subdomains in MVP). | MVP scope |
| 3.4 🟡 | Data **residency** regions required (EU/India/US)? | Multi-region post-MVP; single region for MVP. | Compliance |

## 4. Commerce, CRM & payments

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 4.1 🟠 | Confirm **CRM Lite** scope only (no Salesforce/HubSpot parity)? | Yes — Leads/Contacts/Companies/Deals/Activities/Pipelines. | Scope |
| 4.2 🟠 | **Payment processor** — Stripe primary; add Razorpay/PayPal? | Stripe first (PCI SAQ-A via Stripe Elements; we never touch raw card data); Razorpay for India later. | PCI scope, legal |
| 4.3 🟡 | Do we take payments **on behalf of tenants** (platform/Connect) or tenants connect their own? | Tenants connect their own Stripe (Stripe Connect Standard) to avoid money-transmitter status. | Legal, risk |

## 5. Workflow / integration engine

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 5.1 🟠 | Build the workflow engine **on top of n8n** (embedded, hidden) or **from scratch**? | Embed an n8n-style engine behind our own simpler abstraction; never expose n8n UI. | Build effort |
| 5.2 🟡 | Which **connectors** ship in MVP? | HTTP/Webhook, Email (SMTP), Stripe, our own DB/CMS, one CRM (internal). Expand via marketplace. | Phase scope |

## 6. Marketplace, legal & brand

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 6.1 🔴 | Confirm the **"inspiration not copying"** rule (no competitor brand names, logos, copy, images, trademarks anywhere in product, templates, or marketing)? | Strict yes — layout/structure inspiration only; legal review of all templates. | Legal liability |
| 6.2 🟠 | **Marketplace revenue split** — 20% platform / 80% creator confirmed? | Yes (Shopify benchmark 15–20%). | Business model |
| 6.3 🟡 | Final **product name** "Flowblok" confirmed, and trademark cleared? | Proceed as Flowblok pending a trademark/clearance search. | Branding |

## 7. Design & UX

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 7.1 🟠 | App default theme = **ModernDark** (dark-first, single indigo/blue accent)? | Yes; light + high-contrast also shipped. | Design system |
| 7.2 🟡 | Should marketing/landing surfaces use the **multi-accent Webflow-style** (Professional stitch variant) while the app stays mono? | Yes — app = one system; landing = expressive range. | Brand split |
| 7.3 🟡 | Confirm **Inter / Inter Display + JetBrains Mono** as the type stack (open-source, weight ceiling 600)? | Yes. | Design system |

## 8. Compliance & enterprise (mostly post-MVP)

| # | Question | Recommended default | Impact |
|---|---|---|---|
| 8.1 🟡 | Which compliance is **contractually required first** — SOC 2, GDPR, HIPAA, ISO 27001? | GDPR + SOC 2 Type II first; HIPAA only if healthcare tenants signed. | Roadmap, cost |
| 8.2 🟡 | Is **SSO/SAML** an MVP enterprise requirement or phase 3? | Phase 3 (OAuth social + email in MVP). | Scope |

---

### How to answer
Reply inline (e.g. "1.1 yes, 2.1 BYO-key only, 4.2 add Razorpay in MVP") — I'll propagate every change through the affected documents. Unanswered items keep their recommended defaults, which the current docs already assume.
