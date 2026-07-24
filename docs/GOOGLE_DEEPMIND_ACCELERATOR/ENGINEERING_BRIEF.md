# SAARTHI MVP: ENGINEERING BRIEF
## Build the Agricultural Discovery & Price Comparison Platform

**Status:** Ready to build  
**Timeline:** 48 hours to production  
**Priority:** ONE magical feature executed perfectly  
**Deployment:** Vercel (frontend) + Supabase (backend)

---

## THE ONE THING

```
Farmer speaks: "I have 80kg tomatoes ready tomorrow"
               ↓
Saarthi instantly discovers:
- Nearby traders (distance, price, contact, rating)
- Nearby wholesalers (distance, price, contact, rating)
- Nearby restaurants (distance, price, contact, rating)
- Nearby cold storages (distance, availability, contact)
- Nearby processors (distance, contact)
- Nearby FPOs (distance, contact)
- Nearby collection centers (distance, contact)
               ↓
Shows comparison:
- Best immediate sale (price + distance)
- Best future opportunity (storage + wait)
- Highest price buyer (even if far)
- Fastest sale (nearest option)
               ↓
Farmer clicks "Navigate" → Google Maps
Farmer clicks "Call" → Phone
```

That's the entire MVP. Nothing else matters.

---

## ARCHITECTURE

### Frontend (Next.js + TypeScript)
```
pages/
├── index.tsx (Landing + Voice Input)
├── discover.tsx (Results Page)
├── details/[buyerId].tsx (Buyer Details)
└── saved.tsx (Saved Buyers)

components/
├── VoiceInput.tsx (Gemini Live Voice)
├── BuyerCard.tsx (Reusable card)
├── PriceComparison.tsx (Chart)
├── MapView.tsx (Google Maps integration)
└── LoadingState.tsx

hooks/
├── useVoice.ts
├── useDiscovery.ts
├── usePrices.ts
├── useLocation.ts

styles/
└── globals.css (Tailwind)

utils/
├── api.ts (API calls)
├── gemini.ts (AI orchestration)
├── maps.ts (Google Maps helpers)
└── speech.ts (Voice helpers)
```

### Backend (Next.js API Routes)
```
api/
├── voice/transcribe.ts (Google STT)
├── ai/discover.ts (Gemini intent + extraction)
├── discovery/nearby.ts (Google Places API)
├── prices/current.ts (Price intelligence)
├── prices/trends.ts (Historical data)
└── auth/ (Supabase)
```

### Database (Supabase - Free Tier)
```
Tables:
- users (id, phone, language, location)
- buyers (id, name, category, lat, lon, contact, type)
- prices (id, produce, buyer_id, price, date)
- conversation (id, user_id, transcript, intent, result)
- saved_buyers (id, user_id, buyer_id)

Indexes:
- buyers (lat, lon) for proximity search
- prices (produce, date) for trends
```

---

## THE USER FLOW

### Step 1: Voice Input (Farmer Speaks)
```
Farmer clicks microphone
Says: "Mere paas 80kg tamater hain"
     (I have 80kg tomatoes)

Backend:
- Google Speech-to-Text (Hindi)
- Gemini extracts: produce=tomato, quantity=80kg
- Auto-detects user location (GPS)

Response:
"Tamater ke liye nearby buyers dhundh raha hoon..."
(Searching for tomato buyers near you...)
```

### Step 2: Discovery (Saarthi Searches)
```
Backend:
1. Call Google Places API (Nearby Search)
   - Search radius: 50km
   - Types: wholesale_store, restaurant, vegetable_market, etc.

2. Filter & enrich:
   - Add distances
   - Add estimated prices (from ML model or static)
   - Add estimated demand (from historical data)
   - Add ratings (from Google/internal)

3. Gemini ranks results:
   - Best match for this farmer
   - Why each buyer is good/bad
   - Recommendation + explanation
```

### Step 3: Results Page (Buyers Displayed)
```
Card layout:

┌─────────────────────────────┐
│ Sharma Wholesale Traders    │
│ ⭐ 4.2 (12 reviews)         │
│ 2.3 km away                 │
│ Current price: ₹18/kg       │
│ Call: +91-9876543210       │
│ Open now                    │
│                             │
│ [Navigate] [Call] [Save]   │
└─────────────────────────────┘

Card layout:

┌─────────────────────────────┐
│ Rajesh Restaurant           │
│ ⭐ 4.8 (45 reviews)         │
│ 5.1 km away                 │
│ Estimated: ₹22/kg          │
│ Call: +91-8765432109       │
│ Open now                    │
│                             │
│ [Navigate] [Call] [Save]   │
└─────────────────────────────┘
```

### Step 4: AI Recommendation
```
Gemini explains:
"आपके लिए सबसे अच्छा विकल्प:
Sharma Wholesale Traders (2.3 km)
₹18/kg तुरंत
कुल: ₹1,440

या

Rajesh Restaurant (5.1 km)
₹22/kg लेकिन 5 दिन बाद
कुल: ₹1,760 (₹320 ज्यादा)

मेरी सलाह: अगर आप तुरंत बेचना चाहते हैं,
Sharma जाएं।"
```

---

## TECH STACK

### Frontend
- **Framework:** Next.js 14 + TypeScript
- **UI:** React + Tailwind CSS
- **Maps:** Google Maps API (Embed + Places)
- **Voice:** Gemini Live API (or Google Speech)
- **State:** React Context or Zustand
- **Icons:** Lucide React
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** Supabase PostgreSQL (Free)
- **Auth:** Supabase Auth + Phone OTP
- **AI:** Gemini API (Flash model)
- **Maps:** Google Places API, Directions API, Distance Matrix
- **Speech:** Google Cloud Speech-to-Text
- **Cache:** Supabase Redis (if needed)

### Third-party APIs
- **Gemini API** (FREE tier available)
- **Google Maps API** ($200 free credit)
- **Google Cloud Speech-to-Text** (Pay per use, but cheap)
- **Agmarknet** (Free agricultural prices, if available)
- **OpenStreetMap** (Fallback for maps)

---

## CORE FEATURES

### 1. Voice Input (Gemini Live)
```typescript
// api/voice/process.ts
const response = await gemini.generate({
  contents: [{
    role: "user",
    parts: [{
      text: `Extract from farmer input:
      Input: "${transcribedText}"
      Language: ${language}
      
      Extract:
      - produce: string
      - quantity: number
      - unit: string (kg/quintal/units)
      - preferSell: "today" | "future"
      - userLocation: { lat, lon }
      
      Return JSON only.`
    }]
  }]
});
```

### 2. Discovery Engine
```typescript
// api/discovery/nearby.ts
const buyers = await google.places.nearbySearch({
  location: userLocation,
  radius: 50000, // 50km
  type: ["wholesale_store", "food_store", "market"],
  keyword: produce
});

// Enrich with prices, ratings, distance
```

### 3. Price Intelligence
```typescript
// api/prices/estimate.ts
const price = await estimatePrice({
  produce: "tomato",
  location: userLocation,
  buyerType: "wholesale"
});
// Returns: estimated price + confidence
```

### 4. Recommendation Engine
```typescript
// api/ai/recommend.ts
const recommendation = await gemini.generate({
  contents: [{
    role: "user",
    parts: [{
      text: `Given:
      - Produce: ${produce}, Qty: ${qty}
      - Nearby buyers: ${JSON.stringify(buyers)}
      - Current prices: ${JSON.stringify(prices)}
      
      Recommend the best 3 buyers and explain WHY.
      Keep language: Hindi/English
      Be specific about prices and distances.`
    }]
  }]
});
```

---

## DEPLOYMENT CHECKLIST

### Frontend (Vercel)
- [ ] `npm run build` passes
- [ ] `npm run export` works
- [ ] Environment variables set
- [ ] Google Maps API key added
- [ ] Gemini API key added
- [ ] Mobile responsive tested

### Backend (Supabase)
- [ ] Database tables created
- [ ] Indexes added
- [ ] RLS policies configured
- [ ] API keys generated
- [ ] Phone OTP enabled

### APIs
- [ ] Google Maps API enabled (Places, Distance Matrix)
- [ ] Google Cloud Speech-to-Text enabled
- [ ] Gemini API key created (free tier)
- [ ] CORS configured for frontend

### Testing
- [ ] Voice input works (Hindi + English)
- [ ] Discovery returns nearby buyers
- [ ] Results page loads in <2s
- [ ] Click "Call" opens phone app
- [ ] Click "Navigate" opens Google Maps
- [ ] Mobile UI looks good

---

## MVP vs. NICE-TO-HAVE

### MUST HAVE (MVP)
- ✅ Voice input (speech-to-text)
- ✅ Produce extraction (Gemini)
- ✅ Nearby buyer discovery (Google Places)
- ✅ Distance calculation (Google Distance Matrix)
- ✅ Results page (buyer cards)
- ✅ Call + Navigate buttons
- ✅ Price display (estimated or current)
- ✅ AI recommendation (Gemini)
- ✅ Mobile responsive

### NICE-TO-HAVE (Post-MVP)
- ⚠️ Saved buyers list
- ⚠️ Historical prices
- ⚠️ Demand trends
- ⚠️ User ratings
- ⚠️ Cold storage integration
- ⚠️ FPO discovery
- ⚠️ Multi-language (beyond Hindi/English)
- ⚠️ Marketplace transactions
- ⚠️ Logistics partners

---

## CODE STYLE

### TypeScript
```typescript
// ✅ DO THIS
interface Buyer {
  id: string;
  name: string;
  distance: number;
  estimatedPrice: number;
  contact: string;
}

// ❌ DON'T DO THIS
const buyer = {};
buyer.name = "test";
```

### API Routes
```typescript
// ✅ DO THIS
export default async function handler(req, res) {
  try {
    const result = await service.discover(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ❌ DON'T DO THIS
export default function handler(req, res) {
  // No error handling
  // Synchronous code
}
```

### Components
```typescript
// ✅ DO THIS
interface BuyerCardProps {
  buyer: Buyer;
  onCall: () => void;
  onNavigate: () => void;
}

export const BuyerCard: FC<BuyerCardProps> = ({ buyer, onCall, onNavigate }) => {
  return (...)
}

// ❌ DON'T DO THIS
export default function BuyerCard(props) {
  return (...)
}
```

---

## PERFORMANCE TARGETS

- **Voice input latency:** <500ms
- **Discovery API latency:** <2s
- **Results page load:** <2s
- **Mobile first-paint:** <2s
- **Mobile interaction latency:** <500ms

---

## SUCCESS CRITERIA

By end of 48 hours:
- ✅ Farmer can speak into phone
- ✅ Saarthi extracts intent (produce + qty)
- ✅ System finds nearby buyers
- ✅ Buyers displayed with prices + distance
- ✅ Farmer can click "Call" or "Navigate"
- ✅ System deployed on Vercel
- ✅ Works on mobile
- ✅ Handles Hindi + English

**If all above work:** Ready for Google DeepMind judging.

---

## FINAL WORDS

This is not about building a marketplace.
This is about building **agricultural intelligence**.

The judge should think:
"This farmer walked in not knowing where to sell.
After using Saarthi, they now know:
- Who to call
- What price to expect
- How to get there
- In 60 seconds"

That's the product.
Build that.
Everything else is noise.

🚀
