# Design reference (Stitch export)

This folder vendors the **Stitch** bilingual HTML explorations and the **Pragati Sangam** design specification for Sarthi Setu V2.

| Path | Contents |
|------|----------|
| [`stitch-saarthi/pragati_sangam/DESIGN.md`](stitch-saarthi/pragati_sangam/DESIGN.md) | Tokens, typography (Plus Jakarta + Inter), surfaces, Saathi Didi rules |
| `stitch-saarthi/*/code.html` | Static reference screens (landing, onboarding, farmer, buyer, logistics) |

**Usage:** Implement in React using these as **visual and UX reference only** — not pixel-perfect HTML ports. Production CSS variables live in [`/index.css`](/index.css). Reusable V2 UI primitives live in [`/components/v2/ui/`](/components/v2/ui/) (`Card`, `TextField`, `V2Button`, `StepIndicator`, `AppHeader`).
