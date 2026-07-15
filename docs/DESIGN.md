---
name: BIG O
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#c3c6cf'
  on-secondary: '#2d3137'
  secondary-container: '#454950'
  on-secondary-container: '#b5b8c1'
  tertiary: '#f4f6ff'
  on-tertiary: '#263143'
  tertiary-container: '#cfdaf2'
  on-tertiary-container: '#545f73'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#dfe2eb'
  secondary-fixed-dim: '#c3c6cf'
  on-secondary-fixed: '#181c22'
  on-secondary-fixed-variant: '#43474e'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 18px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for this product is built for high-performance database management, targeting a sophisticated developer audience. The brand personality is precise, powerful, and futuristic, evoking the feeling of a high-end command center. 

The style is **Professional Modernism** with a **Tech-Futurist** edge. It leverages a dark-mode first interface to reduce eye strain during long sessions. The aesthetic combines clean, systematic layouts with subtle **Glassmorphism** for depth and **Neon Accents** to highlight critical data states. Every pixel communicates reliability and computational speed, ensuring the UI feels like a seamless extension of the developer's workflow.

## Colors
The palette is centered on a "Midnight Core" architecture. The background uses deep, desaturated blues to provide a stable foundation for high-contrast data visualization.

- **Primary (Cyan Neon):** Used sparingly for primary actions, active states, and critical paths. It represents energy and connectivity.
- **Secondary (Midnight Blue):** The primary surface color, creating a "pro" atmosphere that feels deep and expansive.
- **Tertiary (Slate Gray):** Used for borders, dividers, and secondary containers to provide structure without visual noise.
- **Neutral (Cloud Gray):** Reserved for supporting text and icons to ensure legibility while maintaining the dark aesthetic.
- **Functional Colors:** Success (Emerald), Warning (Amber), and Error (Crimson) are rendered in high-chroma variants to pop against the dark background.

## Typography
The typographic hierarchy prioritizes technical clarity. **Geist** provides a sharp, geometric feel for headings, while **Inter** ensures maximum readability for dense data sets and documentation. **JetBrains Mono** is utilized for all code snippets, query builders, and metadata values to reinforce the developer-centric nature of the tool.

- **Headlines:** High weight and tight tracking for a powerful, "big data" impact.
- **Body:** Generous line-height for readability in long-form configuration text.
- **Labels:** Uppercase styles for category headers to differentiate from interactive text.

## Layout & Spacing
The layout follows a **Strict Fluid Grid** model. The interface is divided into a sidebar navigation (fixed 240px or 64px collapsed), a utility panel, and a primary data workspace that expands to fill the viewport.

- **Base Unit:** A 4px baseline grid ensures mathematical precision across all components.
- **Density:** The system supports "Standard" and "Compact" views. Compact view reduces vertical padding by 50% for dense database schema views.
- **Breakpoints:** 
  - Mobile (<768px): Single column, hidden sidebar (hamburger menu).
  - Tablet (768px - 1280px): Collapsed sidebar, fluid main content.
  - Desktop (>1280px): Persistent sidebar, multi-pane layout for split-view querying.

## Elevation & Depth
Elevation is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional shadows. In a dark "pro" UI, light and opacity represent height better than black shadows.

- **Level 0 (Background):** Deepest Midnight blue (#0A0E14).
- **Level 1 (Card/Surface):** Slightly lighter navy (#111827) with a 1px slate border.
- **Level 2 (Modals/Popovers):** Semi-transparent background (80% opacity) with a `backdrop-filter: blur(12px)` and a subtle cyan inner glow (0.5px border).
- **Interactions:** Hovering over interactive elements increases the border brightness and adds a subtle cyan "glow" (outer shadow, 0px 0px 8px rgba(0, 240, 255, 0.2)).

## Shapes
The shape language is **Technical and Sharp**. We use a "Soft" roundedness setting (4px base) to retain a professional, structured look while avoiding the harshness of 90-degree corners.

- **Small Components (Buttons, Inputs):** 4px (rounded-md).
- **Medium Components (Cards, Modals):** 8px (rounded-lg).
- **Status Indicators:** 2px or sharp corners to denote systematic rigour.

## Components
- **Buttons:** Primary buttons are solid Cyan with black text for maximum contrast. Secondary buttons are outlined with a subtle hover "fill" effect.
- **Inputs:** Dark backgrounds with 1px slate borders. On focus, the border turns Primary Cyan with a faint outer glow.
- **Data Grids:** Zero-border horizontal cells with alternating row highlights (Zebra striping at 2% opacity).
- **Chips:** Monospace font labels, using color-coded borders (e.g., a "String" type chip has a blue border, "Integer" has a purple border).
- **Cards:** No shadows. Uses a 1px border (#1E293B) and a slightly elevated surface color.
- **Query Editor:** Custom syntax highlighting using the primary brand colors (Cyan for keywords, Slate for comments).
- **Status Badges:** Small, circular dots with a "pulsing" animation for active real-time database connections.