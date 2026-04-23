import { GoogleGenAI } from '@google/genai';

export type CropDiagnosisResult = {
  label: string;
  confidence: number;
  summary: string;
  actions: string[];
  disclaimer: string;
};

const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';

const demo = (): CropDiagnosisResult => ({
  label: 'Leaf spot (demo)',
  confidence: 0.72,
  summary:
    'This looks like a common leaf-spot pattern. It can be caused by humidity + fungal pressure. This is a demo diagnosis (not medical advice).',
  actions: [
    'Remove heavily infected leaves and avoid overhead irrigation.',
    'Improve airflow (spacing) and check for water-logging.',
    'If the issue spreads quickly, consult a local agri officer for the right spray.',
  ],
  disclaimer: 'Demo only. For real diagnosis, consult an expert and confirm with field inspection.',
});

export async function diagnoseCropFromImage(file: File): Promise<CropDiagnosisResult> {
  if (!apiKey) return demo();

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = btoa(String.fromCharCode(...bytes));

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                'You are an agronomy assistant. Identify likely crop disease or deficiency from the photo. ' +
                'Return concise JSON with keys: label, confidence (0..1), summary, actions (3 bullets), disclaimer.',
            },
            {
              inlineData: {
                mimeType: file.type || 'image/jpeg',
                data: base64,
              },
            },
          ],
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text) as CropDiagnosisResult;
    if (!parsed?.label) return demo();
    return parsed;
  } catch {
    return demo();
  }
}

