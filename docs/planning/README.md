# Flowblok — Planning Documentation

**Flowblok** — an AI-Native Visual Business Operating System (Digital Experience Operating System).
_"Build Content. Build Logic. Build Business."_ Generate, customize, deploy, manage and scale a complete
business platform from one prompt — then edit every layer (Visual · Database · Workflow · Code · AI) visually.

> Version 1.0 (FINAL) · 2026-06-16. This planning set was produced by analyzing `docs/Prompt.md`,
> `docs/Design.md`, the full `docs/ChatGPT-AI Website Builder Analysis (1).md`, the `docs/design/` style
> catalog, and the `docs/stitch/` variants — then reviewed and recursively improved by a simulated
> expert crew (CEO, CTO, legal, security, product/business analysts, PM, backend/frontend devs,
> frontend designer, code reviewer, customer voice, an n8n/Boomi/Zapier/Storyblok integration expert,
> and a holistic platform improver).

## Document set

| # | Document | What it covers |
|---|---|---|
| — | [`_CONTEXT.md`](./_CONTEXT.md) | Canonical source of truth — names, numbers, decisions all docs obey. |
| 00 | [`00-QUESTIONS.md`](./00-QUESTIONS.md) | Open decisions & clarifying questions (each with a recommended default). |
| 01 | [`01-PRD.md`](./01-PRD.md) | Product Requirements — vision, personas, scope, journeys, rollout, metrics, business model. |
| 02 | [`02-TECHNICAL-ARCHITECTURE.md`](./02-TECHNICAL-ARCHITECTURE.md) | System & service architecture, data models/ERDs, APIs, editor & workflow engines, AI subsystem, infra. |
| 03 | [`03-SECURITY-AND-ACCESS.md`](./03-SECURITY-AND-ACCESS.md) | Threat model, auth, RBAC/ABAC, RLS, multi-tenant isolation, AI/plugin security, compliance. |
| 04 | [`04-FRONTEND-SPEC.md`](./04-FRONTEND-SPEC.md) | App shell, IA, the visual page builder, workflow canvas, dashboards, Developer Mode, components. |
| 05 | [`05-FEATURE-TICKETS.md`](./05-FEATURE-TICKETS.md) | Groomed backlog — 12 epics, tickets FB-001…FB-068+ with acceptance criteria, MVP slice. |
| 06 | [`06-SRS.md`](./06-SRS.md) | Software Requirements Specification (IEEE-830 style) with REQ-IDs and traceability. |
| 07 | [`07-FSD.md`](./07-FSD.md) | Functional Specification — how each function behaves, screen flows, business rules. |
| 08 | [`08-DESIGN-SYSTEM.md`](./08-DESIGN-SYSTEM.md) | Design system, full color tokens, typography, motion, component specs, and core flows. |

## Reading order

- **Executives / new team members:** README → `01-PRD.md` → `00-QUESTIONS.md`.
- **Engineers:** `02-TECHNICAL-ARCHITECTURE.md` → `06-SRS.md` → `05-FEATURE-TICKETS.md` → `03-SECURITY-AND-ACCESS.md`.
- **Designers / frontend:** `08-DESIGN-SYSTEM.md` → `04-FRONTEND-SPEC.md` → `07-FSD.md`.

## The strategy in one line

Don't build everything at once (5% success). Ship the **AI Website Generator wedge first** (75% success
path), then Visual CMS → Template Marketplace → Commerce → CRM → Plugin Ecosystem. The moat is the
**five layers editable together**; the signature feature is **"Infinite Components"** (AI-generated, not a
capped library). See `00-QUESTIONS.md` for the decisions to confirm before the first build.
