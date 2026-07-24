import { supabase, isSupabaseConfigured } from './supabaseClient';

export type FarmerListing = {
  id: string;
  farmerName: string;
  contactPhone: string;
  state: string;
  district: string;
  villageOrArea?: string;
  lat?: number;
  lng?: number;
  crop: string; // CropDef.key
  quantityQuintal: number;
  askingPricePerQuintal: number;
  readyBy?: string; // free text, e.g. "Tomorrow", "This week"
  notes?: string;
  createdAt: string;
  /** true only for local starter/demo rows — never true for a real onboarded Supabase row */
  isDemoSeed?: boolean;
};

export type CreateFarmerListingInput = Omit<FarmerListing, 'id' | 'createdAt' | 'isDemoSeed'>;

/**
 * Clearly-labeled starter data so Buy mode is demoable before any real farmer
 * has listed produce. Never mixed with real rows without the isDemoSeed flag.
 */
const DEMO_SEED_LISTINGS: FarmerListing[] = [
  {
    id: 'demo-listing-1',
    farmerName: 'Baliram Patel (example)',
    contactPhone: '',
    state: 'Madhya Pradesh',
    district: 'Dewas',
    villageOrArea: 'Rupkheda',
    lat: 22.97,
    lng: 76.05,
    crop: 'Wheat',
    quantityQuintal: 50,
    askingPricePerQuintal: 2380,
    readyBy: 'Ready now',
    notes: 'Example only — real farmers can replace this by listing below.',
    createdAt: new Date().toISOString(),
    isDemoSeed: true,
  },
  {
    id: 'demo-listing-2',
    farmerName: 'Sunita Bai (example)',
    contactPhone: '',
    state: 'Madhya Pradesh',
    district: 'Khargone',
    lat: 21.82,
    lng: 75.61,
    crop: 'Tomato',
    quantityQuintal: 8,
    askingPricePerQuintal: 2000,
    readyBy: 'This week',
    notes: 'Example only — real farmers can replace this by listing below.',
    createdAt: new Date().toISOString(),
    isDemoSeed: true,
  },
];

/** In-memory fallback store, used only when Supabase isn't configured yet. Resets on page reload. */
let localListings: FarmerListing[] = [...DEMO_SEED_LISTINGS];

function genId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listFarmerListings(cropKey: string, district?: string): Promise<FarmerListing[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('farmer_listings').select('*').limit(200);
    if (error) {
      console.error('Supabase listFarmerListings error:', error.message);
      return [];
    }
    const rows = (data ?? []).map(rowToListing);
    return filterByCropAndDistrict(rows, cropKey, district);
  }
  return filterByCropAndDistrict(localListings, cropKey, district);
}

export async function createFarmerListing(input: CreateFarmerListingInput): Promise<FarmerListing> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('farmer_listings')
      .insert({
        farmer_name: input.farmerName,
        contact_phone: input.contactPhone,
        state: input.state,
        district: input.district,
        village_or_area: input.villageOrArea ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        crop: input.crop,
        quantity_quintal: input.quantityQuintal,
        asking_price_per_quintal: input.askingPricePerQuintal,
        ready_by: input.readyBy ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Could not save listing.');
    }
    return rowToListing(data);
  }

  const listing: FarmerListing = {
    ...input,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  localListings = [...localListings, listing];
  return listing;
}

function filterByCropAndDistrict(listings: FarmerListing[], cropKey: string, district?: string): FarmerListing[] {
  return listings.filter((l) => {
    if (l.crop !== cropKey) return false;
    if (district && l.district.toLowerCase() !== district.toLowerCase()) return false;
    return true;
  });
}

function rowToListing(row: any): FarmerListing {
  return {
    id: row.id,
    farmerName: row.farmer_name,
    contactPhone: row.contact_phone,
    state: row.state,
    district: row.district,
    villageOrArea: row.village_or_area ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    crop: row.crop,
    quantityQuintal: Number(row.quantity_quintal),
    askingPricePerQuintal: Number(row.asking_price_per_quintal),
    readyBy: row.ready_by ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
