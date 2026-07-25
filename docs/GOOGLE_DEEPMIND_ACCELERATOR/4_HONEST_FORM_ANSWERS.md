# Google DeepMind Accelerator — Honest Form Answers

**Supersedes:** `3_FORM_COMPLETION_GUIDE.md` (that draft used fabricated numbers —
"7 signed-up farmers," "1 completed transaction," "AlphaEarth integration
live," "300kg CO2 avoided" — none of which are true today. This version
uses only verified real facts.)

**Ground rule:** Every claim below is either (a) something that exists in the
live app at https://saarthimvp.vercel.app/ right now, or (b) explicitly
labeled as roadmap/future. Nothing is invented. If the exact wording of the
real form differs from the page topics below, adapt the content — don't
change the facts.

---

## The real facts this document is built on

| Fact | Value |
|---|---|
| Founder | Godhuli Vyas — solo founder, farmer/agriculture family background |
| Funding raised | $0 — bootstrapped, pre-revenue |
| Farmers personally interviewed | 50+ |
| Farmer data points collected (GPS survey) | 350+ contacted, 318 formally registered in-app with name, village, crop, phone, GPS (Kasrawad tehsil, Khargone district, MP — field survey, Feb 2026) |
| FPO engagement | Direct conversation with the Khargone FPO (Farmer Producer Organization) head |
| WhatsApp farmer community | 17 real members |
| Live product | https://saarthimvp.vercel.app/ |
| Completed in-app transactions | 0 — the product currently handles discovery, honest price comparison, and connecting parties by phone; the actual trade happens off-platform today |
| Google AI in production | Gemini (real, used for two features — see below) |
| AlphaEarth / carbon-credit tracking | Not built. Roadmap item, not a current capability. |

---

## What's actually built (the honest product description)

Saarthi Setu is a voice-first, 5-language (Hindi, English, Kannada, Telugu,
Tamil) marketplace and price-transparency tool for smallholder farmers in
Madhya Pradesh, India. It exists to solve one problem directly observed
across 50+ farmer conversations: farmers sell into the mandi (government
market) without knowing whether they're getting a fair price, and without an
easy way to discover buyers — restaurants, traders, wholesalers — who might
pay more once transport cost is accounted for.

**What's real and working today:**

1. **A real 318-farmer registry** — names, villages, crops grown, phone
   numbers, and GPS coordinates from a genuine field survey. Deliberately
   never shows a fabricated price next to these real people — it's a
   "who's growing what, where" discovery layer only.
2. **Honest price comparison** — pulls the real government mandi rate
   (data.gov.in Agmarknet integration, architecture live, currently serving
   clearly-labeled sample data pending an official API key) alongside real
   buyer offers from a Supabase-backed marketplace, and computes a genuine
   net "Saarthi Price" (real buyer offer minus a real registered
   transporter's cost) — so a farmer sees what they'd actually take home,
   not just a headline number. When the government rate is genuinely
   better, the app says so — it is not sales-biased toward its own network.
3. **Real Gemini integration** (not aspirational) — two working features:
   (a) turns a farmer's free-form voice or text ("80kg tomatoes ready
   tomorrow") into structured crop/quantity/timing data, and (b) rewrites
   the price-comparison result into a warm, simple explanation in the
   farmer's own language. Both have an instant local-template fallback, so
   the product never breaks if the API is slow or down.
4. **Real OpenStreetMap integration** — discovers actual nearby
   restaurants, dhabas, and fuel/transport hubs via the free Overpass API,
   with no vendor billing dependency.
5. **A real two-sided marketplace backend** (Supabase/Postgres) — buyers
   can list what they're paying per crop, farmers can list what they have
   to sell, transporters can list vehicle capacity and rates. Early-stage
   adoption (classic marketplace cold-start), but the infrastructure is
   real and functioning.
6. **Real phone-OTP authentication** — built on Supabase Auth
   (`signInWithOtp`/`verifyOtp`), genuinely wired end-to-end; currently
   runs in a clearly labeled sandbox mode pending SMS-gateway configuration
   (Twilio/MessageBird) in the Supabase dashboard — a config step, not a
   code gap.
7. **Simple, persona-specific dashboards** for Farmer / Buyer / Transporter
   — deliberately single-purpose, since the target user is often a
   first-time smartphone user.

**What's honestly not built:** AlphaEarth or any satellite crop-health
monitoring, carbon-credit tracking, an in-app payment/order flow, or any
CO2/water impact numbers. These would need to be built for real before
being claimed.

---

## Page-by-page answers

### Page 1 — Organization Description

> Saarthi Setu is a voice-first, multi-language marketplace and honest
> price-transparency tool for smallholder farmers in Madhya Pradesh, India.
> Built after 50+ direct farmer interviews and a 350+ contact field GPS
> survey (318 farmers formally registered), it compares the real government
> mandi rate against real buyer offers — net of real transport cost — so
> farmers can see, before they sell, whether the mandi or a direct buyer
> actually pays more. It uses Gemini to understand farmer voice/text input
> and explain results in plain language, in the farmer's own language.

### Page 3 — Product Stage

**Select:** Minimal Viable Product (MVP) — live and functioning, pre-revenue,
early real-world adoption.

*(Do not select "concept" — there is a real, working, deployed product. Do
not select anything implying revenue or scaled traction — there isn't any
yet.)*

### Page 4 — AI for the Planet Focus

**Environmental Focus Areas:**
✅ Agriculture (primary) — the entire product exists to help smallholder
farmers earn fairly and reduce blind reliance on middlemen.
❌ Do not check "Sustainability" as a distinct claim unless you can back it
with real numbers — none exist yet. If the form allows a secondary category,
it's more honest to leave it unchecked than to imply environmental-impact
tracking that doesn't exist.

**Google AI Models — currently used:**
✅ Gemini — real, in production (voice/text intent parsing, plain-language
price explanations)

**Google AI Models — roadmap (label clearly as roadmap, not current):**
- AlphaEarth — satellite-based soil/crop-health signals, to make price and
  advisory recommendations location-aware. Not started.
- Gemma — on-device/offline voice processing for low-connectivity areas.
  Not started.

**How Addressing Environmental/Agricultural Challenges (honest version):**
> Smallholder farmers in our surveyed villages routinely sell at whatever
> price the mandi or nearest trader offers, without a way to check if that's
> fair once transport is factored in. Saarthi Setu removes that information
> gap today using real government data and real buyer listings. Our
> near-term roadmap adds AlphaEarth so recommendations can also account for
> soil and crop-health conditions specific to a farmer's actual plot —
> turning a pricing tool into a genuine precision-agriculture assistant.

**Quantifiable Impact So Far (honest — do not invent CO2/water numbers):**
> No monetized transactions or environmental metrics yet — the product is
> pre-revenue. What we do have: 50+ direct farmer interviews, a 318-farmer
> real GPS registry, a live deployed marketplace, a direct conversation with
> the Khargone FPO head about distribution, and a 17-member active WhatsApp
> farmer community providing ongoing feedback.

**Projected 6–12 Month Impact:**
> Convert the Khargone FPO relationship into a formal pilot distribution
> channel; grow the WhatsApp community into the first cohort of real,
> onboarded buyers and transporters (currently the marketplace's main
> constraint is two-sided liquidity, not technology); obtain a data.gov.in
> API key to make mandi price data fully live; and begin the AlphaEarth
> integration to add soil/crop-health context to recommendations.

### Page 7 — Traction & Finance

| Field | Answer |
|---|---|
| Latest Funding | None — bootstrapped |
| Total Raised (USD) | $0 |
| Monthly Recurring Revenue | $0 (pre-revenue) |
| Customers/users now | 0 formal signups in-product yet; 318 farmers in the real GPS registry (discovery layer, not signups); 17-member active WhatsApp community; direct engagement with the Khargone FPO head |

*(Be precise about the difference between "farmers in our registry/data"
and "farmers who have signed up and used the product" — reviewers will
check. Don't blur these two numbers into one inflated figure.)*

### Page 9 — Program Fit & Motivation

**Why This Program? How Google Helps:**
> We're a solo-founder team with real field validation (50+ farmer
> interviews, an active FPO relationship, a real GPS-mapped farmer
> registry) but limited access to the infrastructure that would let us go
> further — specifically Google's frontier models like AlphaEarth, which
> would let us add real soil/crop-health signals to our price-transparency
> tool, something no generic agritech competitor can replicate without
> satellite access. Gemini is already live in our product; the accelerator
> would help us deepen that integration responsibly, validate it with real
> farmers, and get access to technical mentorship a solo founder can't get
> alone.

**3-Month Accelerator Goals:**
> 1) Get a data.gov.in API key live so mandi prices are fully real-time
> (currently architecture-ready, pending the key). 2) Configure a real SMS
> gateway so phone-OTP auth (already built on Supabase) is fully live, not
> sandboxed. 3) Convert the Khargone FPO conversation into a formal pilot
> with a defined number of onboarded farmers and buyers. 4) Scope and begin
> an AlphaEarth proof-of-concept for one real farmer plot. 5) Reach the
> first 10 real, logged-in users across all three personas (farmer, buyer,
> transporter) — our current honest bottleneck is marketplace liquidity,
> not the underlying technology.

### Page 10–11 — AI Strategy

**System Architecture:**
> Frontend: React 19 + TypeScript (Vite), deployed on Vercel. Backend/data:
> Supabase (Postgres, with row-level-security-scoped public read/insert for
> the marketplace tables) and Supabase Auth for phone-OTP. AI: Google Gemini
> API (`gemini-3-flash-preview`) for produce-intent extraction and
> explanation generation, always with an instant local fallback. External
> data: data.gov.in Agmarknet (government mandi prices) and OpenStreetMap
> Overpass API (nearby business discovery) — both free/public sources
> chosen to avoid vendor billing dependencies at this stage.

**Using AI/ML Today? How?**
> Yes — Gemini is live in two places: parsing a farmer's free-form voice or
> text input into structured crop/quantity/timing data, and rewriting a
> price comparison into a plain-language explanation in the farmer's own
> language. Both are real API calls with a template-based fallback so the
> product never blocks on network latency. AlphaEarth and Gemma are roadmap
> items, not yet integrated.

**AI Models:**
✅ Google Gemini (in production)
◻ Google AlphaEarth (roadmap)
◻ Google Gemma (roadmap)

**Data Types:**
✅ Text (voice-transcribed and typed farmer input)
✅ Structured/Tabular data (crop catalog, mandi prices, marketplace listings)
◻ Images/satellite (roadmap, pending AlphaEarth)

**Data Sources:**
✅ First-Party (318-farmer field GPS survey; marketplace listings farmers/
buyers/transporters enter themselves)
✅ Public (data.gov.in government mandi prices; OpenStreetMap business data)
◻ Third-party commercial data (none yet)

---

## Pages this guide doesn't have exact wording for

The original draft only covered pages 1, 3, 4, 7, 9, 10–11. If the real form
has additional pages (commonly: Team, Problem Statement, Market Size,
Business Model, Competition), use these honest building blocks:

- **Team:** Solo founder, Godhuli Vyas, farmer/agriculture family
  background. Built the entire live product personally. (Do not claim a
  co-founder or engineering team that doesn't exist.)
- **Problem:** Documented directly from 50+ farmer interviews across
  villages in Khargone district, MP — farmers routinely can't tell if the
  mandi rate or a direct buyer's offer is genuinely better once transport
  is factored in, and have no easy way to discover buyers beyond the local
  mandi.
- **Market:** India has 100M+ smallholder farmer households; Madhya Pradesh
  alone is one of the largest agricultural states. (Cite only the market
  size figure, not a specific SAM/SOM number unless you've calculated one
  for real.)
- **Business model (if asked):** Not yet monetized. Pre-revenue by design
  at this stage — the priority has been proving the discovery/pricing
  problem is real before charging for it.
- **Competition (if asked):** Most existing agri-marketplace apps (e.g.
  large-scale APMC digitization efforts) show a single price source.
  Saarthi Setu's honesty-first design — showing the government rate as
  "best" whenever it genuinely is, rather than always favoring its own
  network — is a real, checkable product decision, not a claim.

---

## Before you submit

- [ ] Every number in the form matches what's actually live at
      https://saarthimvp.vercel.app/ — a reviewer can and may check.
- [ ] No claim of AlphaEarth, carbon credits, or completed transactions
      unless that changes to be true before submission.
- [ ] Founder background statement matches reality (farmer/agriculture
      family background — confirmed).
- [ ] "17-member WhatsApp community" and "Khargone FPO head conversation"
      are your strongest real traction points — lead with them, don't bury
      them under aspirational language.
