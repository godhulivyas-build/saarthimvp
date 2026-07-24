import { RAW_FARMER_REGISTRY } from './farmerRegistryData';

/**
 * Real farmer registry — 318 real farmers, real names, real GPS coordinates,
 * real phone numbers, surveyed in Kasrawad tehsil, Khargone district, MP
 * (source: field GPS survey, Feb 2026).
 *
 * IMPORTANT: this data has NO price or quantity — it records what a farmer
 * grows, not what they have ready to sell today. Never display a fabricated
 * ₹ figure next to these real names. This is a "who's growing what, where"
 * discovery layer, separate from the active farmer_listings (which require
 * a farmer to explicitly declare price + quantity themselves).
 */
export type RegisteredFarmer = {
  id: string;
  farmerName: string;
  village: string;
  cropKey: string; // matches services/cropCatalog CropDef.key
  contactPhone: string | null;
  state: string;
  district: string;
  lat: number;
  lng: number;
};

/** Raw source crop label -> our shared crop catalog key. */
const CROP_KEY_MAP: Record<string, string> = {
  Wheat: 'Wheat',
  Chickpea: 'Gram', // Chickpea = Gram/Chana, same crop
  Maize: 'Maize',
  Arbi: 'Arbi',
  Cotton: 'Cotton',
  Tomato: 'Tomato',
  Groundnut: 'Groundnut',
  Garlic: 'Garlic',
};

const ALL_REGISTERED_FARMERS: RegisteredFarmer[] = RAW_FARMER_REGISTRY.map((r) => ({
  id: r.id,
  farmerName: r.farmerName,
  village: r.village,
  cropKey: CROP_KEY_MAP[r.crop] ?? r.crop,
  contactPhone: r.contactPhone,
  state: 'Madhya Pradesh',
  district: 'Khargone',
  lat: r.lat,
  lng: r.lng,
}));

export async function listRegisteredFarmers(cropKey: string, district?: string): Promise<RegisteredFarmer[]> {
  return ALL_REGISTERED_FARMERS.filter((f) => {
    if (f.cropKey !== cropKey) return false;
    if (district && f.district.toLowerCase() !== district.toLowerCase()) return false;
    return true;
  });
}

export function registeredFarmerCount(): number {
  return ALL_REGISTERED_FARMERS.length;
}
