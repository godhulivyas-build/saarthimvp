import React, { useEffect, useState } from 'react';
import { getMandiPricesResult, type MandiPrice } from '../../services/mandiPriceService.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';
import { TrendingUp } from 'lucide-react';

type Props = { compact?: boolean };

export const MandiPricesPanel: React.FC<Props> = ({ compact = false }) => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [meta, setMeta] = useState<{ source: string; lastUpdated: string; isSample: boolean } | null>(null);
  const { lang } = useI18n();

  const ui = (
    k: 'title' | 'range' | 'more' | 'source' | 'lastUpdated' | 'demo'
  ): string => {
    const hi = {
      title: '📊 आज के मंडी भाव',
      range: 'रेंज',
      more: 'और भाव देखें →',
      source: 'स्रोत',
      lastUpdated: 'अंतिम अपडेट',
      demo: 'डेमो',
    };
    const en = {
      title: "📊 Today's mandi prices",
      range: 'Range',
      more: 'more prices →',
      source: 'Source',
      lastUpdated: 'Last updated',
      demo: 'demo',
    };
    const kn = {
      title: '📊 ಇಂದಿನ ಮಂಡಿ ದರ',
      range: 'ಶ್ರೇಣಿ',
      more: 'ಇನ್ನಷ್ಟು ದರ →',
      source: 'ಮೂಲ',
      lastUpdated: 'ಕೊನೆಯ ಅಪ್‌ಡೇಟ್',
      demo: 'ಡೆಮೊ',
    };
    const ta = {
      title: '📊 இன்றைய மண்டி விலை',
      range: 'வரம்பு',
      more: 'மேலும் விலைகள் →',
      source: 'மூலம்',
      lastUpdated: 'கடைசி புதுப்பிப்பு',
      demo: 'டெமோ',
    };
    const te = {
      title: '📊 నేటి మండీ ధరలు',
      range: 'పరిధి',
      more: 'ఇంకా ధరలు →',
      source: 'మూలం',
      lastUpdated: 'చివరి అప్‌డేట్',
      demo: 'డెమో',
    };
    const dict = lang === 'hi' ? hi : lang === 'kn' ? kn : lang === 'ta' ? ta : lang === 'te' ? te : en;
    return dict[k];
  };

  useEffect(() => {
    getMandiPricesResult().then((r) => {
      setPrices(r.prices);
      setMeta({ source: r.source, lastUpdated: r.lastUpdated, isSample: r.isSample });
    });
  }, []);

  if (prices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
        <div className="h-24" />
      </div>
    );
  }

  const displayPrices = compact ? prices.slice(0, 5) : prices;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        <h3 className="font-bold">{ui('title')}</h3>
      </div>

      <div className="divide-y divide-gray-50">
        {displayPrices.map((p, i) => (
          <div
            key={i}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-bold text-gray-900">{lang === 'hi' ? p.cropHi : p.crop}</p>
              <p className="text-xs text-gray-500">{p.mandi}</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-green-700 text-lg">₹{p.modalPrice}</p>
              <p className="text-[10px] text-gray-400">
                {ui('range')}: ₹{p.minPrice} – ₹{p.maxPrice}
              </p>
            </div>
          </div>
        ))}
      </div>

      {compact && prices.length > 5 && (
        <div className="px-4 py-2 bg-gray-50 text-center">
          <span className="text-sm text-green-700 font-bold">
            + {prices.length - 5} {ui('more')}
          </span>
        </div>
      )}

      {meta ? (
        <div className="px-4 py-2 bg-white border-t border-gray-100 text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            {ui('source')}: <span className="font-semibold">{meta.source}</span>
            {meta.isSample ? <span className="ml-2 text-orange-600 font-semibold">({ui('demo')})</span> : null}
          </span>
          <span>
            {ui('lastUpdated')}: <span className="font-semibold">{meta.lastUpdated}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
};
