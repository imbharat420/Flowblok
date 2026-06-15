# Changelog

All notable changes to Flowblok are documented here. Releases are tagged on `main`
(`vMAJOR.MINOR.PATCH`); each module ships on its own `feat/*` branch and is merged with a release.

## [Unreleased]

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

[Unreleased]: https://github.com/imbharat420/Flowblok/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/imbharat420/Flowblok/releases/tag/v0.1.0
