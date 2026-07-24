---
name: Sarthi Ecosystem
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-xl:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  touch-target-min: 48px
  component-gap-sm: 8px
  component-gap-md: 16px
  section-gap: 32px
---

## Brand & Style

The design system is built on a foundation of **Modern Functionalism** with a **Tactile** twist. It serves a tri-fold ecosystem: the grounding stability of the earth (Farmer), the fluid movement of logistics (Transport), and the vibrant energy of the marketplace (Buyer). 

The brand personality is dependable yet innovative. The UI utilizes high-clarity layouts and significant whitespace to reduce cognitive load across varying literacy levels. While the base architecture remains consistent to reduce development overhead, color serves as a critical wayfinding tool to instantly signal the current user mode. The aesthetic combines clean, professional lines with oversized, touch-friendly elements to ensure accessibility in outdoor and high-activity environments.

## Colors

This design system utilizes a **Multi-Primary Strategy**. Each persona is tethered to a specific hue that dominates the functional accents, active states, and primary actions:

- **Farmer (Earth Deep Green):** Uses `#1B4332` for a sense of growth and reliability. High-contrast white text is mandatory on this background.
- **Transport (Logistics Blue):** Uses `#023E8A` to evoke efficiency and trust. 
- **Buyer (Produce Orange):** Uses `#E85D04` to stimulate appetite, urgency, and freshness.

The background remains a crisp, neutral light gray/white across all personas to maintain a modern look, while semantic colors (success green, error red) are used sparingly to avoid confusion with the persona-specific primary colors.

## Typography

Lexend is the exclusive typeface for this design system, chosen specifically for its hyper-legibility and variable spacing designed to reduce visual stress. 

- **Hierarchy:** We use exaggerated size differentials between labels and body text to assist users with lower literacy. 
- **Scale:** The base body size is set to 18px for the Farmer persona to ensure readability in sunlight, while the Transport and Buyer personas may utilize the 16px variant for more data-dense views.
- **Weights:** Use Bold (700) for primary calls to action and Medium (500) for supporting labels. Avoid Light weights to maintain high contrast.

## Layout & Spacing

The design system employs a **Fluid-Responsive Grid** based on an 8px square rhythm. 

- **Safe Zones:** A generous 24px side margin is maintained on mobile to prevent accidental touches near the screen edge.
- **Touch Targets:** All interactive elements (buttons, toggles, links) must maintain a minimum height of 48px, specifically optimized for the Farmer and Transport personas who may be using the device one-handed or in rugged conditions.
- **Information Density:** The Buyer persona uses tighter 8px gutters to showcase product galleries, whereas the Farmer persona uses 16px gutters to ensure clear separation between distinct pieces of information.

## Elevation & Depth

To maintain a modern yet accessible feel, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (Base):** Neutral background `#F8F9FA`.
2.  **Level 1 (Cards):** Pure white `#FFFFFF` with a very soft, 10% opacity shadow (Y: 4px, Blur: 12px) using a tint of the persona's primary color.
3.  **Level 2 (Active/Floating):** Used for Primary Action Buttons (FABs) and active modals. These feature a more pronounced shadow (Y: 8px, Blur: 20px) to indicate "tap-ability."

Avoid heavy skeuomorphism; use subtle inner-borders (1px, 5% opacity black) to define edges on white backgrounds.

## Shapes

The shape language of this design system is defined by **Friendly Geometry**. Rounded corners are used consistently to make the interface feel approachable and safe.

- **Standard Radius:** 0.5rem (8px) for cards and input fields.
- **Large Radius:** 1rem (16px) for main containers and bottom sheets.
- **Full Radius (Pill):** Used exclusively for Buttons and Status Chips to differentiate them clearly from informational cards.

The "Rounded" (Level 2) setting ensures that even high-contrast, bold-colored elements feel soft and easy on the eyes.

## Components

- **Buttons:** All primary buttons are pill-shaped and use the persona’s primary color. For the Farmer persona, buttons include a leading icon (e.g., a tractor or a seed) to provide visual cues for low-literacy navigation.
- **Cards:** Cards use Level 1 elevation. In the Buyer persona, cards feature edge-to-edge imagery to emphasize "freshness." In the Transport persona, cards prioritize key-value pairs (e.g., "Weight: 500kg") in bold Lexend.
- **Input Fields:** Fields use a 2px stroke when focused, using the persona's primary color. Labels are always persistent (not floating) to ensure the user never loses context.
- **Status Chips:** Small, pill-shaped indicators. For example, a "Delivered" chip in the Transport view uses a subtle Logistics Blue tint with dark blue text.
- **Visual Cues:** For the Farmer persona, use high-quality custom iconography and photography instead of abstract illustrations. Every major action must be accompanied by a recognizable icon.
- **Data Tables:** Exclusive to the Transport and Buyer personas; these should be simplified with horizontal-only rules and large row heights (min 56px).