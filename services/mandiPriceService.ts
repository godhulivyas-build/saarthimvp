export type MandiPrice = {
  crop: string;
  cropHi: string;
  mandi: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: string;
};

export type MandiPricesResult = {
  prices: MandiPrice[];
  source: string;
  lastUpdated: string;
  isSample: boolean;
};

const DATAGOV_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DATAGOV_API_KEY) || '';

const CROP_HI: Record<string, string> = {
  Soybean: 'सोयाबीन',
  Wheat: 'गेहूं',
  Gram: 'चना',
  Onion: 'प्याज़',
  Tomato: 'टमाटर',
  Potato: 'आलू',
  Maize: 'मक्का',
  Garlic: 'लहसुन',
  Cotton: 'कपास',
  Lentil: 'मसूर',
  Rice: 'चावल',
  Mustard: 'सरसों',
  'Green Chilli': 'हरी मिर्च',
  Coriander: 'धनिया',
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fallbackPrices(): MandiPrice[] {
  const date = todayStr();
  return [
    { crop: 'Soybean', cropHi: 'सोयाबीन', mandi: 'Indore', minPrice: 4200, maxPrice: 4650, modalPrice: 4425, unit: '₹/क्विंटल', date },
    { crop: 'Wheat', cropHi: 'गेहूं', mandi: 'Bhopal', minPrice: 2150, maxPrice: 2380, modalPrice: 2275, unit: '₹/क्विंटल', date },
    { crop: 'Gram', cropHi: 'चना', mandi: 'Ujjain', minPrice: 4800, maxPrice: 5200, modalPrice: 5000, unit: '₹/क्विंटल', date },
    { crop: 'Onion', cropHi: 'प्याज़', mandi: 'Ratlam', minPrice: 800, maxPrice: 1200, modalPrice: 1000, unit: '₹/क्विंटल', date },
    { crop: 'Tomato', cropHi: 'टमाटर', mandi: 'Jabalpur', minPrice: 1500, maxPrice: 2200, modalPrice: 1850, unit: '₹/क्विंटल', date },
    { crop: 'Garlic', cropHi: 'लहसुन', mandi: 'Neemuch', minPrice: 5500, maxPrice: 8000, modalPrice: 6750, unit: '₹/क्विंटल', date },
    { crop: 'Potato', cropHi: 'आलू', mandi: 'Gwalior', minPrice: 600, maxPrice: 900, modalPrice: 750, unit: '₹/क्विंटल', date },
    { crop: 'Cotton', cropHi: 'कपास', mandi: 'Khandwa', minPrice: 5800, maxPrice: 6400, modalPrice: 6100, unit: '₹/क्विंटल', date },
    { crop: 'Maize', cropHi: 'मक्का', mandi: 'Chhindwara', minPrice: 1750, maxPrice: 2100, modalPrice: 1925, unit: '₹/क्विंटल', date },
    { crop: 'Mustard', cropHi: 'सरसों', mandi: 'Morena', minPrice: 4600, maxPrice: 5100, modalPrice: 4850, unit: '₹/क्विंटल', date },
    { crop: 'Rice', cropHi: 'चावल', mandi: 'Satna', minPrice: 2800, maxPrice: 3200, modalPrice: 3000, unit: '₹/क्विंटल', date },
    { crop: 'Lentil', cropHi: 'मसूर', mandi: 'Sagar', minPrice: 5000, maxPrice: 5500, modalPrice: 5250, unit: '₹/क्विंटल', date },
  ];
}

export async function getMandiPrices(state = 'Madhya Pradesh'): Promise<MandiPrice[]> {
  const res = await getMandiPricesResult(state);
  return res.prices;
}

export async function getMandiPricesResult(state = 'Madhya Pradesh'): Promise<MandiPricesResult> {
  if (!DATAGOV_KEY) {
    const prices = fallbackPrices();
    return {
      prices,
      source: 'Sample dataset (demo)',
      lastUpdated: prices[0]?.date || todayStr(),
      isSample: true,
    };
  }

  try {
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATAGOV_KEY}&format=json&filters[state]=${encodeURIComponent(state)}&limit=20`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`DataGov ${res.status}`);
    const data = await res.json();
    const records: any[] = data?.records ?? [];
    if (records.length === 0) {
      const prices = fallbackPrices();
      return {
        prices,
        source: 'Sample dataset (demo)',
        lastUpdated: prices[0]?.date || todayStr(),
        isSample: true,
      };
    }

    const prices = records.map((r: any) => ({
      crop: r.commodity ?? 'Unknown',
      cropHi: CROP_HI[r.commodity] ?? r.commodity ?? '',
      mandi: r.market ?? r.district ?? '',
      minPrice: Number(r.min_price) || 0,
      maxPrice: Number(r.max_price) || 0,
      modalPrice: Number(r.modal_price) || 0,
      unit: '₹/क्विंटल',
      date: r.arrival_date ?? todayStr(),
    }));

    const lastUpdated =
      prices.map((p) => p.date).sort().slice(-1)[0] ||
      todayStr();

    return {
      prices,
      source: 'data.gov.in (APMC mandi rates)',
      lastUpdated,
      isSample: false,
    };
  } catch {
    const prices = fallbackPrices();
    return {
      prices,
      source: 'Sample dataset (demo)',
      lastUpdated: prices[0]?.date || todayStr(),
      isSample: true,
    };
  }
}

export function getCropHi(crop: string): string {
  return CROP_HI[crop] ?? crop;
}
