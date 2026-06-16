# Changelog

All notable changes to Flowblok are documented here. Releases are tagged on `main`
(`vMAJOR.MINOR.PATCH`); each module ships on its own `feat/*` branch and is merged with a release.

## [Unreleased]

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

[Unreleased]: https://github.com/imbharat420/Flowblok/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.6.0
[0.5.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.5.0
[0.4.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.4.0
[0.3.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.3.0
[0.2.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.2.0
[0.1.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.1.0
