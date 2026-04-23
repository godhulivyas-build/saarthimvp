import React, { useEffect, useState } from 'react';
import { getMandiPricesResult, type MandiPrice } from '../../services/mandiPriceService.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';

const MandiPriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [meta, setMeta] = useState<{ source: string; lastUpdated: string; isSample: boolean } | null>(null);
  const { lang } = useI18n();

  const ui = (k: 'title' | 'source' | 'demo'): string => {
    const hi = { title: '📊 मंडी भाव', source: 'स्रोत', demo: 'डेमो' };
    const en = { title: '📊 Mandi prices', source: 'Source', demo: 'demo' };
    const kn = { title: '📊 ಮಂಡಿ ದರ', source: 'ಮೂಲ', demo: 'ಡೆಮೊ' };
    const ta = { title: '📊 மண்டி விலை', source: 'மூலம்', demo: 'டெமோ' };
    const te = { title: '📊 మండీ ధరలు', source: 'మూలం', demo: 'డెమో' };
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

  return (
    <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white py-2.5 overflow-hidden">
      <div className="flex items-center">
        <span className="pl-4 pr-3 font-semibold text-sm whitespace-nowrap border-r border-green-500 mr-3">
          {ui('title')}
        </span>
        {meta ? (
          <span className="hidden sm:inline pl-2 pr-3 text-xs text-green-100 whitespace-nowrap border-r border-green-500 mr-3">
            {ui('source')}: {meta.isSample ? ui('demo') : 'data.gov.in'} · {meta.lastUpdated}
          </span>
        ) : null}
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex whitespace-nowrap">
            {items.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-4 text-sm">
                <span className="font-medium">{lang === 'hi' ? p.cropHi : p.crop}</span>
                <span className="text-green-200">({p.mandi})</span>
                <span className="font-bold text-yellow-200">₹{p.modalPrice}</span>
                <span className="text-green-300 text-xs">{p.unit}</span>
                <span className="text-green-400 mx-1">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandiPriceTicker;
