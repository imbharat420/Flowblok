# Changelog

All notable changes to Flowblok are documented here. Releases are tagged on `main`
(`vMAJOR.MINOR.PATCH`); each module ships on its own `feat/*` branch and is merged with a release.

## [Unreleased]

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

[Unreleased]: https://github.com/imbharat420/Flowblok/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.2.0
[0.1.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.1.0
