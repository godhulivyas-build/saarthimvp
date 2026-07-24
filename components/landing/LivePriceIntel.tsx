import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, Truck, FlaskConical, BadgeCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { CROP_CATALOG } from '../../services/cropCatalog';
import { MP_DISTRICTS } from '../../config/mpLocations';
import { getMandiPriceForCrop } from '../../services/mandiPriceService';
import { listBuyersForCrop, distanceKm } from '../../services/buyerDirectory';
import { listTransportersForDistrict } from '../../services/transporterDirectory';
import { buildComparison, ComparisonResult } from '../../services/discoveryAgentService';
import { computeSaarthiPrice, SaarthiPriceResult } from '../../services/saarthiPriceService';
import { LiveMapView, MapMarkerData } from './LiveMapView';

const NEARBY_TRANSPORTER_RADIUS_KM = 120;

/**
 * Public, no-login home page hook: live government mandi rate vs. the best
 * Sarthi Network partner offer for a crop + district, an honest "best price"
 * call, nearby transporter availability, and a map — all before signup.
 */
export const LivePriceIntel: React.FC = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [cropKey, setCropKey] = useState('Wheat');
  const [districtName, setDistrictName] = useState('Dewas');
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [saarthiPrice, setSaarthiPrice] = useState<SaarthiPriceResult | null>(null);
  const [nearbyTransporterCount, setNearbyTransporterCount] = useState(0);
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);

  const cropLabel = (key: string) => {
    const c = CROP_CATALOG.find((x) => x.key === key);
    return c ? (isHi ? c.hi : c.en) : key;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const district = MP_DISTRICTS.find((d) => d.name === districtName) ?? MP_DISTRICTS[0];
      const [govt, buyers, transporters] = await Promise.all([
        getMandiPriceForCrop(cropKey, 'Madhya Pradesh'),
        listBuyersForCrop(cropKey, districtName),
        listTransportersForDistrict(),
      ]);
      if (cancelled) return;

      const comp = buildComparison(govt, buyers, cropKey, { lat: district.lat, lng: district.lng });
      setComparison(comp);

      setSaarthiPrice(
        comp.bestOffer
          ? computeSaarthiPrice(
              comp.bestOffer,
              { lat: district.lat, lng: district.lng },
              transporters,
              null,
              comp.govtPrice?.modalPrice ?? null
            )
          : null
      );

      const nearby = transporters
        .filter((t) => t.lat != null && t.lng != null)
        .map((t) => ({ t, dist: distanceKm({ lat: district.lat, lng: district.lng }, { lat: t.lat!, lng: t.lng! }) }))
        .filter((x) => x.dist <= NEARBY_TRANSPORTER_RADIUS_KM)
        .sort((a, b) => a.dist - b.dist);
      setNearbyTransporterCount(nearby.length);

      const mk: MapMarkerData[] = [
        { lat: district.lat, lng: district.lng, label: `${district.name} Mandi`, kind: 'mandi' },
      ];
      if (comp.bestOffer?.buyer.lat != null && comp.bestOffer.buyer.lng != null) {
        mk.push({
          lat: comp.bestOffer.buyer.lat,
          lng: comp.bestOffer.buyer.lng,
          label: comp.bestOffer.buyer.businessName,
          kind: 'buyer',
        });
      }
      nearby.slice(0, 3).forEach(({ t }) => {
        mk.push({ lat: t.lat!, lng: t.lng!, label: t.driverName, kind: 'transporter' });
      });
      setMarkers(mk);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cropKey, districtName]);

  const govtPrice = comparison?.govtPrice?.modalPrice ?? null;
  const bestOffer = comparison?.bestOffer ?? null;
  const netPrice = saarthiPrice?.netPricePerQuintal ?? null;
  const effectivePrice = netPrice ?? bestOffer?.offerPricePerQuintal ?? null;
  const govtIsBest = !effectivePrice || (govtPrice !== null && govtPrice >= effectivePrice);
  const netIsBest = !govtIsBest && netPrice !== null;
  const rawIsBest = !govtIsBest && netPrice === null && bestOffer !== null;

  return (
    <section id="live-prices" className="py-10 md:py-12 bg-white dark:bg-slate-900 border-y border-emerald-100 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {tt('Live right now', 'अभी लाइव')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {tt('See the best price before you sell', 'बेचने से पहले सबसे अच्छा भाव देखें')}
          </h2>
          <p className="text-emerald-800/70 dark:text-emerald-200/70 max-w-2xl mx-auto">
            {tt(
              "Every price here is either the real government rate, or a real Sarthi Network buyer's own listed offer — never a guess.",
              'यहाँ हर भाव या तो असली सरकारी दर है, या किसी असली सारथी नेटवर्क खरीदार का अपना दिया हुआ भाव है — कभी अंदाज़ा नहीं।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <select
            value={cropKey}
            onChange={(e) => setCropKey(e.target.value)}
            className="sarthi-input w-auto min-w-[160px] cursor-pointer font-bold"
          >
            {CROP_CATALOG.map((c) => (
              <option key={c.key} value={c.key}>
                {isHi ? c.hi : c.en}
              </option>
            ))}
          </select>
          <select
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            className="sarthi-input w-auto min-w-[160px] cursor-pointer font-bold"
          >
            {MP_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {isHi ? d.nameHi : d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Government Mandi Rate */}
            <div
              className={`relative rounded-2xl p-6 border-2 flex flex-col justify-between ${
                govtIsBest
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              {govtIsBest && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
                  {tt('Best Price', 'सबसे अच्छा भाव')}
                </span>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
                    {tt('Government Mandi', 'सरकारी मंडी')}
                  </h3>
                  {comparison?.isSampleGovtData && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <FlaskConical className="w-3 h-3" /> {tt('Sample', 'नमूना')}
                    </span>
                  )}
                </div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                ) : govtPrice !== null ? (
                  <p className="text-3xl font-black text-blue-800 dark:text-blue-300">
                    ₹{govtPrice} <span className="text-sm font-medium text-gray-500">/{tt('quintal', 'क्विंटल')}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">{tt('No rate available today.', 'आज कोई भाव उपलब्ध नहीं।')}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">{comparison?.govtPrice?.mandi ?? districtName}</p>
            </div>

            {/* Best Sarthi Partner Offer (raw, before transport) */}
            <div
              className={`relative rounded-2xl p-6 border-2 flex flex-col justify-between ${
                rawIsBest
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              {rawIsBest && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
                  {tt('Best Price', 'सबसे अच्छा भाव')}
                </span>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {tt('Sarthi Network Partner', 'सारथी नेटवर्क पार्टनर')}
                  </h3>
                  {bestOffer && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> {tt('Verified', 'सत्यापित')}
                    </span>
                  )}
                </div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                ) : bestOffer ? (
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{bestOffer.offerPricePerQuintal}{' '}
                    <span className="text-sm font-medium text-gray-500">/{tt('quintal', 'क्विंटल')}</span>
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-500">
                      {tt('No partner offer yet for this crop here.', 'यहाँ इस फसल के लिए अभी कोई पार्टनर ऑफर नहीं।')}
                    </p>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {tt('Are you a buyer here? Add a real price →', 'क्या आप यहाँ खरीदार हैं? असली भाव जोड़ें →')}
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 truncate">
                {bestOffer?.buyer.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                {bestOffer?.buyer.businessName ?? '—'}
              </p>
            </div>

            {/* Saarthi Price — net of real transport cost, the honest bottom line */}
            <div
              className={`relative rounded-2xl p-6 border-2 flex flex-col justify-between ${
                netIsBest
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
              }`}
            >
              {netIsBest && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
                  {tt('Best Price', 'सबसे अच्छा भाव')}
                </span>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    {tt('Saarthi Price (after transport)', 'सारथी भाव (ट्रांसपोर्ट के बाद)')}
                  </h3>
                  {netPrice !== null && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> {tt('Verified', 'सत्यापित')}
                    </span>
                  )}
                </div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                ) : netPrice !== null ? (
                  <p className="text-3xl font-black text-amber-800 dark:text-amber-300">
                    ₹{netPrice} <span className="text-sm font-medium text-gray-500">/{tt('quintal', 'क्विंटल')}</span>
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-500">
                      {saarthiPrice?.note ??
                        tt('No partner offer yet for this crop here.', 'यहाँ इस फसल के लिए अभी कोई पार्टनर ऑफर नहीं।')}
                    </p>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      {tt('Are you a driver here? Register your rate →', 'क्या आप यहाँ ड्राइवर हैं? अपना भाव दर्ज करें →')}
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 truncate">
                {saarthiPrice?.transportMatch
                  ? tt(
                      `− ₹${saarthiPrice.transportCostPerQuintal} transport via ${saarthiPrice.transportMatch.transporter.driverName}`,
                      `− ₹${saarthiPrice.transportCostPerQuintal} ट्रांसपोर्ट (${saarthiPrice.transportMatch.transporter.driverName})`
                    )
                  : tt('Real buyer offer minus real transporter cost', 'असली खरीदार ऑफर घटा असली ट्रांसपोर्ट लागत')}
              </p>
            </div>

            {/* Transporters + CTA */}
            <div className="sm:col-span-3 rounded-2xl p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {loading
                    ? tt('Checking nearby transport…', 'आस-पास ट्रांसपोर्ट देख रहे हैं…')
                    : tt(
                        `${nearbyTransporterCount} transporter${nearbyTransporterCount === 1 ? '' : 's'} available near ${districtName}`,
                        `${districtName} के पास ${nearbyTransporterCount} ट्रांसपोर्टर उपलब्ध`
                      )}
                </p>
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="shrink-0 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl transition-transform active:scale-95 shadow-sm"
              >
                {tt(`Sell my ${cropLabel(cropKey)} now`, `अभी ${cropLabel(cropKey)} बेचें`)}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <LiveMapView markers={markers} heightClass="h-full min-h-[320px]" />
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 justify-center lg:justify-start">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> {tt('Mandi', 'मंडी')}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> {tt('Buyer', 'खरीदार')}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> {tt('Transporter', 'ट्रांसपोर्टर')}</span>
            </div>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-5">
          <TrendingUp className="w-3.5 h-3.5" />
          {tt(
            'Honest by design — we show the government rate as best when it genuinely is.',
            'ईमानदार तुलना — जब सरकारी भाव सच में बेहतर हो, तो हम उसे ही सबसे अच्छा दिखाते हैं।'
          )}
        </p>
      </div>
    </section>
  );
};
