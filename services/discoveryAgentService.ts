import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { Lang } from '../i18n/translations';
import { CROP_CATALOG, findCropInText, getCropEn } from './cropCatalog';
import type { MandiPrice } from './mandiPriceService';
import { Buyer, distanceKm } from './buyerDirectory';

const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** Gemini calls must never block the UI — race against a hard timeout and fall back. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Gemini call timed out')), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

export type ProduceIntent = {
  cropKey: string | null;
  cropLabel: string;
  quantityQuintal: number | null;
  rawQuantityText: string | null;
  sellTiming: 'today' | 'soon' | 'unspecified';
};

function extractIntentLocally(rawText: string): ProduceIntent {
  const crop = findCropInText(rawText);
  const numMatch = rawText.match(/(\d+(?:\.\d+)?)/);
  const lower = rawText.toLowerCase();
  let quantityQuintal: number | null = null;

  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (/kg|किलो|kilo/.test(lower)) quantityQuintal = num / 100;
    else if (/tonne|ton\b|टन/.test(lower)) quantityQuintal = num * 10;
    else quantityQuintal = num; // assume quintal (q/क्विंटल) or no unit stated
  }

  return {
    cropKey: crop?.key ?? null,
    cropLabel: crop ? crop.en : rawText.trim(),
    quantityQuintal,
    rawQuantityText: numMatch ? numMatch[0] : null,
    sellTiming: /today|आज|अभी|now/i.test(rawText) ? 'today' : 'unspecified',
  };
}

/**
 * Turn a farmer's free-form voice/text ("80kg tomatoes ready tomorrow") into
 * a structured intent. Gemini-powered when a working API key is available;
 * always falls back to a local catalog + regex match so the flow never breaks.
 */
export async function extractProduceIntent(rawText: string, lang: Lang): Promise<ProduceIntent> {
  const local = extractIntentLocally(rawText);
  if (!ai) return local;

  const cropKeys = CROP_CATALOG.map((c) => c.key).join(', ');
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      cropKey: { type: Type.STRING, nullable: true },
      quantityQuintal: { type: Type.NUMBER, nullable: true },
      sellTiming: { type: Type.STRING },
    },
    required: ['cropKey', 'quantityQuintal', 'sellTiming'],
  };

  const prompt = `A farmer said (language: ${lang}): "${rawText}"
Known crop keys (choose exactly one, or null if nothing matches): ${cropKeys}
Extract:
- cropKey: one of the known crop keys above, or null
- quantityQuintal: quantity converted to quintals (1 quintal = 100 kg; if kg mentioned, divide by 100; if tonne, multiply by 10; if no unit, assume quintal). Null if no quantity mentioned.
- sellTiming: "today", "soon", or "unspecified"`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: schema },
      }),
      6000
    );
    const text = response.text;
    if (!text) return local;
    const parsed = JSON.parse(text);
    const validKey = CROP_CATALOG.some((c) => c.key === parsed.cropKey) ? parsed.cropKey : local.cropKey;
    return {
      cropKey: validKey,
      cropLabel: validKey ? getCropEn(validKey) : local.cropLabel,
      quantityQuintal: typeof parsed.quantityQuintal === 'number' ? parsed.quantityQuintal : local.quantityQuintal,
      rawQuantityText: local.rawQuantityText,
      sellTiming: ['today', 'soon', 'unspecified'].includes(parsed.sellTiming) ? parsed.sellTiming : local.sellTiming,
    };
  } catch (error) {
    console.error('extractProduceIntent Gemini error:', error);
    return local;
  }
}

export type BuyerOffer = {
  buyer: Buyer;
  offerPricePerQuintal: number;
  vsGovtPercent: number | null;
  distanceKm: number | null;
};

export type ComparisonResult = {
  govtPrice: MandiPrice | null;
  govtSource: string;
  isSampleGovtData: boolean;
  offers: BuyerOffer[]; // sorted, best price first
  bestOffer: BuyerOffer | null;
  govtIsBest: boolean;
};

/**
 * Honest comparison: government mandi rate vs. Sarthi Network buyer offers.
 * Deliberately does not always favor Sarthi — if the mandi rate is better,
 * that's what gets shown. This is an awareness tool, not a sales pitch.
 */
export function buildComparison(
  govt: { price: MandiPrice | null; source: string; isSample: boolean },
  buyers: Buyer[],
  cropKey: string,
  farmerLoc?: { lat: number; lng: number }
): ComparisonResult {
  const govtModal = govt.price?.modalPrice ?? null;

  const offers: BuyerOffer[] = buyers
    .map((b) => {
      const cropPrice = b.crops.find((c) => c.crop === cropKey);
      if (!cropPrice) return null;
      const vsGovtPercent =
        govtModal && govtModal > 0 ? Math.round(((cropPrice.pricePerQuintal - govtModal) / govtModal) * 100) : null;
      const dist =
        farmerLoc && b.lat != null && b.lng != null ? distanceKm(farmerLoc, { lat: b.lat, lng: b.lng }) : null;
      return { buyer: b, offerPricePerQuintal: cropPrice.pricePerQuintal, vsGovtPercent, distanceKm: dist };
    })
    .filter((o): o is BuyerOffer => o !== null)
    .sort((a, b) => b.offerPricePerQuintal - a.offerPricePerQuintal);

  const bestOffer = offers[0] ?? null;
  const govtIsBest = !bestOffer || (govtModal !== null && govtModal >= bestOffer.offerPricePerQuintal);

  return { govtPrice: govt.price, govtSource: govt.source, isSampleGovtData: govt.isSample, offers, bestOffer, govtIsBest };
}

/**
 * Instant, always-available explanation built from real numbers only —
 * no network call. Use this to render results immediately; explainComparison()
 * below can later replace it with an AI-polished phrasing of the same facts.
 */
export function buildExplanationText(result: ComparisonResult, cropLabel: string, lang: Lang): string {
  return templateExplain(result, cropLabel, lang);
}

function templateExplain(result: ComparisonResult, cropLabel: string, lang: Lang): string {
  const isHi = lang !== 'en';
  const govtLine = result.govtPrice
    ? isHi
      ? `सरकारी मंडी भाव (${result.govtPrice.mandi}): ₹${result.govtPrice.modalPrice}/क्विंटल`
      : `Government mandi rate (${result.govtPrice.mandi}): ₹${result.govtPrice.modalPrice}/quintal`
    : isHi
      ? 'आज इस फसल का सरकारी भाव उपलब्ध नहीं है।'
      : "Today's government rate for this crop isn't available.";

  if (result.govtIsBest || !result.bestOffer) {
    return isHi
      ? `${govtLine}\nअभी सारथी नेटवर्क में इससे बेहतर भाव किसी व्यापारी ने नहीं दिया है। मंडी में बेचना बेहतर हो सकता है।`
      : `${govtLine}\nNo Sarthi Network buyer has offered more than this yet — selling at the mandi may be your best option right now.`;
  }

  const diff = result.bestOffer.vsGovtPercent ?? 0;
  const buyerLine = isHi
    ? `${result.bestOffer.buyer.businessName} ने ₹${result.bestOffer.offerPricePerQuintal}/क्विंटल का भाव दिया है — मंडी भाव से ${Math.abs(diff)}% ${diff >= 0 ? 'ज़्यादा' : 'कम'}।`
    : `${result.bestOffer.buyer.businessName} is offering ₹${result.bestOffer.offerPricePerQuintal}/quintal — ${Math.abs(diff)}% ${diff >= 0 ? 'higher' : 'lower'} than the mandi rate.`;

  return `${govtLine}\n${buyerLine}`;
}

/**
 * Short spoken/shown explanation of the comparison, in the farmer's language.
 * Gemini-polished when available; the template above is always the safety net,
 * so the message is never blank and never invents numbers.
 */
export async function explainComparison(result: ComparisonResult, cropLabel: string, lang: Lang): Promise<string> {
  const template = templateExplain(result, cropLabel, lang);
  if (!ai) return template;

  const prompt = `Rewrite this farmer-facing price comparison in simple, warm ${lang === 'hi' ? 'Hindi' : 'plain English'} (2-3 short sentences, no jargon). Keep every number exactly as given — do not invent or change any price or percentage.\n\n${template}`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt }),
      6000
    );
    return response.text?.trim() || template;
  } catch (error) {
    console.error('explainComparison Gemini error:', error);
    return template;
  }
}
