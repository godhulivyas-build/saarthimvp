import React, { useEffect, useState } from 'react';
import { getMandiPricesResult, type MandiPrice } from '../../services/mandiPriceService.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';

const MandiPriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [meta, setMeta] = useState<{ source: string; lastUpdated: string; isSample: boolean } | null>(null);
  const { lang } = useI18n();

  const ui = (k: 'title' | 'source' | 'demo'): string => {
    const hi = { title: '📊 आज का मंडी भाव', source: 'स्रोत', demo: 'डेमो' };
    const en = { title: '📊 Today\'s Mandi Bhav', source: 'Source', demo: 'demo' };
    const kn = { title: '📊 ಇಂದಿನ ಮಂಡಿ ದರ', source: 'ಮೂಲ', demo: 'ಡೆಮೊ' };
    const ta = { title: '📊 இன்றைய மண்டி விலை', source: 'மூலம்', demo: 'டெமோ' };
    const te = { title: '📊 నేటి మండీ ధరలు', source: 'మూలం', demo: 'డెమో' };
    const dict = lang === 'hi' ? hi : lang === 'kn' ? kn : lang === 'ta' ? ta : lang === 'te' ? te : en;
    return dict[k];
  };

  useEffect(() => {
    getMandiPricesResult().then((r) => {
      setPrices(r.prices);
      setMeta({ source: r.source, lastUpdated: r.lastUpdated, isSample: r.isSample });
    });
  }, []);

  if (prices.length === 0) return null;

  const items = [...prices, ...prices];

  const cityLoc: Record<string, Record<string, string>> = {
    hi: { Indore: 'इंदौर', Bhopal: 'भोपाल', Ujjain: 'उज्जैन', Ratlam: 'रतलाम', Jabalpur: 'जबलपुर', Neemuch: 'नीमच', Gwalior: 'ग्वालियर', Khandwa: 'खंडवा', Chhindwara: 'छिंदवाड़ा', Morena: 'मुरैना', Satna: 'सतना', Sagar: 'सागर' },
    ta: { Indore: 'இந்தூர்', Bhopal: 'போபால்', Ujjain: 'உஜ்ஜைன்', Ratlam: 'ரத்லம்', Jabalpur: 'ஜபல்பூர்', Neemuch: 'நீமச்', Gwalior: 'குவாலியர்', Khandwa: 'கண்ட்வா', Chhindwara: 'சிந்த்வாரா', Morena: 'முரைனா', Satna: 'சத்னா', Sagar: 'சாகர்' },
    kn: { Indore: 'ಇಂದೋರ್', Bhopal: 'ಭೋಪಾಲ್', Ujjain: 'ಉಜ್ಜೈನ್', Ratlam: 'ರತ್ಲಾಮ್', Jabalpur: 'ಜಬಲ್ಪುರ್', Neemuch: 'ನೀಮಚ್', Gwalior: 'ಗ್ವಾಲಿಯರ್', Khandwa: 'ಖಾಂಡ್ವಾ', Chhindwara: 'ಛಿಂದ್ವಾರಾ', Morena: 'ಮೊರೆನಾ', Satna: 'ಸತ್ನಾ', Sagar: 'ಸಾಗರ್' },
    te: { Indore: 'ఇండోర్', Bhopal: 'భోపాల్', Ujjain: 'ఉజ్జయిని', Ratlam: 'రత్లామ్', Jabalpur: 'జబల్పూర్', Neemuch: 'నీముచ్', Gwalior: 'గ్వాలియర్', Khandwa: 'ఖాండ్వా', Chhindwara: 'చింద్వారా', Morena: 'మొరెనా', Satna: 'సత్నా', Sagar: 'సాగర్' }
  };

  const cropLoc: Record<string, Record<string, string>> = {
    ta: { Soybean: 'சோயாபீன்', Wheat: 'கோதுமை', Gram: 'சுண்டல்', Onion: 'வெங்காயம்', Tomato: 'தக்காளி', Potato: 'உருளைக்கிழங்கு', Maize: 'மக்காச்சோளம்', Garlic: 'பூண்டு', Cotton: 'பருத்தி', Lentil: 'பருப்பு', Rice: 'அரிசி', Mustard: 'கடுகு', 'Green Chilli': 'பச்சை மிளகாய்', Coriander: 'கொத்தமல்லி' },
    kn: { Soybean: 'ಸೋಯಾಬೀನ್', Wheat: 'ಗೋಧಿ', Gram: 'ಕಡಲೆ', Onion: 'ಈರುಳ್ಳಿ', Tomato: 'ಟೊಮ್ಯಾಟೊ', Potato: 'ಆಲೂಗಡ್ಡೆ', Maize: 'ಮೆಕ್ಕೆಜೋಳ', Garlic: 'ಬೆಳ್ಳುಳ್ಳಿ', Cotton: 'ಹತ್ತಿ', Lentil: 'ಮಸೂರ್', Rice: 'ಅಕ್ಕಿ', Mustard: 'ಸಾಸಿವೆ', 'Green Chilli': 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ', Coriander: 'ಕೊತ್ತಂಬರಿ' },
    te: { Soybean: 'సోయాబీన్', Wheat: 'గోధుమ', Gram: 'శనగలు', Onion: 'ఉల్లిపాయ', Tomato: 'టమోటా', Potato: 'బంగాళాదుంప', Maize: 'మొక్కజొన్న', Garlic: 'వెల్లుల్లి', Cotton: 'పత్తి', Lentil: 'కందులు', Rice: 'బియ్యం', Mustard: 'ఆవాలు', 'Green Chilli': 'పచ్చిమిర్చి', Coriander: 'కొత్తిమీర' }
  };

  const getCity = (city: string) => cityLoc[lang]?.[city] || (lang === 'hi' ? cityLoc.hi[city] : city);
  const getCrop = (cropE: string, cropH: string) => lang === 'hi' ? cropH : (cropLoc[lang]?.[cropE] || cropE);
  const getUnit = () => {
    if (lang === 'hi') return '₹/क्विंटल';
    if (lang === 'ta') return '₹/குவிண்டால்';
    if (lang === 'kn') return '₹/ಕ್ವಿಂಟಾಲ್';
    if (lang === 'te') return '₹/క్వింటాల్';
    return '₹/quintal';
  };

  return (
    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white py-2.5 overflow-hidden font-sans border-b border-emerald-900/50">
      <div className="flex items-center max-w-7xl mx-auto px-6">
        <span className="font-bold text-sm whitespace-nowrap border-r border-emerald-500/50 pr-4 mr-4 flex items-center gap-2">
          <span className="text-emerald-300">📊</span> {ui('title')}
        </span>
        {meta ? (
          <span className="hidden lg:inline text-xs text-emerald-200/80 whitespace-nowrap border-r border-emerald-500/50 pr-4 mr-4">
            {ui('source')}: {meta.isSample ? ui('demo') : 'data.gov.in'} · {meta.lastUpdated}
          </span>
        ) : null}
        <div className="overflow-hidden flex-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-emerald-700 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-emerald-800 to-transparent z-10" />
          <div className="ticker-scroll flex whitespace-nowrap">
            {items.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-sm border-r border-emerald-600/30 last:border-0">
                <span className="font-bold text-white">{getCrop(p.crop, p.cropHi)}</span>
                <span className="text-emerald-200 text-xs tracking-wider uppercase">
                  ({getCity(p.mandi)})
                </span>
                <span className="font-black text-amber-300 tracking-tight">₹{p.modalPrice}</span>
                <span className="text-emerald-300/70 text-xs">
                  {getUnit()}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandiPriceTicker;
