## SAARTHI 3D interactive hero prompt (website-ready)

### One-line goal
In one immersive 3D story, show the full farmer lifecycle pain points and how **SAARTHI** improves decisions, logistics, labor access, and mandi outcomes—without fake “total income” claims.

### Recommended tools / formats
- **Spline** (fastest interactive web hero) or **Three.js/React Three Fiber** (maximum control)
- Export: **GLB** (Draco-compressed) + **KTX2** textures
- Provide: **poster image** fallback + **reduced-motion** mode

### Visual style
- Semi-realistic **low-poly**, Pixar-like friendliness
- Clean modern startup aesthetic (no clutter)
- Warm earthy palette: greens, browns, yellows, sky-blue
- Soft shadows, subtle bloom, minimal UI overlays

### Composition & UX constraints
- Mobile-first framing, safe CTA space (bottom-left or bottom-center)
- Avoid small text inside 3D; keep all captions as HTML overlays
- Loop length: **12–18s** (seamless), plus optional **scroll-driven** extended version
- Transparent background optional

---

## Scene brief (one continuous world)
Create one connected farm-world with a central **Indian farmer character** traveling through zones, left-to-right:

`Struggle → Saarthi Hub → Success`

### Farmer character
- Indian farmer inspired appearance, friendly face
- Turban/cap, kurta/shirt + dhoti/pants
- Starts with worried/uncertain expression; becomes confident/happy after Saarthi appears
- Subtle emotion transitions (eyebrows, posture, pace)

---

## Environment zones (connected in one scene)

### 1) Farm land area
- Soil field, tractor ploughing
- Seeds sowing animation
- Water pump, trees, small village hut

### 2) Labor search area
- Farmer looks around worried
- Worker silhouettes/icons appear but fade out (scarcity)
- After Saarthi: workers appear and converge gently (solution)

### 3) Crop growth area
- Time-lapse growth: seed → sprout → healthy crop
- Rain + sunlight cycle
- Wind sway (subtle)

### 4) Harvest area
- Workers cutting crops
- Grain/produce sacks stacking

### 5) Transport area
- Mini truck/tempo/pickup
- Loading crates
- Road leading to mandi (moving dashed lines or flowing path)

### 6) Mandi market area
- Stalls, buyers, price boards
- Initially chaotic “middlemen cluster”
- After Saarthi: clearer flow, calmer market motion (still realistic)

### 7) SAARTHI solution hub (central)
- Floating smartphone with SAARTHI logo
- Hologram dashboard panels
- Glowing connection lines to each zone (pulsing)

### 8) Success area
- Farmer smiling
- Subtle rising graph and coins (small, tasteful)
- Greener land + improved home ambience
- No big numbers; focus on “confidence & better outcomes”

---

## App feature popups (hover/click)
Hover on the hub reveals minimal popovers (icons + 1 line only):
- Labor booking
- Transport booking
- Live mandi rates
- Moisture/quality risk flag (risk band, not numeric deductions)
- Direct buyers connect
- WhatsApp ops updates

---

## Animations (premium but not busy)
- Camera: slow pan with parallax; optional scroll-driven travel across zones
- Ambient: birds, clouds drift, crops sway
- Truck motion loop, crate loading loop
- Saarthi hub glow pulse + connection lines
- Farmer emotion shift: worried → hopeful → happy

### Lighting
- Warm sunrise in struggle zones
- Bright daytime near hub/success
- Soft cinematic rim light on farmer/hub

---

## Website integration requirements
- Use **HTML overlay** for CTA: “Join Saarthi”
- Provide interaction hooks:
  - `onHoverFeature(featureId)` to highlight a zone
  - `onScrollProgress(p)` to move camera (optional)
- Performance:
  - Target < 6–8MB total for hero (compressed)
  - 30–60 FPS on mid Android devices
  - LOD / baked lighting / texture atlasing

---

## Deliverables checklist
- GLB + textures + poster image
- Reduced-motion alternative (static frame + subtle CSS fade)
- Hooked interactions (hover, click, optional scroll)
- Scene map diagram (zone IDs) for developers

