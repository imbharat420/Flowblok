# Changelog

All notable changes to Flowblok are documented here. Releases are tagged on `main`
(`vMAJOR.MINOR.PATCH`); each module ships on its own `feat/*` branch and is merged with a release.

## [Unreleased]

## [0.8.0] — 2026-06-17
**Multi-space switcher + delete-to-archive (30-day restore).**
### Added
- **Notion-style space switcher** (top-left): colored space tiles, active checkmark, current-space header
  with Settings, inline **New space** creation, and **Manage all spaces**. Active space persists in a cookie.
- **Delete → 30-day archive**: Settings → Danger now opens a **type-to-confirm modal** that soft-deletes
  the space into a 30-day archive (then routes to Spaces → Archived).
- **Spaces page**: Active / Archived view toggle; archived rows show an **auto-delete countdown** + one-click
  **Restore**; new-space modal; drawer delete archives with confirm.
- Backend: `archivedAt`/`purgeAt` (now + 30 days) on spaces; `POST /api/spaces` (create),
  `GET /api/spaces/archived`, `POST /api/spaces/:id/archive`, `POST /api/spaces/:id/restore`
  (all mutations gated by `manage_spaces`).

## [0.7.1] — 2026-06-17
### Fixed
- Settings → Developer toggle switches: the knob anchored to its static position (so OFF/ON looked
  the same and ON overflowed) and the track was nearly invisible in dark mode. Switched to explicit
  `left` positions + a bordered track + centered knob.

## [0.7.0] — 2026-06-16
**Block bindings: dynamic Logic, method-aware API binding, and an Events builder.**
### Added
- **Logic tab** — dynamic condition builder (typed subject → operator → value, Show/Hide, ALL/ANY) with
  a searchable library of **~90 prebuilt presets** across 8 scenario families (identity, role, plan/paywall,
  device/responsive, campaign/A-B, commerce, locale/geo/consent, data-state). A **"Preview as" persona**
  selector drives live show/hide on the canvas (hidden blocks dim + badge).
- **Data tab → API** is now **method-aware**, driven by **120 endpoint profiles**: GET (read) → param inputs
  + response-field map + read trigger; POST/PUT/PATCH/DELETE (mutation) → action trigger + request-body map
  + result target. `GET /api/apis/:id` returns the full profile.
- **Events tab** — dynamic trigger → actions builder with **73 action types** and **120 real-life recipes**
  (navigation, forms→CRM, commerce, workflow/API/AI, UI feedback, analytics, social/media, auth).
- Catalogs designed via parallel multi-agent passes; `icon.tsx` resolves any lucide icon by name.

## [0.6.0] — 2026-06-16
**Full-page, Storyblok-grade visual editor.**
### Added
- **Full-page editor** at `/editor/:id` (outside the app shell — own viewport + back button);
  legacy `/content/:id` redirects here. Top bar: back · title+status · viewport toggles · History · Save · Publish.
- **Block handles** in the Layers panel: select, move up/down, add-inside, remove (nested tree).
- **Relocated "Add block"** from the inline panel into a searchable centered picker + canvas insert zone.
- **Real Data binding** (Data tab): live pickers for Databases / Workflows / APIs / CRM / Commerce —
  references actual flows, persisted on the block, no code.
- **Version history**: every save snapshots a version; History drawer lists versions with one-click Restore.
  Backend: `GET /api/content/:id/versions`, `POST /api/content/:id/restore`.
- **Publish** action (status → published); `moveNode` reorder helper.

## [0.5.0] — 2026-06-16
**Apply specs to code: real write paths + 3-layer RBAC enforcement.** The admin now manages state,
not just displays it (PRD/FSD flows + 03-SECURITY-AND-ACCESS.md enforcement).
### Added
- **RBAC enforcement (layers 1 & 2)**: active role mirrored to an `fb_role` cookie;
  `requireCapability()` server guard on every mutating route (403 when denied); `<RequireCapability>`
  page guard blocks direct-URL access for under-privileged roles.
- **Users** writes: invite member, change role, suspend/activate (`manage_users`).
- **Content** writes: create (opens the builder) + delete; builder save now gated (`edit_content`).
- **CRM** writes: create lead + move deals across the pipeline stages (`manage_crm`).
- **AI**: one-prompt generation now creates a real draft Story and links straight to it (`use_ai`).
- Guards added to the AI generate and Settings write routes (`use_ai` / `manage_settings`).
### Verified
- owner/editor/manager mutations return 201/200; under-privileged roles return 403.

## [0.4.0] — 2026-06-16
**Full admin suite + super-admin RBAC.** All 16 modules are now live.
### Added
- **RBAC foundation**: role → capability matrix (`rbac.ts`), `can()` / `isSuperAdmin()`, auth/role
  context, top-bar **role switcher** (Owner = super admin), capability-gated sidebar.
- **Shared UI kit**: Button, Badge, DataTable, Drawer, Tabs, PageHeader, EmptyState (DRY across modules).
- **13 modules** (each = repository → service → controller + API + page):
  Spaces, Pages, Components, Database, APIs, CRM (Lite pipeline), Commerce, AI (one-prompt generation),
  Analytics (role dashboards), Marketplace, Assets, **Users & Roles** (super-admin capability matrix), Settings.
- Settings danger-zone (delete space) gated to the Owner via `can("manage_billing")`.

## [0.3.0] — 2026-06-16
**Workflow Builder (n8n-style).**
### Added
- Workflows list (`/workflows`) with status, node count, run stats.
- Canvas editor (`/workflows/:id`): dark grid canvas, draggable node cards, SVG bezier connections,
  node palette grouped by category, node inspector, and a "Test workflow" execution animation.
- Workflow engine API (repository → service → controller): `GET /api/workflows`,
  `/api/workflows/:id`, `/api/workflows/node-types` (14 node types).
- n8n/Boomi power behind a simpler abstraction — the engine, not n8n, is exposed.

## [0.2.0] — 2026-06-16
**Visual Page Builder.**
### Added
- 3-pane page builder at `/content/:id`: block tree · live canvas · properties.
- Properties panel with all 7 block tabs (Design · Data · Logic · Permissions · Events · SEO · AI);
  Design edits props live, Data shows the universal data-source binder.
- Responsive preview (desktop / tablet / mobile), block library, add/remove blocks, undo-free immutable tree edits.
- Component (block) registry — `GET /api/components` (8 block types with field schemas).
- Content write path — `PUT /api/content/:id` (repository → service → controller) with Save.

## [0.1.0] — 2026-06-16
**Planning suite + first visualization.**
### Added
- Planning documentation (`docs/planning/`): PRD, Technical Architecture, Security & Access,
  Frontend Spec, Feature Tickets (FB-001…FB-068+), SRS, FSD, Design System, plus `_CONTEXT.md`.
- Flowblok app scaffold — Next.js 15 (App Router) + TypeScript + Tailwind v4, ModernDark tokens.
- App shell: inverted-L chrome, 16-module sidebar, unified top bar, ⌘K command palette, theme toggle.
- Space **Dashboard**: 8 KPI cards, content-pipeline widget, activity stream.
- **Content** module: Storyblok-style stories list (folders rail, status tabs, search).
- Layered API (controller → service → repository): `GET /api/content`, `/api/content/:id`, `/api/space`.

[Unreleased]: https://github.com/imbharat420/Flowblok/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.8.0
[0.7.1]: https://github.com/imbharat420/Flowblok/releases/tag/v0.7.1
[0.7.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.7.0
[0.6.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.6.0
[0.5.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.5.0
[0.4.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.4.0
[0.3.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.3.0
[0.2.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.2.0
[0.1.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.1.0
