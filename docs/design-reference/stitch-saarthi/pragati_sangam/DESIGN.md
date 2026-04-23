# Design System Specification: Grounded Sophistication

## 1. Overview & Creative North Star
### The Creative North Star: "The Vernacular Vellum"
This design system rejects the "standard startup" aesthetic of cold, clinical grids. Instead, it embraces **The Vernacular Vellum**—a philosophy that treats the digital interface as a series of warm, layered organic surfaces. It is "Bharat-first," meaning it balances the prestige of a high-end editorial magazine with the accessibility of a trusted community advisor.

We achieve this through **Intentional Asymmetry**. By breaking the rigid 12-column grid with overlapping elements and generous negative space, we create a layout that feels human and curated. The UI should not feel like a "software tool" but like a digital companion that respects the user's intelligence and cultural context.

---

## 2. Colors & Visual Philosophy
The color palette is rooted in the earth (Greens) and energized by the sun (Saffron). 

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning content. Boundaries are defined through:
- **Tonal Shifts:** Placing a `surface-container-highest` card on a `surface` background.
- **Negative Space:** Using the spacing scale to create mental boundaries.
- **Subtle Depth:** Using `surface-container-low` to define distinct content zones.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- Use `surface` (#fafaf5) as the base canvas.
- Use `surface-container-low` (#f4f4ef) for secondary information blocks.
- Use `surface-container-lowest` (#ffffff) for the most interactive elements (like cards or input fields) to create a natural "lift."

### The "Glass & Gradient" Rule
For the "Saathi Didi" AI companion and high-priority overlays, use **Glassmorphism**. Combine `tertiary_container` with a `backdrop-filter: blur(12px)` to create a frosted glass effect. For main CTAs, use a subtle linear gradient from `primary` (#0d631b) to `primary_container` (#2e7d32) at a 135-degree angle to provide a "soulful" depth that flat colors cannot achieve.

---

## 3. Typography: The Bilingual Voice
We use **Plus Jakarta Sans** for its high x-height and exceptional legibility in both Latin and Devanagari scripts.

### The Hierarchical Stack
In this design system, the "Bilingual UI" is not a toggle hidden in a menu; it is a structural pillar.
- **Primary Language:** Use `headline-sm` or `title-lg` for the user's preferred language.
- **Support Language:** Directly underneath or beside, use the secondary language in a `title-sm` or `body-md` scale using the `on_surface_variant` (#40493d) token to provide clear visual hierarchy without clutter.

### Scale Application
- **Display (L/M/S):** Reserved for hero impact moments or "Saathi Didi" greetings. 
- **Title (L/M/S):** Used for bilingual section headers. Always ensure the Hindi script has 1.2x the line height of the English script to prevent "Matra" clipping.
- **Label (M/S):** Used strictly for micro-copy and metadata.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card sitting on a `surface-container-high` background creates a clear, sophisticated lift.
- **Ambient Shadows:** For floating elements like the "Saathi Didi" mic, use a "Ghost Shadow." 
  - `box-shadow: 0 12px 32px -4px rgba(47, 49, 46, 0.08);` 
  - This mimics natural light rather than a synthetic digital effect.
- **The "Ghost Border" Fallback:** If a border is required for high-glare environments, use the `outline_variant` token at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### The "Saathi Didi" AI Companion
The centerpiece of the UI.
- **Visuals:** A floating circular button (`9999px` radius) using the `tertiary_container` color.
- **Treatment:** Apply a glassmorphism blur and the "Ambient Shadow" mentioned above.
- **Interaction:** The mic icon should pulsate subtly using a gradient transition between `tertiary` and `tertiary_fixed` to indicate she is "listening" or "ready."

### Bilingual Buttons
- **Shape:** Use the `xl` (3rem) or `full` (9999px) roundedness for a friendly, approachable feel.
- **Sizing:** Minimum height of `64px` for all primary actions to accommodate large, tappable targets.
- **Content:** English on top, Hindi/Regional below (in a smaller `label-md` scale) within the same button container.

### Cards & Lists
- **Rule:** No divider lines.
- **Separation:** Use `surface-container-low` backgrounds for the list item and `surface` for the gutter.
- **Typography:** Headlines should use `title-md`, and secondary bilingual text should use `body-sm`.

### Input Fields
- **Container:** `surface-container-lowest` with a `md` (1.5rem) corner radius.
- **States:** On focus, transition the background to `on_primary_container` at 5% opacity and increase the `outline` width to 2px using the `primary` color.

---

## 6. Do's and Don'ts

### Do
- **Do** prioritize vertical whitespace over lines. If a section feels messy, increase the margin rather than adding a divider.
- **Do** ensure all tap targets are at least 48x48dp, even for "small" UI elements.
- **Do** use the `primary_fixed` color for "success" states instead of a generic bright green to maintain the earthy tone.
- **Do** treat "Saathi Didi" as a person. Her messages should appear in speech bubbles that use `secondary_container` and `xl` roundedness.

### Don't
- **Don't** use pure black (#000000). Use `on_background` (#1a1c19) for all "black" text to keep the interface soft.
- **Don't** stack more than three levels of surface containers. It leads to visual "weight" that confuses the user.
- **Don't** ever use a border-radius smaller than `sm` (0.5rem) unless it’s for a very specific technical reason. Softness is key to trust.
- **Don't** hide the secondary language. Even if the user is fluent in English, the presence of the regional script reinforces the "Bharat-first" identity and builds comfort.