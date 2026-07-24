import React, { useState } from 'react';
import { Mic, Search, Loader2, MapPin, Phone, Navigation2, Handshake, BadgeCheck, FlaskConical, Store, Star, Truck } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useVoiceAssistant } from '../../voice/VoiceAssistantProvider';
import { Card } from '../v2/ui/Card';
import { MP_DISTRICTS } from '../../config/mpLocations';
import { CROP_CATALOG } from '../../services/cropCatalog';
import { getMandiPriceForCrop } from '../../services/mandiPriceService';
import { listBuyersForCrop, BUYER_TYPE_LABEL } from '../../services/buyerDirectory';
import {
  extractProduceIntent,
  buildComparison,
  buildExplanationText,
  explainComparison,
  ComparisonResult,
} from '../../services/discoveryAgentService';
import { findNearbyRestaurants, DiscoveredPlace } from '../../services/osmDiscovery';
import { listTransportersForDistrict } from '../../services/transporterDirectory';
import { computeSaarthiPrice, SaarthiPriceResult } from '../../services/saarthiPriceService';
import { BuyerOnboardingForm } from './BuyerOnboardingForm';

/** Farmer-facing: "I have produce, find nearby buyers." */
export const SellFlow: React.FC = () => {
  const { lang } = useI18n();
  const { listening, dictateOnce, say } = useVoiceAssistant();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [inputText, setInputText] = useState('');
  const [cropKey, setCropKey] = useState(CROP_CATALOG[0].key);
  const [quantityQuintal, setQuantityQuintal] = useState<number | ''>('');
  const [districtName, setDistrictName] = useState('Dewas');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [saarthiPrice, setSaarthiPrice] = useState<SaarthiPriceResult | null>(null);
  const [explanation, setExplanation] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<DiscoveredPlace[]>([]);

  const cropLabel = (key: string) => {
    const c = CROP_CATALOG.find((x) => x.key === key);
    return c ? (isHi ? c.hi : c.en) : key;
  };

  const runDiscovery = async (activeCropKey: string, qty: number | '') => {
    setLoading(true);
    setHasSearched(true);
    setExplanation('');
    try {
      const district = MP_DISTRICTS.find((d) => d.name === districtName) ?? MP_DISTRICTS[0];
      const [govt, buyers, places, transporters] = await Promise.all([
        getMandiPriceForCrop(activeCropKey, 'Madhya Pradesh'),
        listBuyersForCrop(activeCropKey, districtName),
        findNearbyRestaurants({ lat: district.lat, lng: district.lng }),
        listTransportersForDistrict(),
      ]);
      const comp = buildComparison(govt, buyers, activeCropKey, { lat: district.lat, lng: district.lng });
      setComparison(comp);
      setNearbyPlaces(places);

      setSaarthiPrice(
        comp.bestOffer
          ? computeSaarthiPrice(
              comp.bestOffer,
              { lat: district.lat, lng: district.lng },
              transporters,
              typeof qty === 'number' && qty > 0 ? qty : null,
              comp.govtPrice?.modalPrice ?? null
            )
          : null
      );

      const instantText = buildExplanationText(comp, cropLabel(activeCropKey), lang);
      setExplanation(instantText);
      setLoading(false);
      say(instantText);

      explainComparison(comp, cropLabel(activeCropKey), lang).then((polished) => {
        if (polished && polished !== instantText) setExplanation(polished);
      });
    } catch (err) {
      console.error('[discover] runDiscovery error', err);
      setLoading(false);
    }
  };

  const handleVoice = () => {
    dictateOnce({
      lang,
      onText: async (heard) => {
        setInputText(heard);
        const intent = await extractProduceIntent(heard, lang);
        if (intent.cropKey) setCropKey(intent.cropKey);
        if (intent.quantityQuintal) setQuantityQuintal(Math.round(intent.quantityQuintal * 100) / 100);
        await runDiscovery(intent.cropKey ?? cropKey, intent.quantityQuintal ?? quantityQuintal);
      },
      onError: (msg) => say(msg),
    });
  };

  const handleTextSubmit = async () => {
    if (inputText.trim()) {
      const intent = await extractProduceIntent(inputText, lang);
      if (intent.cropKey) setCropKey(intent.cropKey);
      if (intent.quantityQuintal) setQuantityQuintal(Math.round(intent.quantityQuintal * 100) / 100);
      await runDiscovery(intent.cropKey ?? cropKey, intent.quantityQuintal ?? quantityQuintal);
    } else {
      await runDiscovery(cropKey, quantityQuintal);
    }
  };

  const totalValue =
    comparison?.bestOffer && typeof quantityQuintal === 'number'
      ? Math.round(comparison.bestOffer.offerPricePerQuintal * quantityQuintal)
      : null;

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">
          {tt(
            'Tell Sarthi what you have — by voice or text — in your own words.',
            'सारथी को बताएं आपके पास क्या है — आवाज़ या टाइप करके, अपनी भाषा में।'
          )}
        </p>

        <div className="flex gap-2">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={tt('e.g. 80kg tomatoes ready tomorrow', 'उदा. 80 किलो टमाटर, कल तैयार')}
            className="sarthi-input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          />
          <button
            onClick={handleVoice}
            className={`min-w-[52px] rounded-xl flex items-center justify-center border-2 ${
              listening ? 'bg-red-600 text-white border-red-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
            aria-label="Speak"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Crop', 'फसल')}</label>
            <select value={cropKey} onChange={(e) => setCropKey(e.target.value)} className="sarthi-input cursor-pointer">
              {CROP_CATALOG.map((c) => (
                <option key={c.key} value={c.key}>
                  {isHi ? c.hi : c.en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Quantity (quintal)', 'मात्रा (क्विंटल)')}</label>
            <input
              type="number"
              value={quantityQuintal}
              onChange={(e) => setQuantityQuintal(e.target.value ? Number(e.target.value) : '')}
              className="sarthi-input"
              placeholder="—"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Your district', 'आपका ज़िला')}</label>
          <select value={districtName} onChange={(e) => setDistrictName(e.target.value)} className="sarthi-input cursor-pointer">
            {MP_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {isHi ? d.nameHi : d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleTextSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {tt('Find buyers & prices', 'खरीदार और भाव खोजें')}
        </button>
      </Card>

      {hasSearched && !loading && comparison && (
        <>
          <Card className="space-y-2 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wide text-blue-700 dark:text-blue-400">
                {tt('Government Mandi Rate', 'सरकारी मंडी भाव')}
              </h2>
              {comparison.isSampleGovtData && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <FlaskConical className="w-3 h-3" /> {tt('Sample data', 'नमूना डेटा')}
                </span>
              )}
            </div>
            {comparison.govtPrice ? (
              <>
                <p className="text-2xl font-black text-blue-800 dark:text-blue-300">
                  ₹{comparison.govtPrice.modalPrice} <span className="text-sm font-medium text-gray-500">/quintal</span>
                </p>
                <p className="text-xs text-gray-500">
                  {comparison.govtPrice.mandi} · {comparison.govtPrice.date} · {comparison.govtSource}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">{tt('No government rate found for this crop today.', 'आज इस फसल का सरकारी भाव उपलब्ध नहीं है।')}</p>
            )}
          </Card>

          <Card className={`space-y-1 ${comparison.govtIsBest ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'}`}>
            <p className="text-sm whitespace-pre-line text-slate-800 dark:text-slate-200">{explanation}</p>
            {totalValue !== null && !comparison.govtIsBest && (
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {tt(`For your ${quantityQuintal} quintal, that's about ₹${totalValue} total.`, `आपके ${quantityQuintal} क्विंटल के लिए, यह लगभग ₹${totalValue} कुल है।`)}
              </p>
            )}
          </Card>

          {comparison.bestOffer && (
            <Card className="space-y-2 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {tt('Saarthi Price (after real transport cost)', 'सारथी भाव (असली ट्रांसपोर्ट लागत के बाद)')}
                </h2>
              </div>
              {saarthiPrice?.netPricePerQuintal != null ? (
                <>
                  <p className="text-2xl font-black text-amber-800 dark:text-amber-300">
                    ₹{saarthiPrice.netPricePerQuintal} <span className="text-sm font-medium text-gray-500">/quintal</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {tt(
                      `₹${comparison.bestOffer.offerPricePerQuintal} from ${comparison.bestOffer.buyer.businessName} − ₹${saarthiPrice.transportCostPerQuintal} transport via ${saarthiPrice.transportMatch?.transporter.driverName}`,
                      `₹${comparison.bestOffer.offerPricePerQuintal} (${comparison.bestOffer.buyer.businessName}) − ₹${saarthiPrice.transportCostPerQuintal} ट्रांसपोर्ट (${saarthiPrice.transportMatch?.transporter.driverName})`
                    )}
                  </p>
                  {saarthiPrice.vsGovtPercent !== null && (
                    <p className={`text-sm font-bold ${saarthiPrice.vsGovtPercent >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'}`}>
                      {saarthiPrice.vsGovtPercent >= 0 ? '+' : ''}
                      {saarthiPrice.vsGovtPercent}% {tt('vs mandi, even after transport', 'मंडी से, ट्रांसपोर्ट के बाद भी')}
                    </p>
                  )}
                  {typeof quantityQuintal === 'number' && quantityQuintal > 0 && (
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {tt(
                        `For your ${quantityQuintal} quintal, that's about ₹${Math.round(saarthiPrice.netPricePerQuintal * quantityQuintal)} net.`,
                        `आपके ${quantityQuintal} क्विंटल के लिए, यह लगभग ₹${Math.round(saarthiPrice.netPricePerQuintal * quantityQuintal)} शुद्ध है।`
                      )}
                    </p>
                  )}
                  {saarthiPrice.transportMatch?.transporter.contactPhone && (
                    <a
                      href={`tel:${saarthiPrice.transportMatch.transporter.contactPhone}`}
                      className="inline-flex mt-1 min-h-[40px] px-4 rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                    >
                      <Phone className="w-4 h-4" /> {tt('Call this driver', 'इस ड्राइवर को कॉल करें')}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  {saarthiPrice?.note ?? tt('Not enough data to calculate yet.', 'अभी गणना के लिए पर्याप्त डेटा नहीं है।')}
                </p>
              )}
            </Card>
          )}

          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-400 px-1">
              {tt('Sarthi Network Buyers', 'सारथी नेटवर्क खरीदार')}
            </h2>
            {comparison.offers.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No buyers listed yet for this crop in your district.', 'आपके ज़िले में इस फसल के लिए अभी कोई खरीदार सूचीबद्ध नहीं है।')}
              </Card>
            ) : (
              comparison.offers.map((offer) => (
                <Card key={offer.buyer.id} className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[var(--sarthi-on-background)]">{offer.buyer.businessName}</h3>
                        {offer.buyer.verified && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            <BadgeCheck className="w-3 h-3" /> {tt('Verified', 'सत्यापित')}
                          </span>
                        )}
                        {offer.buyer.isDemoSeed && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            {tt('Demo · not real', 'डेमो · असली नहीं')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {isHi ? BUYER_TYPE_LABEL[offer.buyer.buyerType].hi : BUYER_TYPE_LABEL[offer.buyer.buyerType].en} ·{' '}
                        {offer.buyer.district}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">₹{offer.offerPricePerQuintal}</p>
                      {offer.vsGovtPercent !== null && (
                        <p className={`text-[11px] font-bold ${offer.vsGovtPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {offer.vsGovtPercent >= 0 ? '+' : ''}
                          {offer.vsGovtPercent}% {tt('vs govt', 'सरकारी से')}
                        </p>
                      )}
                    </div>
                  </div>
                  {offer.distanceKm !== null && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> ~{Math.round(offer.distanceKm)} km ({tt('straight-line', 'सीधी दूरी')})
                    </p>
                  )}
                  <div className="flex gap-2">
                    {offer.buyer.contactPhone ? (
                      <a
                        href={`tel:${offer.buyer.contactPhone}`}
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Phone className="w-4 h-4" /> {tt('Call', 'कॉल करें')}
                      </a>
                    ) : (
                      <span className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                        {tt('No contact (demo)', 'संपर्क नहीं (डेमो)')}
                      </span>
                    )}
                    {offer.buyer.lat != null && offer.buyer.lng != null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${offer.buyer.lat},${offer.buyer.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Navigation2 className="w-4 h-4" /> {tt('Navigate', 'रास्ता')}
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* OpenStreetMap — real restaurants/dhabas nearby, never a fabricated price */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 px-1 flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              {tt('Restaurants & Dhabas Nearby (via OpenStreetMap)', 'आस-पास के रेस्टोरेंट और ढाबे (OpenStreetMap से)')}
            </h2>
            {nearbyPlaces.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No restaurants found nearby.', 'आस-पास कोई रेस्टोरेंट नहीं मिला।')}
              </Card>
            ) : (
              nearbyPlaces.map((p) => (
                <Card key={p.placeId} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-[var(--sarthi-on-background)]">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.address}</p>
                    </div>
                    {p.rating !== null && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" /> {p.rating} ({p.userRatingsTotal})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 italic">{tt('Contact to ask if they buy fresh produce directly.', 'सीधे ताज़ा उपज खरीदते हैं या नहीं, पूछने के लिए संपर्क करें।')}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                  >
                    <Navigation2 className="w-4 h-4" /> {tt('Navigate', 'रास्ता')}
                  </a>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <button
        onClick={() => setShowOnboarding(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      >
        <Handshake className="w-5 h-5" />
        {tt('Are you a trader, restaurant, or mall? Partner with Sarthi', 'क्या आप व्यापारी, रेस्टोरेंट या मॉल हैं? सारथी से जुड़ें')}
      </button>

      {showOnboarding && (
        <BuyerOnboardingForm
          onClose={() => setShowOnboarding(false)}
          onRegistered={() => {
            if (hasSearched) runDiscovery(cropKey, quantityQuintal);
          }}
        />
      )}
    </div>
  );
};
