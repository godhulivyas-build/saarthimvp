export type GovAlert = {
  id: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  category: 'scheme' | 'weather' | 'advisory' | 'market' | 'workshop';
  date: string;
  url?: string;
};

const CATEGORY_ICONS: Record<GovAlert['category'], string> = {
  scheme: '🏛️',
  weather: '🌧️',
  advisory: '📢',
  market: '📊',
  workshop: '🎓',
};

export function getCategoryIcon(cat: GovAlert['category']): string {
  return CATEGORY_ICONS[cat] ?? '📢';
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MOCK_ALERTS: GovAlert[] = [
  {
    id: 'a1',
    title: 'PM-KISAN 17th Installment Released',
    titleHi: 'पीएम-किसान 17वीं किस्त जारी',
    body: 'Check your bank account for ₹2000 PM-KISAN installment.',
    bodyHi: 'अपने बैंक खाते में ₹2000 पीएम-किसान की किस्त जांचें।',
    category: 'scheme',
    date: todayStr(),
    url: 'https://pmkisan.gov.in',
  },
  {
    id: 'a2',
    title: 'Heavy Rain Warning – Western MP',
    titleHi: 'भारी बारिश की चेतावनी – पश्चिमी मध्य प्रदेश',
    body: 'IMD warns heavy rain in Indore, Ujjain, Dewas for next 48 hours. Protect stored grain.',
    bodyHi: 'IMD ने इंदौर, उज्जैन, देवास में अगले 48 घंटे भारी बारिश की चेतावनी दी है। भंडारित अनाज सुरक्षित करें।',
    category: 'weather',
    date: todayStr(),
  },
  {
    id: 'a3',
    title: 'Soybean MSP Increased to ₹4,892/qtl',
    titleHi: 'सोयाबीन MSP बढ़कर ₹4,892/क्विंटल',
    body: 'Government announces new MSP for Kharif 2026. Sell at government procurement centers.',
    bodyHi: 'सरकार ने खरीफ 2026 के लिए नया MSP घोषित किया। सरकारी खरीद केंद्रों पर बेचें।',
    category: 'market',
    date: recentDate(1),
  },
  {
    id: 'a4',
    title: 'Free Soil Testing Camp – Sehore',
    titleHi: 'मुफ्त मिट्टी जांच शिविर – सीहोर',
    body: 'KVK Sehore organizing free soil health card camp on 28th March.',
    bodyHi: 'KVK सीहोर 28 मार्च को मुफ्त मिट्टी स्वास्थ्य कार्ड शिविर आयोजित कर रहा है।',
    category: 'workshop',
    date: recentDate(2),
  },
  {
    id: 'a5',
    title: 'Crop Insurance Last Date Extended',
    titleHi: 'फसल बीमा की अंतिम तिथि बढ़ाई गई',
    body: 'PMFBY enrollment deadline extended to 15th April for Kharif season.',
    bodyHi: 'PMFBY नामांकन की अंतिम तिथि खरीफ सीज़न के लिए 15 अप्रैल तक बढ़ाई गई।',
    category: 'scheme',
    date: recentDate(3),
    url: 'https://pmfby.gov.in',
  },
  {
    id: 'a6',
    title: 'Advisory: Protect Wheat from Rust',
    titleHi: 'सलाह: गेहूं को रतुआ रोग से बचाएं',
    body: 'Apply fungicide spray if yellow rust spots appear on wheat leaves.',
    bodyHi: 'अगर गेहूं की पत्तियों पर पीले रतुआ के धब्बे दिखें तो फफूंदनाशक स्प्रे करें।',
    category: 'advisory',
    date: recentDate(4),
  },
];

export async function getGovAlerts(): Promise<GovAlert[]> {
  // In production, fetch from a real API or RSS feed
  return MOCK_ALERTS;
}
