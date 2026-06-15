---
name: Minimalist Community
colors:
  surface: '#f7fafb'
  surface-dim: '#d7dadb'
  surface-bright: '#f7fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f5'
  surface-container: '#ebeeef'
  surface-container-high: '#e6e9ea'
  surface-container-highest: '#e0e3e4'
  on-surface: '#181c1d'
  on-surface-variant: '#404848'
  inverse-surface: '#2d3132'
  inverse-on-surface: '#eef1f2'
  outline: '#707978'
  outline-variant: '#c0c8c8'
  surface-tint: '#366667'
  primary: '#003637'
  on-primary: '#ffffff'
  primary-container: '#1b4d4e'
  on-primary-container: '#8cbdbd'
  inverse-primary: '#9fcfd0'
  secondary: '#156969'
  on-secondary: '#ffffff'
  secondary-container: '#a3edec'
  on-secondary-container: '#1c6d6d'
  tertiary: '#2f302d'
  on-tertiary: '#ffffff'
  tertiary-container: '#454643'
  on-tertiary-container: '#b4b4af'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baecec'
  primary-fixed-dim: '#9fcfd0'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#1c4e4f'
  secondary-fixed: '#a6efef'
  secondary-fixed-dim: '#8ad3d3'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c7c7c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#464744'
  background: '#f7fafb'
  on-background: '#181c1d'
  surface-variant: '#e0e3e4'
  warm-white: '#FDFDFB'
  soft-charcoal: '#4A4E50'
  expat-node: '#E59A6A'
  hobby-node: '#6A8EAE'
  action-teal: '#26C6DA'
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
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is centered on the concept of "Empathetic Connection." It targets expats and newcomers who often feel isolated, providing a visual environment that is intentionally warm, stable, and low-friction. 

The style is a blend of **Minimalism** and **Modern Corporate**, drawing inspiration from highly structured yet airy content management interfaces. It avoids overwhelming the user with dense data, instead using generous whitespace and a clear visual hierarchy to guide the user toward "Actionable Meetups." The interface should feel like a supportive companion—proactive but never intrusive—using soft transitions and a spatial, node-based mental model to represent community networks.

## Colors

The palette is anchored in "Friendly Teals" and "Warm Whites" to move away from the sterile blues typical of social platforms. 

- **Primary & Secondary Teals**: Used for brand identification and primary navigation elements.
- **Warm White (#FDFDFB)**: The primary background color, providing a softer, more paper-like quality than pure white.
- **Neutral/Charcoal**: Used for body text and subtle UI borders to maintain high legibility without the harshness of pure black.
- **Node Colors**: Specific hues (Expat-node, Hobby-node) are reserved for the visual map to categorize life contexts at a glance.
- **Action Teal**: A higher-vibrancy variant used exclusively for buttons and interactive "Anchors" that lead to real-world meetups.

## Typography

This design system utilizes **Inter** exclusively to achieve a functional, systematic, and modern aesthetic. The typography is balanced for both high-level scanning (readability) and deep reading (legibility).

- **Display & Headlines**: Use tight letter spacing and heavier weights to create strong visual anchors for page sections.
- **Body Text**: Uses a generous 1.5x line height to prevent eye fatigue during longer community narratives or job stories.
- **Labels**: Small caps and slightly increased letter spacing are used for "Contextual Signifiers" (e.g., distinguishing between an "Expat" or "Local" tag).

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain "Storyblok-style" sidebars and panels, while transitioning to a **Fluid Grid** on mobile devices.

- **Grid System**: A 12-column grid is used for desktop (1280px max-width).
- **8pt System**: All spacing—padding, margins, and component heights—must be multiples of 8px (or 4px for fine-tuning).
- **Whitespace**: "Generous" is the guiding principle. Content containers should have a minimum of 32px internal padding to ensure the UI feels airy and low-stress. 
- **The Map**: The visual node map uses a free-form coordinate system, but nodes must respect a minimum "safe zone" of 24px from each other to prevent visual clutter.

## Elevation & Depth

To align with the "Minimalist Community" theme, depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Layers**: The base background uses `warm-white`. Elevated elements like Cards or Sidebars use a pure `#FFFFFF` background with a subtle 1px border in a light grey-teal.
- **Functional Glassmorphism**: Translucent layers (Backdrop Blur: 12px) are used for "Actionable Meetup" overlays and navigation bars, allowing the community map to peek through and maintain spatial context.
- **Shadows**: Only one level of shadow is permitted: an "Ambient Glow." It is a 16px blur, 0% offset, 4% opacity charcoal shadow used to subtly lift active modal dialogs.

## Shapes

The shape language is "Soft and Organic." Circularity is used for people and community nodes to represent inclusivity.

- **Components**: Standard buttons, inputs, and cards use a 0.5rem (8px) radius.
- **Nodes/Chips**: Interest nodes and category chips use `rounded-xl` (1.5rem / 24px) to create a "pill" or circular effect, which feels more human and less "industrial."
- **Icons**: Icons should feature rounded terminals and a consistent 2px stroke weight.

## Components

### Buttons
- **Primary**: Solid `action-teal` with white text. Rounded corners (8px). 
- **Secondary**: Ghost style with `primary-teal` border and text.
- **Anchor Button**: Large, pill-shaped button specifically for "Actionable Meetups" to make them the clear focal point.

### Cards
- Cards utilize a white background and a 1px soft border. No shadow unless hovered.
- Internal padding is set to `base * 4` (32px) to support the "airy" aesthetic.

### Interest Nodes
- Circular elements on the map. Size is determined by "activity level" (e.g., 40px to 80px).
- Nodes contain a central icon and a label positioned below or floating on hover.

### Inputs & Selectors
- Background is slightly tinted with `tertiary-color` to distinguish from the page background.
- Focus states use a 2px `secondary-teal` ring with 4px offset.

### Navigation
- A persistent "Safe Harbor" bottom bar on mobile and a minimalist side-rail on desktop. 
- Navigation utilizes labels with `label-md` typography to ensure the path is always clear to the newcomer.