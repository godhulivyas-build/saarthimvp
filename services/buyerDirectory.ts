import { supabase, isSupabaseConfigured } from './supabaseClient';

export type BuyerType =
  | 'wholesaler'
  | 'restaurant'
  | 'hotel'
  | 'retail_chain'
  | 'processor'
  | 'trader'
  | 'cold_storage';

export const BUYER_TYPE_LABEL: Record<BuyerType, { en: string; hi: string }> = {
  wholesaler: { en: 'Wholesaler', hi: 'थोक व्यापारी' },
  restaurant: { en: 'Restaurant', hi: 'रेस्टोरेंट' },
  hotel: { en: 'Hotel', hi: 'होटल' },
  retail_chain: { en: 'Retail / Mall', hi: 'रिटेल / मॉल' },
  processor: { en: 'Food Processor', hi: 'प्रोसेसिंग यूनिट' },
  trader: { en: 'Trader / Mandi Agent', hi: 'व्यापारी / मंडी एजेंट' },
  cold_storage: { en: 'Cold Storage', hi: 'कोल्ड स्टोरेज' },
};

export type BuyerCropPrice = {
  crop: string; // CropDef.key
  pricePerQuintal: number;
  updatedAt: string; // ISO date
};

export type Buyer = {
  id: string;
  businessName: string;
  buyerType: BuyerType;
  state: string;
  district: string;
  villageOrArea?: string;
  lat?: number;
  lng?: number;
  contactPhone: string;
  contactName?: string;
  crops: BuyerCropPrice[];
  notes?: string;
  verified: boolean;
  /** true only for local starter/demo rows — never true for a real onboarded Supabase row */
  isDemoSeed?: boolean;
  createdAt: string;
};

export type RegisterBuyerInput = Omit<Buyer, 'id' | 'verified' | 'createdAt' | 'isDemoSeed'>;

/**
 * Clearly-labeled starter data so the discovery flow is demoable before any
 * real trader has onboarded. Never mixed with real rows without the
 * isDemoSeed flag — the UI must show a "Demo · not a real business" badge
 * for these so nobody mistakes them for a verified partner.
 */
const DEMO_SEED_BUYERS: Buyer[] = [
  {
    id: 'demo-1',
    businessName: 'Dewas Wholesale Traders (example)',
    buyerType: 'wholesaler',
    state: 'Madhya Pradesh',
    district: 'Dewas',
    villageOrArea: 'Dewas Mandi Road',
    lat: 22.97,
    lng: 76.05,
    contactPhone: '',
    crops: [
      { crop: 'Wheat', pricePerQuintal: 2380, updatedAt: new Date().toISOString() },
      { crop: 'Soybean', pricePerQuintal: 4500, updatedAt: new Date().toISOString() },
    ],
    notes: 'Example only — real traders can replace this by onboarding below.',
    verified: false,
    isDemoSeed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    businessName: 'Khargone Fresh Mart (example)',
    buyerType: 'retail_chain',
    state: 'Madhya Pradesh',
    district: 'Khargone',
    lat: 21.82,
    lng: 75.61,
    contactPhone: '',
    crops: [
      { crop: 'Tomato', pricePerQuintal: 2100, updatedAt: new Date().toISOString() },
      { crop: 'Onion', pricePerQuintal: 1250, updatedAt: new Date().toISOString() },
      { crop: 'Potato', pricePerQuintal: 950, updatedAt: new Date().toISOString() },
    ],
    notes: 'Example only — real traders can replace this by onboarding below.',
    verified: false,
    isDemoSeed: true,
    createdAt: new Date().toISOString(),
  },
];

/** In-memory fallback store, used only when Supabase isn't configured yet. Resets on page reload. */
let localBuyers: Buyer[] = [...DEMO_SEED_BUYERS];

function genId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listBuyersForCrop(cropKey: string, district?: string): Promise<Buyer[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('buyers').select('*').limit(200);
    if (error) {
      console.error('Supabase listBuyersForCrop error:', error.message);
      return [];
    }
    const rows = (data ?? []).map(rowToBuyer);
    return filterByCropAndDistrict(rows, cropKey, district);
  }
  return filterByCropAndDistrict(localBuyers, cropKey, district);
}

/** Every registered buyer, unfiltered — used where we need to scan across all crops/districts at once. */
export async function listAllBuyers(): Promise<Buyer[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('buyers').select('*').limit(200);
    if (error) {
      console.error('Supabase listAllBuyers error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToBuyer);
  }
  return localBuyers;
}

export async function registerBuyer(input: RegisterBuyerInput): Promise<Buyer> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('buyers')
      .insert({
        business_name: input.businessName,
        buyer_type: input.buyerType,
        state: input.state,
        district: input.district,
        village_or_area: input.villageOrArea ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        contact_phone: input.contactPhone,
        contact_name: input.contactName ?? null,
        crops: input.crops,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Could not save buyer.');
    }
    return rowToBuyer(data);
  }

  const buyer: Buyer = {
    ...input,
    id: genId(),
    verified: false,
    createdAt: new Date().toISOString(),
  };
  localBuyers = [...localBuyers, buyer];
  return buyer;
}

function filterByCropAndDistrict(buyers: Buyer[], cropKey: string, district?: string): Buyer[] {
  return buyers.filter((b) => {
    const hasCrop = b.crops.some((c) => c.crop === cropKey);
    if (!hasCrop) return false;
    if (district && b.district.toLowerCase() !== district.toLowerCase()) return false;
    return true;
  });
}

function rowToBuyer(row: any): Buyer {
  return {
    id: row.id,
    businessName: row.business_name,
    buyerType: row.buyer_type,
    state: row.state,
    district: row.district,
    villageOrArea: row.village_or_area ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    contactPhone: row.contact_phone,
    contactName: row.contact_name ?? undefined,
    crops: row.crops ?? [],
    notes: row.notes ?? undefined,
    verified: Boolean(row.verified),
    createdAt: row.created_at,
  };
}

/** Straight-line distance in km (Haversine). Labeled as "straight-line" in UI — not a road route. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
