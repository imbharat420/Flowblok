---
name: Teal Precision
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3c4948'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6c7a79'
  outline-variant: '#bbc9c8'
  surface-tint: '#006a68'
  primary: '#006a68'
  on-primary: '#ffffff'
  primary-container: '#00b3b0'
  on-primary-container: '#003f3d'
  inverse-primary: '#4fdad7'
  secondary: '#565f69'
  on-secondary: '#ffffff'
  secondary-container: '#d7e1ec'
  on-secondary-container: '#5a646d'
  tertiary: '#50606e'
  on-tertiary: '#ffffff'
  tertiary-container: '#93a3b2'
  on-tertiary-container: '#2a3946'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#71f7f3'
  primary-fixed-dim: '#4fdad7'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504e'
  secondary-fixed: '#dae3ee'
  secondary-fixed-dim: '#bec7d2'
  on-secondary-fixed: '#131d24'
  on-secondary-fixed-variant: '#3f4851'
  tertiary-fixed: '#d4e5f5'
  tertiary-fixed-dim: '#b8c8d8'
  on-tertiary-fixed: '#0d1d29'
  on-tertiary-fixed-variant: '#394955'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
  sidebar-width: 260px
---

## Brand & Style
The design system is rooted in the principles of **SaaS Minimalism** and **Functional Clarity**. It is designed for high-utility environments like CMS platforms, documentation hubs, and dashboards where information density must coexist with visual breathing room.

The aesthetic is characterized by a "content-first" approach, utilizing heavy whitespace and a restricted color palette to minimize cognitive load. The emotional response is one of reliability, precision, and modern efficiency. By combining the neutrality of a professional tool with a vibrant teal accent, the system feels both authoritative and approachable.

## Colors
The palette is architectural, using neutrals to define structure and a single high-energy primary color for action.

- **Primary (#00B3B0):** Used sparingly for primary actions, active states, and focus indicators.
- **Surface & Background:** The main canvas is pure white (#FFFFFF), while sidebars and secondary panels use a subtle light grey (#F9FAFB) to create depth without relying on shadows.
- **Typography:** Deep navy (#1B242C) provides superior legibility for body text, while muted slate (#637381) is reserved for metadata and placeholder text.
- **Borders:** A consistent 1px stroke (#E3E8EE) is used for all structural containment.

## Typography
The system relies on **Inter** for its neutral, highly legible character at all sizes. Typography is used to establish a clear hierarchy through weight and scale rather than decorative shifts.

For technical contexts, documentation, or metadata that requires precision, **JetBrains Mono** is employed. On mobile devices, headline sizes should scale down by approximately 20% (e.g., `headline-lg` becomes 26px) to maintain readability within narrower viewports.

## Layout & Spacing
The layout follows a **fluid grid** model with fixed sidebar constraints. 

- **Desktop:** A 12-column grid with 24px gutters. The sidebar is fixed at 260px, while the main content area expands to a maximum of 1280px.
- **Tablet:** 8-column grid with 16px gutters. Sidebars often collapse into an icon-only drawer or a hidden overlay.
- **Mobile:** Single column with 16px horizontal margins.

The spacing rhythm is based on a 4px baseline, ensuring all padding and margins are multiples of 4 or 8. This creates a predictable, harmonious flow between components.

## Elevation & Depth
This design system uses **low-contrast outlines** as the primary method of separation. Depth is conveyed through subtle tonal shifts between surface layers (#FFFFFF vs #F9FAFB).

Shadows are used extremely sparingly to indicate temporary elevation (such as dropdowns, modals, or hovered cards). When applied, the shadow should be highly diffused and nearly imperceptible: `0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.02)`. Elements should appear as if they are resting on the page, not floating significantly above it.

## Shapes
The shape language is modern and approachable without being overly playful. A standard **8px (0.5rem)** radius is applied to buttons, cards, and input fields. 

Small utility items like chips or tags may use the `rounded-xl` setting (1.5rem) to provide visual variety and clearly distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid #00B3B0 background with white text. No gradient.
- **Secondary:** White background with #E3E8EE border and navy text.
- **Ghost:** No background or border, navy text that shifts to teal on hover.

### Cards
Cards are the primary container. They feature a 1px #E3E8EE border, no shadow by default, and 24px internal padding. On hover, cards may transition to a 1px #00B3B0 border or gain the subtle "ambient shadow."

### Input Fields
Inputs use a white background, 8px corner radius, and 1px #E3E8EE border. On focus, the border shifts to #00B3B0 with a 2px soft teal glow (ring).

### Navigation & Lists
Navigation items use a 16px horizontal padding and an 8px vertical padding. Active states are indicated by a teal left-hand vertical bar (4px wide) and a subtle #F0FBFB (very light teal) background tint.

### Chips & Badges
Small, high-contrast indicators for status. Use #F9FAFB as a base for neutral tags and tinted versions of teal for active/success states. Text is always semi-bold and slightly smaller (12px-13px).