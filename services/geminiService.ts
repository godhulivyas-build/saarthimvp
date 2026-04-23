import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TransportOption } from "../types";
import type { Lang } from "../i18n/translations";

const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTransportOptions = async (
  source: string,
  destination: string,
  crop: string,
  weight: string
): Promise<TransportOption[]> => {
  if (!apiKey) {
    // Fallback mock if no API key is present for demo purposes
    return [
      { id: '1', provider: 'Saarthi Express', vehicleType: 'Tata Ace (Chota Hathi)', price: 2500, eta: '4 Hours', rating: 4.5 },
      { id: '2', provider: 'Kisan Logistics', vehicleType: 'Pickup 8ft', price: 1800, eta: '6 Hours', rating: 4.2 },
      { id: '3', provider: 'Speedy Transport', vehicleType: 'Eicher 14ft', price: 4500, eta: '3 Hours', rating: 4.8 },
    ];
  }

  const model = "gemini-3-flash-preview";
  
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        provider: { type: Type.STRING },
        vehicleType: { type: Type.STRING },
        price: { type: Type.NUMBER },
        eta: { type: Type.STRING },
        rating: { type: Type.NUMBER },
      },
      required: ["id", "provider", "vehicleType", "price", "eta", "rating"]
    }
  };

  const prompt = `
    Generate 3 realistic transport logistics options for moving ${weight} of ${crop} from ${source} to ${destination} in India.
    Context:
    - Prices should be in Indian Rupees (INR) roughly accurate for the distance.
    - Vehicle types should be common in India (e.g., Tata Ace, Pickup, Eicher, Truck).
    - Ratings between 3.5 and 5.0.
    - ETA should be realistic.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as TransportOption[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const getSupportAdvice = async (issue: string, lang: Lang = 'hi'): Promise<string> => {
  const promptLang: 'hi' | 'en' = lang === 'hi' ? 'hi' : 'en';
  if (!apiKey) {
    return promptLang === 'hi'
      ? 'अभी इंटरनेट या API कुंजी नहीं है। मंडी जाएँ, स्थानीय खरीदार से भाव पूछें, और ट्रांसपोर्ट के लिए सारथी ऐप में पिकअप मांगें।'
      : 'No API key or connection. Visit your mandi, ask local buyers for rates, and request pickup in Saarthi.';
  }

  const model = "gemini-3-flash-preview";
  const prompt =
    promptLang === 'hi'
      ? `आप सारथी ऐप के सहायक हैं — छोटे किसानों के लिए सरल हिंदी में जवाब दें।
प्रश्न: "${issue}"
- मंडी भाव, कहाँ बेचें, ढुलाई/पिकअप — इन पर ध्यान दें।
- 3 छोटे बिंदुओं में जवाब दें। कठिन शब्द कम।`
      : `You are Saarthi, a simple assistant for Indian farmers and traders.
User question: "${issue}"
Answer in plain English (short words). 3 bullet points. Cover mandi prices, where to sell, or logistics when relevant.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return (
      response.text ||
      (promptLang === 'hi' ? 'अभी जवाब नहीं मिला। दोबारा कोशिश करें।' : "Sorry, I couldn't generate advice at this moment.")
    );
  } catch (error) {
    console.error("Support API Error:", error);
    return promptLang === 'hi' ? 'सर्वर में दिक्कत है। बाद में कोशिश करें।' : 'Technical difficulty. Please try again later.';
  }
};