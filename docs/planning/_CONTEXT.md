# Flowblok — Canonical Planning Context (Single Source of Truth)

> This file is the shared, authoritative brief for ALL planning documents in `docs/planning/`.
> Every document (PRD, Technical Architecture, Security & Access, Frontend Spec, Feature Tickets)
> MUST stay consistent with the names, numbers, and decisions recorded here. Cross-reference sibling
> documents by filename. Derived from: `docs/Prompt.md`, `docs/Design.md`,
> `docs/ChatGPT-AI Website Builder Analysis (1).md`, `docs/design/*`, `docs/stitch/*`.

---

## 0a. Ratified decisions (v1.0 — set by the expert-crew review; these override seed wording below)

- **Canonical entity name = "Space."** Hierarchy: **Organization (tenant) → Space.** "Workspace" is retired across UI, routes (`/app/{org}/{space}`), and JWT claims. Columns: `tenant_id` = Organization id, `space_id` = Space id (both on every tenant-owned row); RLS keys off `tenant_id`, the app scopes by `space_id`. (Where this file says "Workspace (a.k.a. Space)" below, read **Space.**)
- **MVP architecture = modular monolith**, not 30+ microservices. The "30+ services / 300+ tables" figure is an *eventual* scale target, not an MVP shape. Services are logical modules in one deployable until scale demands extraction.
- All other canonical names/numbers below stand.

## 0. Product identity

- **Name:** Flowblok
- **Category:** AI-Native Visual Business Operating System / Digital Experience Operating System (DXOS)
- **One-liner:** "Build Content. Build Logic. Build Business." — generate, customize, deploy, manage and scale a complete business platform from one prompt, then edit every layer visually.
- **Thesis:** Not a CMS. A unified platform combining the best of Storyblok, WordPress, Strapi, Contentful, Builder.io, Webflow, Shopify, WooCommerce, Zoho CRM, HubSpot, n8n, Boomi, and Supabase — design, content, data, logic, APIs, CRM, commerce, AI, SEO, assets, analytics, and deployment from a single interface.
- **The moat (state explicitly, everywhere):** Five layers editable *together* — **Visual + Database + Workflow + Code + AI**. No competitor combines all five well.
- **Signature differentiator:** "Infinite Components" — AI-generated components instead of a fixed, capped component library (directly counters Storyblok's 200-block / 100-folder / 10-datasource caps observed in the user's account).

## 1. Strategic guardrails (do not violate in any doc)

- **Building everything at once = 5% success.** The analysis-backed sequencing is the spine of the PRD and tickets:
  1. AI Website Generator (75% success path) →
  2. Storyblok-style Visual CMS + Visual Editor →
  3. Template Marketplace →
  4. Commerce →
  5. CRM →
  6. Plugin Ecosystem / Developer Platform.
- **CRM = "CRM Lite", not Salesforce/HubSpot.** Leads, Contacts, Companies/Accounts, Deals/Pipelines, Activities, Notes, Tasks, Emails. "90% of businesses need only this."
- **Commerce = native core "better than WooCommerce"** (Products, Categories, Inventory, Orders, Coupons, Payments, Shipping, Taxes), then extensions.
- **Workflow engine:** do NOT expose n8n directly — build a simpler abstraction (Boomi + n8n inspired) on top; n8n-style engine executes behind the scenes.
- **KISS / DRY / performance-first / open-source-friendly** is a stated product principle (from `Prompt.md`).

## 2. Primary personas

- **Non-technical user** — builds visually + via AI, never sees code.
- **Agency** — manages multiple client spaces, clones projects, reuses templates, manages permissions.
- **Enterprise** — internal tools, portals, workflows, business processes.
- **Developer** — full access to generated code, custom components, plugins, APIs, workflows; "nothing is locked."

## 3. Tenancy & object model

```
Organization → Workspace (a.k.a. "Space") → { Pages, Content, Database, Users, Permissions,
                                              Workflows, Assets, APIs, AI Agents, Commerce, CRM,
                                              Analytics, Settings }
```
- A Space contains stacked layers, all editable from one admin: **Design · Content · Data · Logic · API · AI · Commerce · CRM · Analytics · Deployment.**
- **Every block/page** exposes tabs: **Design · Data · Logic · Permissions · Events · SEO · AI.**
- Page structure: `Page → Section → Row / Column / Component`.
- Tenant isolation: shared Postgres DB with `tenant_id`/`workspace_id` on every row + Row-Level Security (RLS). No cross-tenant queries possible.

## 4. The 16 modules (Flowblok product surface)

Flowblok Studio · CMS · Data · Auth · Flow (Workflows) · API · Commerce · CRM · AI · Deploy · Marketplace · Analytics · Identity · Assets · Search · Developer.

**Main left-nav (admin):** Dashboard · Spaces · Pages · Content · Components · Database · Workflows · APIs · CRM · Commerce · AI · Analytics · Marketplace · Assets · Users · Settings.

## 5. Technology stack (canonical choices + alternatives)

| Concern | Primary | Alternatives noted |
|---|---|---|
| Frontend | Next.js + React + Tailwind | SvelteKit, Astro, Nuxt, Vue |
| UI / components | shadcn/ui on Radix Primitives + Tremor (dashboards) | Aceternity, Magic UI, HyperUI, Uiverse, 21st.dev, Origin UI (marketing/landing only) |
| Animation / 3D | Framer Motion / motion.dev, GSAP | Anime.js, Three.js, Babylon.js, SVGator |
| In-browser code | Monaco / VSCode Web | — |
| Backend | NestJS (Node/TypeScript) | Strapi (CMS engine), Rails API, Laravel, KeystoneJS |
| Database / BaaS | PostgreSQL + Supabase (Auth, RLS, pgvector, Edge Functions) for MVP | Firebase (NoSQL), Hasura (GraphQL-on-PG) |
| Cache / Search / Queue | Redis · Elasticsearch (or PG full-text/Algolia) · Kafka | Varnish/CDN |
| Vector DB | Supabase pgvector | Pinecone |
| Storage | S3 / Cloudflare R2 | — |
| AI providers | OpenAI (GPT-4, DALL·E), Anthropic Claude, Google Gemini | Stable Diffusion, local models. **Per-tenant API keys.** |
| Auth | Supabase Auth (JWT) | Auth0, Clerk, Ory, Keycloak |
| CI/CD & deploy | Git + GitHub Actions, Docker, Kubernetes (EKS) / ECS / Cloud Run; Vercel/Netlify one-click | Flyway / Prisma / TypeORM migrations |
| Observability | Grafana/Prometheus or ELK | — |

**Compact final stack:** FE = Next.js/React/Tailwind/Motion/Three.js/GSAP · BE = NestJS/PostgreSQL/Redis/Kafka/Elasticsearch · Storage = S3/Cloudflare R2 · AI = OpenAI/Claude/Gemini/local.

Architecture scale targets cited: **30+ microservices, 300+ DB tables**. API-first / microservices-oriented.

## 6. AI subsystems

- **AI Designer / Design Generator** — prompt + brand + industry + style → layout, colors, typography, animation, components (all editable in the visual editor).
- **AI Developer / Code Assistant** — generate/refactor components in the in-browser IDE; context = user code + schema.
- **AI SEO**, **AI Copywriter**, **AI CRM Agent** (follow leads), **AI Analytics Agent** (recommendations).
- **Generation agents:** Page, Workflow, Database, Commerce.
- **Design pipeline:** `Screenshot → Vision AI → Design Tokens → Component Mapping → Editable Layout`.
- **Full generation flow:** `Prompt → Generate Database → Generate Pages → Generate Components → Generate Workflows → Generate APIs → Deploy`.
- **DesignPrompt.md system:** `designprompts/*.md` (luxury, cyberpunk, school, restaurant, …) feed colors/spacing/animation/typography/layout rules to the AI. The 31-style catalog lives in `docs/design/landing/`.

## 7. Universal data binding (key UX concept)

Each block's **Data tab** lets users bind a data source with zero code:
`Static | Database | API | Workflow | AI | CRM | Commerce | Search`.
Pick Database → choose table → auto-load fields → visually map (Card Title ← Product Title, etc.). System silently generates `await db.products.findMany()`; user never sees it unless they toggle **Developer Mode** (Visual ↔ Code), which exposes Frontend React code, Workflow JSON, API definition, DB schema, generated services/controllers — all editable.

## 8. Workflow engine

- Node types: **Trigger · Condition · Loop · API · Database · Email · SMS · Webhook · AI · CRM · Payment · Custom Code.**
- Triggers: form submission, order completed, post published, scheduled time. Actions: HTTP, email, wait, condition, call CRM API.
- Stored as JSON/YAML node graph; versioned; deployable across environments; packageable as reusable "micro-apps."
- Form submit actions: Create DB Record · Run Workflow · Create CRM Lead · Send Email · Webhook · Multiple — interchangeable targets (DB / Workflow / Zoho / HubSpot / Salesforce).

## 9. Data models (canonical entities)

- **CMS:** Space, Page, Section, Component, Content, Media, Locale; content types = Pages/Posts/Collections/Categories/Tags. `posts(id, title, content, author_id, tenant_id, status[draft|review|published|archived], published_at)`.
- **Commerce:** products, categories, orders, order_items, customers, payments, addresses. (CUSTOMER 1—* ORDER 1—* ORDER_ITEM *—1 PRODUCT *—1 CATEGORY; CUSTOMER 1—* ADDRESS.) Variants in separate tables or JSON metadata.
- **CRM:** contacts, companies(accounts), deals(opportunities; M:N to contacts), leads, activities (polymorphic to contacts/deals). Pipeline stages: New Lead → Qualified → Meeting → Proposal → Won.
- **Storage JSON shapes:** Page `{id, blocks:[{type}]}`, Component `{component, props}`, Workflow `{trigger, actions:[]}`.
- **Schema-as-code:** SQL/Prisma/TypeORM migrations; content-model change auto-generates migration + review; content versioned via audit tables / copy-on-write; semantic versioning for templates/plugins.

## 10. Security & access (canonical)

- **Roles:** Owner, Admin, Manager, Developer, Editor, Author, Reviewer, Customer, Guest.
- **Capabilities:** Can Edit Pages · Edit Data · Publish · Manage Users · Access APIs.
- **ABAC examples:** author edits own posts (cannot publish); editor edits/publishes all; customer views own orders.
- **Auth:** JWT (email/pass, Google/Microsoft/GitHub OAuth, SAML/SSO/OIDC, Magic Link, OTP). Access token **15 min**, refresh token **30 days**, stored in **Secure HttpOnly cookies — never LocalStorage**.
- **Enforcement (3 layers):** UI hides actions by role → backend checks JWT claims → DB RLS restricts rows.
- **Crypto:** AES-256 at rest, TLS 1.3 in transit; secrets in Vault; bcrypt passwords; MFA (required for admins).
- **Network:** API rate limiting, admin IP allowlists, WAF.
- **Audit log:** Login, Content Changes, Workflow Changes, API Calls, Permission Changes (tenant owners can view).
- **Compliance targets:** SOC 2 Type II, GDPR (tenant self-delete all data), HIPAA, ISO 27001; SLA target 99.99%.
- **Plugin security:** containerized sandbox + code review.

## 11. API surface

- **Auto-generated per content type / table:** REST + GraphQL + Webhooks + OpenAPI/Swagger + SDK. Flow: `Create Collection → Generate APIs → Generate Swagger → Generate SDK`.
- Named endpoints: `POST /api/signup`, `POST /api/posts`, `PUT /api/posts/{id}`, `GET /me`, `POST /api/ai/generate_seo`, `GET /api/products`.
- API gateway enforces auth + rate limits. GraphiQL-style API Explorer. Optional Hasura/Prisma for GraphQL.

## 12. Marketplace

- Plugin categories: Themes · Templates · Components · Connectors · Workflows · AI Agents.
- Template categories: Schools (CBSE/International/University), Restaurants (Fine Dining/Cafe/Fast Food), Ecommerce (Fashion/Electronics/Furniture), Services (Agencies/Lawyers/Doctors). Goal: **1000+ templates**.
- Plugin SDK + CLI scaffolding; Git push; review → in-admin App Store. Semantic versioning, automated test pipeline, push-updates.

## 13. Business model & metrics

- **SaaS tiers:** Starter **$19** · Professional **$99** · Business **$299** · Enterprise custom.
- **Marketplace commission:** **20%** (templates, plugins, agents).
- **AI credits:** usage-based; per-tenant keys.
- **Metrics:** MRR, LTV:CAC, active workspaces, churn, page load, plugin adoption.
- **Workspace targets:** Y1 1,000 · Y2 10,000 · Y3 50,000.
- **Team (MVP):** 8–10 (2 BE, 2 FE, 2 AI, 1 DevOps, 1 Product, 1 Design).
- **Cost benchmarks:** initial 6–12 mo burn ~$500K–800K; ops @ ~10k MAU ~$5K–10K/mo; Postgres cluster $1–2K/mo at 100k+ MAU.
- **Timeline:** Phase 1 (6 mo) CMS+Builder+AI Generator · Phase 2 (6 mo) CRM+Ecommerce+Templates · Phase 3 (12 mo) Marketplace+AI Agents+Enterprise.

## 14. Design system (canonical — product app)

- **North star:** "Apple designed a developer operating system." Feel: Fast, Quiet, Technical, Premium, Precise, Minimal. Inspired by Linear, Vercel, Raycast, Stripe, Framer, Arc.
- **App default theme = "ModernDark"** (deep near-blacks, single indigo/blue accent, layered depth). Light / dark (default) / high-contrast.
- **Color (Flowblok OS light tokens):** canvas `#FFFFFF`, elevated `#FAFAFA`, border `#EEEEEE`, text-primary `#111111`, text-secondary `#666666`, accent `#2563EB` (ONE accent, no rainbows/gradients in app). Dark canvas `#0A0A0A`.
- **Tokens authored in OKLCH** (shadcn ~27-var contract); never hardcode hex in components; single `--radius` knob. Three SEPARATE color domains: UI-semantic · categorical-chart (chart-1…5, color-blind-safe) · status/pipeline (pass=green, pending=amber, fail=red + icon+label). Never reuse a chart color as a status color. Reserve saturated red/orange for waste/error only.
- **Typography:** Inter + Inter Display, weights 400/500/600 (never 700+). Display 64–80px (-0.04em, lh 0.95); Heading 32–48px/600; Body 16px/400/1.6; Labels 12–13px uppercase, tracking 0.08em. Mono/tabular numerals (JetBrains Mono / Geist Mono) for all KPI & table figures.
- **Layout:** 8px spacing system; major sections 120px vertical; max width 1200px (marketing) / 1280px (app); asymmetric layouts; generous whitespace on marketing, **density over whitespace in the product app** (power-user tool, density toggle).
- **Components:** buttons 36–40px / 8px radius / minimal shadows; inputs subtle borders, quiet focus (`focus-visible:ring` step 8); cards border-first, shadows only when necessary; tables = primary data surface; panels lightweight/contextual/collapsible.
- **Chrome:** one inverted-L (collapsible left sidebar + one unified top header) across every module. **Cmd/Ctrl+K command palette EXECUTES** (moves cards, sets properties, navigates, triggers AI) — not just search.
- **Workflow builder canvas:** dark `#0A0A0A`, subtle grid, thin connection lines, elegant node cards, zero visual noise. Inspired by Linear/Figma/Temporal/GitHub Actions.
- **Motion:** purposeful only, 120/180/240ms (or 200–300ms expo-out, ≤8px), opacity+position; no bounce/elastic; gate behind `prefers-reduced-motion`.
- **States are first-class:** layout-matched skeletons (never spinners), teaching empty states, recoverable error pills, success feedback.
- **Charts:** Tremor primary; Nivo for Calendar/HeatMap/TreeMap/Bump; visx for bespoke (pipeline DAG). SVG charts cap ~5K points → Nivo Canvas at scale.
- **Stitch design variants available** (`docs/stitch/`): Flowblok OS (mono + blue, app default), Professional Visual Development System (Webflow-style 5-accent marketing), Teal Precision (SaaS minimal, teal accent), Minimalist Community (warm teal). **31-style landing catalog** in `docs/design/landing/`.
- **Accessibility:** WCAG AA minimum; full keyboard nav (J/K, arrows, Cmd+K, Ctrl+[); never state-by-color-alone; verify OKLCH contrast.

## 15. Epic / ticket backbone (FB-001 … FB-060, 12 epics)

1. **Workspace Management:** FB-001 Create, FB-002 Delete, FB-003 Settings, FB-004 Cloning.
2. **Authentication:** FB-005 Email Reg, FB-006 Email Login, FB-007 Google, FB-008 GitHub, FB-009 MFA, FB-010 Session Mgmt.
3. **CMS:** FB-011 Create Content Type, FB-012 Edit, FB-013 Delete, FB-014 Draft Publishing, FB-015 Version History, FB-016 Localization.
4. **Visual Builder:** FB-017 Page Tree, FB-018 Drag-Drop Components, FB-019 Responsive Preview, FB-020 Block Library, FB-021 Theme Mgmt, FB-022 Animation Mgmt.
5. **Database Builder:** FB-023 Create Table, FB-024 Create Field, FB-025 Create Relation, FB-026 Index Mgmt, FB-027 Query Builder.
6. **Workflow Builder:** FB-028 Create Workflow, FB-029 Add Trigger, FB-030 Add Action, FB-031 Schedule, FB-032 Logs.
7. **API Layer:** FB-033 REST Gen, FB-034 GraphQL Gen, FB-035 Webhooks, FB-036 Swagger Gen.
8. **CRM:** FB-037 Lead Mgmt, FB-038 Contact Mgmt, FB-039 Deal Pipeline, FB-040 Activities.
9. **Commerce:** FB-041 Products, FB-042 Inventory, FB-043 Orders, FB-044 Coupons, FB-045 Payments.
10. **AI:** FB-046 Generate Page, FB-047 Generate Workflow, FB-048 Generate Database, FB-049 Generate API, FB-050 Generate Content.
11. **Marketplace:** FB-051 Template Install, FB-052 Plugin Install, FB-053 Workflow Marketplace, FB-054 AI Agent Marketplace.
12. **Developer Platform:** FB-055 Code Viewer, FB-056 Code Editor, FB-057 Custom API, FB-058 Custom Component, FB-059 Plugin SDK, FB-060 CLI.

## 16. Document set (filenames — cross-reference these)

- `00-QUESTIONS.md` — open decisions / clarifying questions
- `01-PRD.md` — Product Requirements Document
- `02-TECHNICAL-ARCHITECTURE.md` — Technical Architecture Document
- `03-SECURITY-AND-ACCESS.md` — Security & Access Document
- `04-FRONTEND-SPEC.md` — Frontend Specification Document
- `05-FEATURE-TICKETS.md` — Feature Ticket List (epics + FB-### tickets)
- `README.md` — index
