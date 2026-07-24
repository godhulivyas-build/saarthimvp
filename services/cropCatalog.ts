/**
 * Shared produce catalog — used by mandi price lookup, buyer onboarding,
 * and voice/text intent extraction. Deliberately broad: grains, pulses,
 * vegetables, fruits, spices. Sarthi is not a seasonal-grain-only tool —
 * a tomato or onion farmer sells every week, all year.
 */
export type CropCategory = 'grain' | 'pulse' | 'vegetable' | 'fruit' | 'spice' | 'oilseed';

export type CropDef = {
  key: string; // canonical English name, matches Agmarknet commodity naming
  en: string;
  hi: string;
  category: CropCategory;
  /** extra words a farmer might say, for voice/text matching (English + Hinglish) */
  aliases: string[];
};

export const CROP_CATALOG: CropDef[] = [
  // Grains
  { key: 'Wheat', en: 'Wheat', hi: 'गेहूं', category: 'grain', aliases: ['gehu', 'gehun', 'gehoo'] },
  { key: 'Rice', en: 'Rice', hi: 'चावल', category: 'grain', aliases: ['chawal', 'dhan', 'paddy'] },
  { key: 'Maize', en: 'Maize', hi: 'मक्का', category: 'grain', aliases: ['makka', 'corn'] },
  { key: 'Jowar', en: 'Jowar (Sorghum)', hi: 'ज्वार', category: 'grain', aliases: ['jowar', 'sorghum'] },
  { key: 'Bajra', en: 'Bajra (Millet)', hi: 'बाजरा', category: 'grain', aliases: ['bajra', 'millet'] },

  // Pulses
  { key: 'Gram', en: 'Gram (Chana)', hi: 'चना', category: 'pulse', aliases: ['chana', 'chickpea'] },
  { key: 'Lentil', en: 'Lentil (Masoor)', hi: 'मसूर', category: 'pulse', aliases: ['masoor', 'lentil', 'dal'] },
  { key: 'Tur', en: 'Tur (Arhar)', hi: 'अरहर', category: 'pulse', aliases: ['arhar', 'tur', 'toor', 'pigeon pea'] },
  { key: 'Moong', en: 'Moong', hi: 'मूंग', category: 'pulse', aliases: ['moong', 'green gram'] },
  { key: 'Urad', en: 'Urad', hi: 'उड़द', category: 'pulse', aliases: ['urad', 'black gram'] },

  // Oilseeds
  { key: 'Soybean', en: 'Soybean', hi: 'सोयाबीन', category: 'oilseed', aliases: ['soyabean', 'soya'] },
  { key: 'Mustard', en: 'Mustard', hi: 'सरसों', category: 'oilseed', aliases: ['sarson', 'sarso'] },
  { key: 'Groundnut', en: 'Groundnut', hi: 'मूंगफली', category: 'oilseed', aliases: ['moongfali', 'peanut'] },
  { key: 'Cotton', en: 'Cotton', hi: 'कपास', category: 'oilseed', aliases: ['kapas'] },

  // Vegetables — the everyday, all-year produce
  { key: 'Arbi', en: 'Arbi (Colocasia)', hi: 'अरबी', category: 'vegetable', aliases: ['aarbi', 'colocasia', 'taro'] },
  { key: 'Tomato', en: 'Tomato', hi: 'टमाटर', category: 'vegetable', aliases: ['tamatar'] },
  { key: 'Onion', en: 'Onion', hi: 'प्याज़', category: 'vegetable', aliases: ['pyaz', 'pyaaz'] },
  { key: 'Potato', en: 'Potato', hi: 'आलू', category: 'vegetable', aliases: ['aalu', 'aloo'] },
  { key: 'Garlic', en: 'Garlic', hi: 'लहसुन', category: 'vegetable', aliases: ['lahsun'] },
  { key: 'Ginger', en: 'Ginger', hi: 'अदरक', category: 'vegetable', aliases: ['adrak'] },
  { key: 'Green Chilli', en: 'Green Chilli', hi: 'हरी मिर्च', category: 'vegetable', aliases: ['mirch', 'hari mirch'] },
  { key: 'Cauliflower', en: 'Cauliflower', hi: 'फूलगोभी', category: 'vegetable', aliases: ['phool gobi', 'gobi'] },
  { key: 'Cabbage', en: 'Cabbage', hi: 'बंद गोभी', category: 'vegetable', aliases: ['patta gobi'] },
  { key: 'Brinjal', en: 'Brinjal (Eggplant)', hi: 'बैंगन', category: 'vegetable', aliases: ['baingan', 'eggplant'] },
  { key: 'Okra', en: 'Okra (Bhindi)', hi: 'भिंडी', category: 'vegetable', aliases: ['bhindi', 'lady finger'] },
  { key: 'Peas', en: 'Green Peas', hi: 'मटर', category: 'vegetable', aliases: ['matar'] },
  { key: 'Cucumber', en: 'Cucumber', hi: 'खीरा', category: 'vegetable', aliases: ['kheera'] },
  { key: 'Carrot', en: 'Carrot', hi: 'गाजर', category: 'vegetable', aliases: ['gajar'] },
  { key: 'Coriander', en: 'Coriander (Dhaniya)', hi: 'धनिया', category: 'spice', aliases: ['dhaniya'] },

  // Fruits
  { key: 'Banana', en: 'Banana', hi: 'केला', category: 'fruit', aliases: ['kela'] },
  { key: 'Mango', en: 'Mango', hi: 'आम', category: 'fruit', aliases: ['aam'] },
  { key: 'Papaya', en: 'Papaya', hi: 'पपीता', category: 'fruit', aliases: ['papita'] },
  { key: 'Guava', en: 'Guava', hi: 'अमरूद', category: 'fruit', aliases: ['amrud'] },
  { key: 'Watermelon', en: 'Watermelon', hi: 'तरबूज़', category: 'fruit', aliases: ['tarbuz'] },
  { key: 'Orange', en: 'Orange', hi: 'संतरा', category: 'fruit', aliases: ['santra'] },
  { key: 'Grapes', en: 'Grapes', hi: 'अंगूर', category: 'fruit', aliases: ['angoor'] },
];

const norm = (s: string) => s.toLowerCase().trim();

/** Find the best-matching catalog entry for free text (English, Hindi, or Hinglish). */
export function findCropInText(text: string): CropDef | null {
  const t = norm(text);
  if (!t) return null;
  for (const crop of CROP_CATALOG) {
    if (t.includes(norm(crop.en)) || t.includes(crop.hi) || crop.aliases.some((a) => t.includes(norm(a)))) {
      return crop;
    }
  }
  return null;
}

export function getCropHi(key: string): string {
  return CROP_CATALOG.find((c) => c.key === key)?.hi ?? key;
}

export function getCropEn(key: string): string {
  return CROP_CATALOG.find((c) => c.key === key)?.en ?? key;
}
