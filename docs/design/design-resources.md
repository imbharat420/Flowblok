# Atlas / OIOS — Design Resources & System Reference

> The professional design system for **OIOS / EIOS** and its **Atlas** planner board, grounded in live
> research of the tools you named — **WakaTime** (dashboards), **CodeBurn** (token economics),
> **CodeRabbit** (code review) — plus Linear / Vercel / Stripe and the shadcn · Radix · Tremor stack.
> Your curated inspiration index and 35-style catalog are preserved at the bottom (§9–§10).
> **Maintained for:** Bharat Singh · **Aesthetic North Star:** `ModernDark` (Linear/Vercel/Raycast-grade).

> ⚠️ **Naming collision to resolve:** CodeRabbit publicly brands its AI code-review interface
> **"Atlas"** ("the first AI-native code review interface") — the same name, in the same space
> (code review). Decide early whether to rename the planner, qualify it ("Atlas Planner / OIOS Atlas"),
> or accept the overlap. Flagged so it's a deliberate choice, not a surprise.

---

## 0. Surfaces this system must serve

| Surface | What it is | Primary references |
|---|---|---|
| **Atlas planner board** | local kanban with the chained review pipeline | Linear (board+detail), Height (keyboard), CodeBurn (cost lane) |
| **OIOS web app** | role dashboards: CEO · CTO · Manager · Dev | Stripe (progressive disclosure), WakaTime (breakdowns), Vercel (chrome) |
| **Token Economics** | spend, waste, AI-efficiency | CodeBurn (outcome-weighted), WakaTime AI (Cost/Adoption/Effectiveness) |
| **Code Review UI** | AI review output + review-chain drawer | CodeRabbit (cohorts/layers, two-axis findings) |
| **Marketing / landing** | the public story | the 35-style catalog (§10), the elite prompt |

One product, one chrome, one token set across all of it.

---

## 1. Design DNA — the token system (single source of truth)

**Author tokens in OKLCH; never hardcode hex in a component.** Re-theme the whole app by overriding
the same variables under `:root`, `.dark`, and `.high-contrast`.

### 1.1 Semantic UI tokens (shadcn contract, ~27 vars)
`background / foreground`, `card / card-foreground`, `popover / popover-foreground`,
`primary / primary-foreground`, `secondary`, `muted / muted-foreground`, `accent`, `destructive`,
`border`, `input`, `ring`, `chart-1…5`, `sidebar / sidebar-primary / sidebar-accent / sidebar-border / sidebar-ring`.
Single `--radius` knob derives `sm 60% · md 80% · lg 100% · xl 140%`.

```css
/* dark-first (the product default) — OKLCH */
:root.dark{
  --background:oklch(0.145 0 0); --foreground:oklch(0.985 0 0);
  --card:oklch(0.176 0 0); --muted-foreground:oklch(0.70 0 0);
  --primary:oklch(0.62 0.19 268);            /* indigo accent (Linear-family) */
  --destructive:oklch(0.704 0.191 22.2);
  --border:oklch(1 0 0 / 0.08); --ring:var(--primary);
  --radius:0.75rem;
}
```

### 1.2 Radix 12-step state ramp (the mental map for every interactive surface)
`1–2` app/subtle bg · `3` component default · `4` hover · `5` pressed/selected/**dragging** ·
`6` subtle border · `7` interactive border · `8` strong border / **focus ring** · `9–10` solid /
solid-hover · `11` low-contrast (meta) text · `12` high-contrast (primary) text.
Kanban mapping → board bg 1–2, card 3, card hover 4, dragging/selected 5, idle border 6, focus ring 8,
status pill solid 9, meta text 11, title text 12.

### 1.3 Three color domains — keep them SEPARATE (research consensus)
1. **UI semantic** — the tokens above (one accent; chrome stays neutral).
2. **Categorical chart palette** — Tremor's `blue · emerald · violet · amber · gray · cyan · pink · lime · fuchsia`, bound to `chart-1…5`; color-blind-safe (prefer blue/orange over red/green).
3. **Status/pipeline palette** — reserved, never reused as a chart series:
   `pass = green · pending/changes = amber · fail/blocked = red · info = blue · neutral = gray`.
   Atlas gate dots and the CodeRabbit-style severity scale live here.
> **Reserve saturated red/orange ONLY for waste / error / over-budget** so the eye locks onto problems; everything healthy stays cool & neutral (CodeBurn + Stripe).

### 1.4 Typography
`Inter` (body) + `Inter Display` (headings); **mono / tabular numerals** for all KPI figures and table
columns so digits align. Dense, utilitarian sizing (12–14px body); `step 11` muted for metadata,
`step 12` for primary; tracking-tight on display, relaxed leading on body.

### 1.5 Elevation, motion, themes, a11y
- **Elevation** (from `ModernDark`): multi-layer shadows — border highlight + soft diffuse + ambient + optional accent glow; never a single flat shadow. Near-blacks, never `#000`; off-white text, never `#fff`.
- **Motion budget:** purposeful only — drag handoff between stages, `NumberTicker` on KPI change, stage-transition fades, `AnimatePresence` card enter/exit. 200–300ms, expo-out, ≤8px moves. **Gate everything behind `prefers-reduced-motion`.** Keep motion off drag/scroll hot paths.
- **Themes:** light / dark (default) / high-contrast — high-contrast is *not* free from dark: push text to step 12, borders to step 8, drop low-contrast muted text.
- **Accessibility:** WCAG AA minimum. Radix Primitives give roles/focus/keyboard; you still must verify OKLCH contrast (esp. muted-on-muted and chart-on-card). Never encode state by color alone — pair with icon + label.

---

## 2. Reference tools → OIOS surface mapping (grounded)

### 2.1 WakaTime → dashboards & analytics (OIOS web app, B10/B11)
- **Three-tier layout:** headline KPI row → full-width time-series activity chart → responsive grid of **horizontal-bar breakdown cards** (Languages/Editors/Projects/Categories…). Horizontal bar lists, **not pie charts**, for ranked breakdowns.
- **One universal breakdown component** fed by a normalized record `{label, value, percent, color}` renders *any* dimension (developer, project, agent, review stage) identically.
- **AI framing (adopt verbatim):** three pillars — **Cost** (spend per model/agent, per-dev) · **Adoption** (AI- vs human-written lines, % devs using AI) · **Effectiveness** (Human-Follow-up rate = how often AI code is rewritten). Add **tokens-per-line** & **prompt-length-per-model** for economics.
- **Drill-down to raw, correctable timeline** (durations view) → reuse for Atlas: clicking a card/pipeline run opens an inspectable, color-blocked timeline of stages/AI sessions.
- **Deterministic entity→color map** (languages = GitHub Linguist palette; agents/models = fixed; projects = user-customizable). Year-long **calendar heatmap** on profiles. **Job-title segmentation** → CEO/CTO/Manager/Dev role views.

### 2.2 CodeBurn → token economics (B11) — the differentiator
- **Lead with WASTE, not raw spend.** Headline = outcome split **Productive / Reverted / Abandoned** (100% stacked bar, green/amber/red) + a single **Waste %**. One-shot rate (% turns succeeding without retries) is the **AI-efficiency KPI**, a first-class column in every breakdown (per engineer/repo/activity/model), green→red scaled.
- **A–F "token-health" report-card grade** on CEO/CTO dashboards, drilling into ranked findings each with a `$`-savings estimate + a copy-paste fix.
- **Always break tokens into types** (input / output / cache-read / cache-write / reasoning) — cache economics dominate agent cost; a single "tokens" total lies.
- **3-zone web grid** (12-col, react-grid-layout): stat cards → time-series → ranked tables. **Top-5 most expensive sessions** + `>2×`-peer outlier flag. Gradient bars (btop blue→amber→orange = heat) for a terminal/board cost lane. CSV/PDF export.
- *Use OIOS's real merge/review pipeline for outcome attribution* (don't trust pure git heuristics). Frame per-engineer cost as enablement, not surveillance.

### 2.3 CodeRabbit → AI review engine + Atlas review drawer (B6, B14)
- **Cohort → layer → range model** (the single most reusable idea): don't dump a flat file list — group changes into semantic **cohorts**, split into ordered **layers** (schema → logic → call sites → frontend → tests), each with its own AI summary anchored to line ranges.
- **Two independent axes on every finding:** `type {bug · refactor · nitpick}` (icon) **+** `severity {Critical · Major · Minor · Trivial · Info}` (chip) **+** category {Functional Correctness · Maintainability · Security · Data Integrity · Stability}. Make both first-class **filter facets**. **Gate the Atlas chain on severity** (no advance past Review with open Critical/Major).
- **Three-panel review workspace:** cohort/layer navigator | diff | live per-range context. Diff modes Unified / Split / **Semantic**. **Keyboard-first** (J/K next-prev, Z focus). **Code Peek** symbol popover + **semantic search** over summaries. **Snapshot/stale-view banner** tied to commit SHA.
- **Action-first findings:** one-click committable suggestion + "Fix with AI"/send-to-agent + copy-paste "Prompt for AI Agents" block. **Conversational** control (`@`-mention: ask/pause/resume/resolve/gen-tests).
- **Analytics:** stat cards (PRs merged, median merge time, **reviewer time saved**, suggestion acceptance rate) + **severity donut** + **category donut** → drill into filterable findings table; CSV/JSON/REST export.
- *Default low-severity (nitpicks) OFF behind a profile* (alert-fatigue); generate diagrams **only when they help**.

### 2.4 Linear / Vercel / Stripe / Height / Plane / Jira → app chrome & board
- **Inverted-L chrome:** dimmed, collapsible/resizable left sidebar (switcher + starred/recent + pinned) + **one unified top header/view-control bar** identical across *every* module. (Linear unified this deliberately — OIOS spanning planner+dashboards+review is at high risk of drift.)
- **Cmd/Ctrl+K command palette as primary action surface** — must *execute* (move cards, set any property, navigate, trigger AI), not just search. User-assignable shortcuts (Height).
- **One data model, switchable views:** Kanban (default) + List + Spreadsheet (per-column props, multi-select batch edit, multi-card drag); regroup board by stage/assignee/agent/priority (Plane/Height/Linear).
- **Stripe progressive disclosure:** each role dashboard **leads with one health metric**, then KPI cards = `big number + signed % delta + sparkline`, then drill-down. Strict semantic color.
- **Live status as colored pills** on cards + (web) tab favicon (Vercel). **Information density over whitespace** — compact rows (id + title + pill + priority + avatar) with a density toggle.
- **First-class empty / loading / error states:** layout-matched **skeletons** (not spinners), instructive empty states, recoverable error pills, Stripe-Workbench-style aggregated health view.

---

## 3. Component foundation

**Stack:** Tailwind v4 + **shadcn/ui** (own the source) on **Radix Primitives** (focus trap/return,
Esc-dismiss, ARIA for free) + **Tremor** for dashboard pieces. Encode every component's variants/states
with **class-variance-authority** (like shadcn `Button`: default/secondary/outline/ghost/destructive/link ·
xs/sm/default/lg/icon). Standard focus: `focus-visible:ring-ring focus-visible:ring-[3px]`.

Build all overlays (review diff drawer, card detail, command palette, stage-config) on **Radix** so
keyboard/focus/ARIA come for free. **Marketing-only libraries** (Magic UI bento/beams/marquee,
Aceternity aurora/spotlight/3D) **must not leak into the operational app** — perf + density cost.

Key custom atoms: **Universal Breakdown** (`{label,value,percent,color}` → horizontal bar row),
**KPI card** (number + delta + sparkline), **Status pill**, **Kanban card** (id/title/pill/priority/avatar
+ gate dots), **Review drawer** (3-panel), **Pipeline Tracker** (one cell per gate/run).

---

## 4. Chart system — library split & chart→metric map

**Primary = Tremor** (copy-paste, dark-ready, shadcn-matched, rides Recharts). **Drop to raw Recharts**
for composed/treemap/funnel. **Add Nivo (per-package only)** for the three Tremor/Recharts do poorly:
**Calendar** heatmap, **HeatMap** matrix, **TreeMap**, **Bump**. **visx** only for bespoke Atlas viz
(e.g. the pipeline DAG / dependency-lineage graph). **Observable Plot** for internal exploratory facets only.

| Metric | Chart | Lib |
|---|---|---|
| DORA (deploy freq, lead time, CFR, MTTR) | 2×2 KPI cards + delta + sparkline → trend; Elite/High/Med/Low tier bands | Tremor/Recharts |
| Token cost | **TreeMap** (size=spend, nested team→repo→model) + ranked **BarList** + daily-spend area | Nivo + Tremor |
| Code ownership | 100% stacked horizontal bar (author/team share) or Marimekko | Recharts/Nivo |
| Risk matrix | **HeatMap** (rows=files, cols=churn/complexity/coverage/review-depth), sequential single-hue | Nivo |
| Coding/agent activity | **Calendar** heatmap (GitHub-style year grid, 4–5 step ramp) | Nivo |
| Velocity | line / stacked-area over sprints + target ReferenceLine | Tremor/Recharts |
| Leaderboard | **BarList** (static) / **Bump** (rank-change over time) | Tremor / Nivo |
| Pipeline health | cumulative-flow / funnel across the chained gates; **Tracker** pass/fail strip | Tremor/visx |

Pitfalls: Tremor/Recharts are SVG (~5K-point ceiling → use Nivo Canvas variants at org scale); install
only the `@nivo/*` packages you use; standardize one tokenized scale (sequential for density viz,
categorical color-blind-safe for series, traffic-light for status + icon).

---

## 5. Surface blueprints (quick reference)

- **Atlas board** = Linear board+detail: gate columns, compact cards (+ gate dots, cost/one-shot chips à la CodeBurn), multi-card drag (dnd-kit), right-hand split detail, **Cmd+K** to move/set, List+Spreadsheet alternates, pipeline shown as cumulative-flow.
- **CEO** = org **A–F token-health grade** + **Waste %** headline + spend trend + cost-per-shipped-feature + reviewer-time-saved.
- **CTO** = per-repo/per-model efficiency (one-shot rate, cache-hit, cost/edit) + risk HeatMap + optimize findings ($ savings) + DORA.
- **Manager** = team flow (cumulative-flow), per-engineer/feature cost with one-shot columns, Top-5 expensive sessions, review throughput Bump.
- **Dev** = own sessions/cost/retries + context-bloat warnings + activity Calendar + assigned review queue.
- **Token Economics** = CodeBurn outcome split + Waste % + token-type breakdown + TreeMap + ProgressCircle budget burn.
- **Code Review UI** = CodeRabbit cohorts/layers, 3-panel, two-axis findings, severity/category donuts, snapshot banner, action-first fixes.

---

## 6. Anti-patterns (do NOT)
- Lead with raw **Total Spend** (every tool does it; least actionable) — lead with Waste %/outcome.
- Reuse a **chart color as a status color** (users misread the board).
- **Decorative color/gradients** in the operational UI — kills the at-a-glance status read.
- **Spinners** + unstyled empty states — use layout skeletons + teaching empty states.
- Pile module links into the **top nav** (Jira/Stripe moved away) — use the customizable sidebar.
- **Inconsistent headers/controls per module** — unify like Linear.
- **Marketing motion** (aurora/beams/3D) in dense dashboards.
- A single **"tokens" total** hiding cache economics; **averages** hiding the expensive-outlier tail (use P75/P95).
- **Per-engineer cost as surveillance** — frame as efficiency/enablement.

---

## 7. The 35-style catalog → where each belongs
Your `docs/design/landing/*.md` are full design-system prompts. Recommended assignment:
- **App / product (primary): `ModernDark`** (Linear/Vercel/Raycast — deep near-blacks, indigo accent, layered depth). This is the Atlas + dashboard aesthetic.
- **Enterprise dashboards / docs:** `Professional`, `Swiss Minimalist`, `Minimal Dark`, `Monochrome`.
- **Code / CLI / agent surfaces:** `Terminal`, `Tech Style`.
- **Marketing / landing (pick one per campaign):** `Bold Typography`, `Glassmorphism`, `Kinetic`, `Cyberpunk`, `Luxury`, `Maximalism`, `Neo-brutalism`, `Vaporwave`, etc.
Keep the **product** on one system; let **landing** express range.

---

## 8. Recommended install
`tailwindcss@4` · `shadcn/ui` · `@radix-ui/react-*` (via shadcn) · `@tremor/react` · `recharts` ·
`@nivo/calendar @nivo/heatmap @nivo/treemap @nivo/bump` · `framer-motion` · `dnd-kit` ·
`cmdk` (palette) · `lucide-react` (icons). Fonts: Inter + Inter Display + a mono (Geist Mono / JetBrains Mono).

---
https://github.com/vava-nessa/free-coding-models 
## 9. Inspiration Index — curated by Bharat (preserved)

**Style prompt libraries / AI UI:** designprompts.dev · impeccable.style · getdesign.md · https://www.draftly.space/ https://motionsites.ai/ https://iconsax.io/ 
https://motion.dev/docs https://animejs.com/  https://www.svgator.com/  https://jitter.video/?noredir=1
ui-ux-pro-max-skill.nextlevelbuilder.io · 21st.dev · Uiverse.io · Magic UI · Aceternity UI · Origin UI ·
shadcn/ui · HyperUI.
**Real product screenshots:** Mobbin · SaaSFrame · Pttrns · PageFlows · Refero · UI Jar · Screenlane · Nicely Done Club.
**Premium inspiration:** Awwwards · Dribbble · Behance · Godly · Land-book · Layers.to.
**Design-system MD collections:** Awesome Design MD (github.com/VoltAgent/awesome-design-md) · Design Vault.

**The "2026 AI UI stack":** 21st
.dev · getdesign.md · Mobbin · Refero · Magic UI · Aceternity · shadcn ·
SaaSFrame · Uiverse · Awwwards — design systems + real screenshots + components + landing + AI prompts + UX flows.

use 3d models from the webiste 
https://threejs.org - https://sketchfab.com/ - https://www.babylonjs.com/ - https://gsap.com/ - https://demos.gsap.com/explore/ - https://tympanus.net/codrops  - https://www.cssdesignawards.com/ -https://www.csswinner.com/ - 

----
http://net.tutsplus.com/
http://davidwalsh.name/
http://tutorialzine.com/category/tutorials/ 
https://webweekly.email/
https://webweekly.email/archive/web-weekly-167/
https://www.smashingmagazine.com/
https://www.paulirish.com/2011/web-browser-frontend-and-standards-feeds-to-follow/
https://www.creativebloq.com/netmag
---

## 10. Style catalog (preserved)
`docs/design/landing/`: Academia · Art deco · Bauhaus · Bold Typography · Botanical · Crypto · Cyberpunk ·
Enterprise · Flat design · Glassmorphism · Industrial · Kinetic · Luxury · Material Design · Maximalism ·
Minimal Dark · ModernDark · Monochrome · Neo Brutalism · Neo-brutalism · Neumorphism · NewsPrint · Organic ·
Playful geometric · Professional · Retro · Sketch · Swiss Minimalist · Tech Style · Terminal · Vaporwave.

---

## 11. Source links (from research)
WakaTime: wakatime.com/teams · /ai · /leaders ·
CodeBurn: github.com/getagentseal/codeburn · Helicone · Langfuse · OpenRouter Activity · Vercel AI Gateway ·
CodeRabbit: coderabbit.ai · /blog/introducing-atlas… · docs.coderabbit.ai ·
Linear: linear.app/now/how-we-redesigned-the-linear-ui · Vercel: vercel.com/blog/dashboard-redesign ·
Stripe: docs.stripe.com/dashboard · shadcn: ui.shadcn.com/docs/theming · Radix: radix-ui.com/colors ·
Tremor: tremor.so · Nivo: nivo.rocks · visx: airbnb.io/visx.
