import { supabase, isSupabaseConfigured } from './supabaseClient';

export type VehicleType = 'mini_truck' | 'pickup' | 'tractor_trolley' | 'large_truck' | 'auto';

export const VEHICLE_TYPE_LABEL: Record<VehicleType, { en: string; hi: string }> = {
  mini_truck: { en: 'Mini Truck', hi: 'छोटा ट्रक' },
  pickup: { en: 'Pickup', hi: 'पिकअप' },
  tractor_trolley: { en: 'Tractor + Trolley', hi: 'ट्रैक्टर + ट्रॉली' },
  large_truck: { en: 'Large Truck', hi: 'बड़ा ट्रक' },
  auto: { en: 'Auto/Loading Rickshaw', hi: 'ऑटो/लोडिंग रिक्शा' },
};

export type Transporter = {
  id: string;
  driverName: string;
  vehicleType: VehicleType;
  capacityQuintal: number;
  pricePerKm: number | null;
  pricePerQuintal: number | null;
  state: string;
  district: string;
  villageOrArea?: string;
  lat?: number;
  lng?: number;
  contactPhone: string;
  notes?: string;
  verified: boolean;
  /** true only for local starter/demo rows — never true for a real onboarded Supabase row */
  isDemoSeed?: boolean;
  createdAt: string;
};

export type RegisterTransporterInput = Omit<Transporter, 'id' | 'verified' | 'createdAt' | 'isDemoSeed'>;

/**
 * Clearly-labeled starter data so Transport mode is demoable before any real
 * driver has onboarded. Never mixed with real rows without the isDemoSeed flag.
 */
const DEMO_SEED_TRANSPORTERS: Transporter[] = [
  {
    id: 'demo-t1',
    driverName: 'Ramesh Transport (example)',
    vehicleType: 'mini_truck',
    capacityQuintal: 25,
    pricePerKm: 18,
    pricePerQuintal: null,
    state: 'Madhya Pradesh',
    district: 'Dewas',
    villageOrArea: 'Dewas Bypass',
    lat: 22.97,
    lng: 76.05,
    contactPhone: '',
    notes: 'Example only — real drivers can replace this by registering below.',
    verified: false,
    isDemoSeed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-t2',
    driverName: 'Khargone Tractor Service (example)',
    vehicleType: 'tractor_trolley',
    capacityQuintal: 50,
    pricePerKm: null,
    pricePerQuintal: 22,
    state: 'Madhya Pradesh',
    district: 'Khargone',
    lat: 21.82,
    lng: 75.61,
    contactPhone: '',
    notes: 'Example only — real drivers can replace this by registering below.',
    verified: false,
    isDemoSeed: true,
    createdAt: new Date().toISOString(),
  },
];

let localTransporters: Transporter[] = [...DEMO_SEED_TRANSPORTERS];

function genId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listTransportersForDistrict(district?: string): Promise<Transporter[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('transporters').select('*').limit(200);
    if (error) {
      console.error('Supabase listTransportersForDistrict error:', error.message);
      return [];
    }
    const rows = (data ?? []).map(rowToTransporter);
    return district ? rows.filter((t) => t.district.toLowerCase() === district.toLowerCase()) : rows;
  }
  return district
    ? localTransporters.filter((t) => t.district.toLowerCase() === district.toLowerCase())
    : localTransporters;
}

export async function registerTransporter(input: RegisterTransporterInput): Promise<Transporter> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('transporters')
      .insert({
        driver_name: input.driverName,
        vehicle_type: input.vehicleType,
        capacity_quintal: input.capacityQuintal,
        price_per_km: input.pricePerKm,
        price_per_quintal: input.pricePerQuintal,
        state: input.state,
        district: input.district,
        village_or_area: input.villageOrArea ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        contact_phone: input.contactPhone,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Could not save transporter.');
    }
    return rowToTransporter(data);
  }

  const transporter: Transporter = {
    ...input,
    id: genId(),
    verified: false,
    createdAt: new Date().toISOString(),
  };
  localTransporters = [...localTransporters, transporter];
  return transporter;
}

function rowToTransporter(row: any): Transporter {
  return {
    id: row.id,
    driverName: row.driver_name,
    vehicleType: row.vehicle_type,
    capacityQuintal: Number(row.capacity_quintal),
    pricePerKm: row.price_per_km != null ? Number(row.price_per_km) : null,
    pricePerQuintal: row.price_per_quintal != null ? Number(row.price_per_quintal) : null,
    state: row.state,
    district: row.district,
    villageOrArea: row.village_or_area ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    contactPhone: row.contact_phone,
    notes: row.notes ?? undefined,
    verified: Boolean(row.verified),
    createdAt: row.created_at,
  };
}
