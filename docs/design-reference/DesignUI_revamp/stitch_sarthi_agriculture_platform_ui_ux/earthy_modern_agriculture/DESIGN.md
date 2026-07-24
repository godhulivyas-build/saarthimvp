---
name: Earthy & Modern Agriculture
colors:
  surface: '#f9f9f8'
  surface-dim: '#d9dad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#edeeed'
  surface-container-high: '#e7e8e7'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#414844'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#f0f1f0'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#0e6c4a'
  on-secondary: '#ffffff'
  secondary-container: '#a0f4c8'
  on-secondary-container: '#19724f'
  tertiary: '#3a2017'
  on-tertiary: '#ffffff'
  tertiary-container: '#52352b'
  on-tertiary-container: '#c79d90'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#a0f4c8'
  secondary-fixed-dim: '#85d7ad'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#e9bdae'
  on-tertiary-fixed: '#2d150d'
  on-tertiary-fixed-variant: '#5e3f35'
  background: '#f9f9f8'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-md:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-sm:
    fontFamily: Lexend
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-xl:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
  label-sm:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

This design system is built to serve as a reliable digital companion for the Indian farming community. The brand personality is grounded, empowering, and fertile, balancing the heritage of agriculture with the efficiency of modern technology. The visual style leans into a **Modern Tactile** approach—combining clean, functional layouts with physical metaphors that feel familiar to users who interact with the physical world.

The UI must prioritize extreme clarity and ease of use for a diverse user base, including those with varying levels of digital literacy. Every element is designed to feel substantial and "touchable," reducing the cognitive load through clear visual metaphors and a heavy reliance on universal iconography. The emotional response should be one of stability and growth, reassuring the user that the technology is a tool for their success, not a barrier.

## Colors

The color palette is inspired by the lifecycle of a crop. **Deep Green** provides a foundation of stability and authority, used for primary navigation and key headers. **Sprout Green** acts as the secondary driver, representing growth and active states. **Earthy Brown** is used sparingly as an accent to ground the UI in the soil, providing a tactile connection to the land.

To ensure outdoor readability under direct sunlight, this design system utilizes a high-contrast Light Mode. Backgrounds are a very light grey-green (#F8F9F8) to reduce glare compared to pure white. Alert colors are saturated and high-contrast: **Alert Yellow** for warnings and **Danger Red** for critical errors, ensuring they are unmistakable even on low-quality mobile displays.

## Typography

This design system uses **Lexend** as its primary typeface. Lexend was specifically designed to reduce cognitive noise and improve reading proficiency, making it an ideal choice for low-literacy users and multi-language support (English, Hindi, and Marathi). 

The base font size is set to a generous **18px** to ensure legibility on smaller mobile devices common in rural areas. Line heights are expanded to prevent text crowding, and font weights are used decisively to create a clear information hierarchy. For Hindi and Marathi scripts, the system maintains the same scale to ensure character density does not impede readability.

## Layout & Spacing

The layout philosophy follows a **Fluid Content** model centered around large, easy-to-tap touch targets. A 4-column grid is used for mobile views, while a 12-column grid is used for larger tablets, with generous 20px side margins to prevent accidental touches near the screen edges.

Spacing is governed by an 8px base unit. We prioritize "Stack" spacing (vertical) to create clear separation between different sections of a workflow. Large gaps (40px) are used to separate primary task areas, while smaller gaps (12px) group related information like a label and its corresponding input field.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**. Instead of complex layering, the system uses "elevation by containment." Surfaces that sit higher in the user's workflow (like an active modal or a primary action card) use a subtle 10% opacity Deep Green shadow to create a soft, natural lift from the page.

Background surfaces use flat, neutral colors, while interactive elements are "raised" using a combination of a 1px soft border and a low-blur shadow. This physical metaphor helps users identify what is interactive versus what is purely informational.

## Shapes

The shape language is defined by **Rounded** corners. Standard containers and cards use a 0.5rem (8px) radius, while larger primary cards and buttons use a 1rem (16px) radius. This softness makes the interface feel approachable and non-threatening. 

Iconography must follow this shape language, utilizing rounded terminals and thick strokes (2px minimum) to ensure they remain clear even at smaller sizes. Avoid sharp corners in all UI elements to maintain the friendly, organic "Earthy" aesthetic.

## Components

### Big Card-Based UI
Cards are the primary container for all content. Every card must have a minimum height of 120px to ensure a substantial touch area. Information inside cards should be led by a large icon (48px) on the left or top to provide immediate context without requiring the user to read the header first.

### Large Buttons
Buttons are oversized (minimum height 64px) to accommodate all thumb sizes. Every primary button must include both a descriptive icon and a text label. Secondary buttons use a thick 2px outline in Deep Green.

### Step-by-Step Indicators
Workflows (like applying for a loan or checking weather) are broken into linear steps. Indicators use large numbered circles (32px) connected by thick lines. The "Current" step is highlighted in Sprout Green, while "Completed" steps use a checkmark icon to provide clear positive reinforcement.

### Alert Banners
Alerts are full-bleed banners that appear at the top of the content area. They use high-contrast backgrounds (Alert Yellow or Danger Red) with bold black text and a large "!" or "X" icon. These are designed to be impossible to miss.

### Input Fields
Inputs use large 18px text and are always accompanied by a persistent top-aligned label. The active state is signaled by a thick 3px Sprout Green border, providing clear visual feedback on where the user is currently typing.