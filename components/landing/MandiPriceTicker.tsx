import React, { useEffect, useState } from 'react';
import { getMandiPriceForCrop } from '../../services/mandiPriceService.ts';
import { listAllBuyers } from '../../services/buyerDirectory.ts';
import { listTransportersForDistrict } from '../../services/transporterDirectory.ts';
import { computeSaarthiPrice } from '../../services/saarthiPriceService.ts';
import { getCropHi } from '../../services/cropCatalog.ts';
import { MP_DISTRICTS } from '../../config/mpLocations.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';

type TickerItem = {
  crop: string;
  cropHi: string;
  district: string;
  govtPrice: number;
  netPrice: number;
};

const ui = (lang: string, k: 'title' | 'mandi' | 'saarthi'): string => {
  const hi = { title: '📊 सत्यापित भाव', mandi: 'मंडी', saarthi: 'सारथी' };
  const en = { title: "📊 Verified Prices", mandi: 'Mandi', saarthi: 'Saarthi' };
  const kn = { title: '📊 ಪರಿಶೀಲಿಸಿದ ದರ', mandi: 'ಮಂಡಿ', saarthi: 'ಸಾರ್ಥಿ' };
  const ta = { title: '📊 சரிபார்க்கப்பட்ட விலை', mandi: 'மண்டி', saarthi: 'சார்தி' };
  const te = { title: '📊 ధృవీకరించిన ధరలు', mandi: 'మండీ', saarthi: 'సార్థి' };
  const dict = lang === 'hi' ? hi : lang === 'kn' ? kn : lang === 'ta' ? ta : lang === 'te' ? te : en;
  return dict[k];
};

/**
 * Verified mandi-vs-Saarthi price ticker. Every entry here is built only
 * from a real registered buyer's crop offer and a real registered
 * transporter's rate for that route — never a sample/demo number. Crop or
 * district pairs with no verified buyer+transporter match are simply
 * skipped, not filled in with a guess.
 */
const MandiPriceTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>([]);
  const { lang } = useI18n();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [buyers, transporters] = await Promise.all([listAllBuyers(), listTransportersForDistrict()]);
      const govtCache = new Map<string, number | null>();

      const results: TickerItem[] = [];
      for (const buyer of buyers) {
        if (buyer.lat == null || buyer.lng == null) continue;
        const district = MP_DISTRICTS.find((d) => d.name.toLowerCase() === buyer.district.toLowerCase());
        if (!district) continue;

        for (const cropPrice of buyer.crops) {
          if (!govtCache.has(cropPrice.crop)) {
            const govt = await getMandiPriceForCrop(cropPrice.crop, 'Madhya Pradesh');
            govtCache.set(cropPrice.crop, govt.price?.modalPrice ?? null);
          }
          const govtModal = govtCache.get(cropPrice.crop) ?? null;
          if (govtModal == null) continue;

          const buyerOffer = {
            buyer,
            offerPricePerQuintal: cropPrice.pricePerQuintal,
            vsGovtPercent: null,
            distanceKm: null,
          };
          const sp = computeSaarthiPrice(
            buyerOffer,
            { lat: district.lat, lng: district.lng },
            transporters,
            null,
            govtModal
          );
          if (sp.netPricePerQuintal == null) continue;

          results.push({
            crop: cropPrice.crop,
            cropHi: getCropHi(cropPrice.crop),
            district: buyer.district,
            govtPrice: govtModal,
            netPrice: sp.netPricePerQuintal,
          });
        }
      }
      if (!cancelled) setItems(results);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  const loop = [...items, ...items];
  const unit = lang === 'hi' ? '₹/क्विंटल' : '₹/quintal';

  return (
    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white py-2.5 overflow-hidden font-sans border-b border-emerald-900/50">
      <div className="flex items-center max-w-7xl mx-auto px-6">
        <span className="font-bold text-sm whitespace-nowrap border-r border-emerald-500/50 pr-4 mr-4 flex items-center gap-2">
          <span className="text-emerald-300">📊</span> {ui(lang, 'title')}
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-emerald-700 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-emerald-800 to-transparent z-10" />
          <div className="ticker-scroll flex whitespace-nowrap">
            {loop.map((it, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-sm border-r border-emerald-600/30 last:border-0">
                <span className="font-bold text-white">{lang === 'hi' ? it.cropHi : it.crop}</span>
                <span className="text-emerald-200 text-xs tracking-wider uppercase">({it.district})</span>
                <span className="text-emerald-300/70 text-xs">{ui(lang, 'mandi')}</span>
                <span className="font-black text-white/80 tracking-tight">₹{it.govtPrice}</span>
                <span className="text-emerald-300/70 text-xs">{ui(lang, 'saarthi')}</span>
                <span className="font-black text-amber-300 tracking-tight">₹{it.netPrice}</span>
                <span className="text-emerald-300/70 text-xs">{unit}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandiPriceTicker;
