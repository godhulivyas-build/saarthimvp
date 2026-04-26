import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import { useV2Session } from '../state/v2Session';
import LanguageSelector from './LanguageSelector';
import type { ProduceItem, PickupRequest, BuyerDemand } from '../types';
import type { MandiPrice } from '../services/mandiPriceService';
import type { WeatherData } from '../services/weatherService';
import {
  listProduce, addProduce, requestPickup,
  listPickupRequests, listBuyerDemands, placeOrder,
} from '../services/mvpDataService';
import { getWeather } from '../services/weatherService';
import { getMandiPrices } from '../services/mandiPriceService';
import { nearbyBuyers } from '../services/nearbyBuyersMock';
import { computeMoistureImpact } from '../services/moisturePriceModel';

type View = 'home' | 'book' | 'crops' | 'prices' | 'weather';
type DestType = 'mandi' | 'buyer' | 'custom';
type ProductUnit = 'kg' | 'quintal' | 'ton';
type ReturnCargoType = 'Fertilizer' | 'Seeds' | 'Pesticide' | 'Equipment' | 'Other';

const MP_MANDIS = [
  { name: 'Indore Mandi', km: 15 },
  { name: 'Bhopal Mandi', km: 75 },
  { name: 'Ujjain Mandi', km: 55 },
  { name: 'Ratlam Mandi', km: 90 },
  { name: 'Dewas Mandi', km: 35 },
];

const weatherIconMap: Record<string, string> = {
  '01d': 'sunny', '01n': 'nights_stay',
  '02d': 'partly_cloudy_day', '02n': 'partly_cloudy_night',
  '03d': 'cloud', '03n': 'cloud',
  '04d': 'cloud', '04n': 'cloud',
  '09d': 'rainy', '09n': 'rainy',
  '10d': 'rainy', '10n': 'rainy',
  '11d': 'thunderstorm', '11n': 'thunderstorm',
  '50d': 'foggy', '50n': 'foggy',
};
const getWeatherIcon = (icon: string) => weatherIconMap[icon] || 'cloud';

function computeSoilMoisture(humidity: number, rainfall: number): number {
  return Math.round(Math.min(38, humidity * 0.25 + Math.min(8, rainfall * 1.5)));
}

type MoistureBand = { label: string; labelHi: string; color: string; emoji: string };
function getMoistureBand(pct: number): MoistureBand {
  if (pct < 12) return { label: 'Dry', labelHi: 'शुष्क', color: 'text-amber-700', emoji: '✅' };
  if (pct < 20) return { label: 'Normal', labelHi: 'सामान्य', color: 'text-emerald-700', emoji: '✅' };
  if (pct < 28) return { label: 'Humid', labelHi: 'नम', color: 'text-yellow-700', emoji: '⚠️' };
  return { label: 'Wet', labelHi: 'गीला', color: 'text-red-700', emoji: '🔴' };
}

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang } = useI18n();
  const { session } = useV2Session();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => (isHi ? hi : en);

  const farmerName = session.name || 'Ramesh Kumar';
  const farmerLocation = session.addressLabel || 'Indore, MP';
  const lat = session.lat ?? 22.7196;
  const lng = session.lng ?? 75.8577;

  const [view, setView] = useState<View>('home');

  // Data state
  const [produceItems, setProduceItems] = useState<ProduceItem[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemand[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [loadingProduce, setLoadingProduce] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Booking form state
  const [destType, setDestType] = useState<DestType>('mandi');
  const [selectedMandi, setSelectedMandi] = useState(MP_MANDIS[0].name);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [pickup, setPickup] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<ProductUnit>('quintal');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [returnCargoType, setReturnCargoType] = useState<ReturnCargoType>('Fertilizer');
  const [returnCargoQty, setReturnCargoQty] = useState('');
  const [bookingStep, setBookingStep] = useState<'form' | 'options' | 'confirmed'>('form');
  const [confirmedId, setConfirmedId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Crops form state
  const [showListForm, setShowListForm] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState<ProductUnit>('quintal');
  const [newPrice, setNewPrice] = useState('');
  const [listingLoading, setListingLoading] = useState(false);
  const [newMinPrice, setNewMinPrice] = useState('');
  const [minPricesMap, setMinPricesMap] = useState<Record<string, number>>({});

  // Transport sharing
  const [shareTransport, setShareTransport] = useState(false);
  const [coFarmerName, setCoFarmerName] = useState('');
  const [numSharers, setNumSharers] = useState<2 | 3 | 4>(2);

  // Negotiation
  const [negotiationActions, setNegotiationActions] = useState<Record<string, 'accepted' | 'rejected' | 'countered'>>({});

  const refreshData = useCallback(async () => {
    setLoadingProduce(true);
    const [produce, requests, demands] = await Promise.all([
      listProduce(),
      listPickupRequests(),
      listBuyerDemands(),
    ]);
    setProduceItems(produce);
    setPickupRequests(requests);
    setBuyerDemands(demands);
    setLoadingProduce(false);
  }, []);

  useEffect(() => {
    refreshData();
    setLoadingWeather(true);
    getWeather(lat, lng, farmerLocation).then(w => { setWeather(w); setLoadingWeather(false); });
    setLoadingPrices(true);
    getMandiPrices().then(p => { setMandiPrices(p); setLoadingPrices(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => { logout(); navigate('/'); };

  const getDropLocation = (): string => {
    if (destType === 'mandi') return selectedMandi;
    if (destType === 'buyer') {
      const b = nearbyBuyers.find(x => x.id === selectedBuyerId);
      return b ? b.name : '';
    }
    return customDest;
  };

  const handleConfirmBooking = async (optionFare: number) => {
    setBookingLoading(true);
    const dropLocation = getDropLocation();
    try {
      const matched = produceItems.find(p => p.crop.toLowerCase().includes(cropInput.toLowerCase()));
      let produceId: string;
      if (matched) {
        produceId = matched.id;
      } else {
        const created = await addProduce({
          farmerName,
          farmerLocation: pickup || farmerLocation,
          crop: cropInput || 'Crop',
          quantity: Number(qty) || 1,
          unit,
          pricePerUnit: 0,
        });
        produceId = created.id;
      }
      const req = await requestPickup({
        produceId,
        farmerName,
        pickupLocation: pickup || farmerLocation,
        dropLocation,
        quantity: Number(qty) || 1,
        unit,
        estimatedFareInr: optionFare,
      });
      setConfirmedId(req.id);
      setBookingStep('confirmed');
      refreshData();
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddListing = async () => {
    if (!newCropName || !newQty || !newPrice) return;
    setListingLoading(true);
    try {
      const created = await addProduce({
        farmerName,
        farmerLocation,
        crop: newCropName,
        quantity: Number(newQty),
        unit: newUnit,
        pricePerUnit: Number(newPrice),
      });
      if (newMinPrice && Number(newMinPrice) > 0) {
        setMinPricesMap(prev => ({ ...prev, [created.id]: Number(newMinPrice) }));
      }
      setShowListForm(false);
      setNewCropName('');
      setNewQty('');
      setNewPrice('');
      setNewMinPrice('');
      await refreshData();
    } finally {
      setListingLoading(false);
    }
  };

  const handleAcceptDemand = async (demand: BuyerDemand) => {
    const produce = produceItems.find(p => p.crop.toLowerCase() === demand.crop.toLowerCase());
    if (!produce) return;
    try {
      await placeOrder({
        produceId: produce.id,
        buyerName: demand.buyerName,
        buyerLocation: demand.buyerLocation,
        quantity: Math.min(demand.quantity, produce.quantity),
      });
      setNegotiationActions(prev => ({ ...prev, [demand.id]: 'accepted' }));
      refreshData();
    } catch { /* ignore */ }
  };

  // Derived data
  const soilMoisture = weather ? computeSoilMoisture(weather.humidity, weather.rainfall) : null;
  const moistureBand = soilMoisture !== null ? getMoistureBand(soilMoisture) : null;
  const activeTrips = pickupRequests.filter(r => r.status !== 'delivered' && r.status !== 'cancelled');
  const farmerCrops = new Set(produceItems.map(p => p.crop.toLowerCase()));
  const matchingDemands = buyerDemands.filter(d => farmerCrops.has(d.crop.toLowerCase()) && !negotiationActions[d.id]);

  const navItems: { id: View; icon: string; label: string }[] = [
    { id: 'home', icon: 'home', label: tUI('Home', 'होम') },
    { id: 'book', icon: 'local_shipping', label: tUI('Book', 'बुक') },
    { id: 'crops', icon: 'grass', label: tUI('Crops', 'फसल') },
    { id: 'prices', icon: 'trending_up', label: tUI('Rates', 'दाम') },
    { id: 'weather', icon: 'cloud', label: tUI('Weather', 'मौसम') },
  ];

  const returnCargoOptions: ReturnCargoType[] = ['Fertilizer', 'Seeds', 'Pesticide', 'Equipment', 'Other'];
  const returnCargoHi: Record<ReturnCargoType, string> = {
    Fertilizer: 'उर्वरक', Seeds: 'बीज', Pesticide: 'कीटनाशक', Equipment: 'उपकरण', Other: 'अन्य',
  };

  // Sidebar nav button
  const SidebarNavBtn = ({ item }: { item: typeof navItems[number] }) => (
    <button
      onClick={() => setView(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
        view === item.id
          ? 'bg-amber-600 text-white shadow-md'
          : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
      }`}
    >
      <span
        className="material-symbols-outlined text-[22px]"
        style={{ fontVariationSettings: view === item.id ? "'FILL' 1" : "'FILL' 0" }}
      >
        {item.icon}
      </span>
      {item.label}
    </button>
  );

  // -------- Shared UI pieces --------

  // Mandi ticker strip
  const MandiTicker = () => (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-1" style={{ minWidth: 'max-content' }}>
        {mandiPrices.slice(0, 6).map(p => {
          const prev = p.modalPrice * (1 + (Math.random() > 0.5 ? 1 : -1) * 0.02);
          const up = p.modalPrice >= prev;
          return (
            <div
              key={p.crop}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 shrink-0"
            >
              <span className="font-bold text-stone-800 text-sm">{isHi ? p.cropHi : p.crop}</span>
              <span className="font-black text-amber-700">₹{p.modalPrice.toLocaleString()}</span>
              <span
                className={`material-symbols-outlined text-[16px] ${up ? 'text-emerald-600' : 'text-red-500'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {up ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Weather + Soil Moisture card
  const WeatherMoistureCard = ({ compact = false }: { compact?: boolean }) => {
    if (loadingWeather) {
      return (
        <div className="flex items-center justify-center py-10">
          <span className="material-symbols-outlined animate-spin text-[40px] text-amber-600">refresh</span>
        </div>
      );
    }
    if (!weather) return null;
    const sm = computeSoilMoisture(weather.humidity, weather.rainfall);
    const band = getMoistureBand(sm);
    const impactCrops = produceItems.slice(0, 3).map(prod => computeMoistureImpact(prod.crop, sm));

    return (
      <div className="space-y-4">
        {/* Main weather panel */}
        <div className="bg-gradient-to-br from-amber-700 to-stone-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-amber-300 text-sm font-semibold">{farmerLocation}</p>
              <p className="text-5xl font-black leading-none mt-1">{weather.temp}°C</p>
              <p className="text-amber-100 mt-2 font-medium">{isHi ? weather.descriptionHi : weather.description}</p>
            </div>
            <span
              className="material-symbols-outlined text-[64px] text-amber-300/60"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {getWeatherIcon(weather.icon)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'water_drop', val: `${weather.humidity}%`, label: tUI('Humidity', 'नमी') },
              { icon: 'air', val: `${weather.windSpeed} km/h`, label: tUI('Wind', 'हवा') },
              { icon: 'rainy', val: `${weather.rainfall} mm`, label: tUI('Rainfall', 'बारिश') },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <span className="material-symbols-outlined text-amber-200 text-[20px] block mb-1">{s.icon}</span>
                <p className="text-lg font-black">{s.val}</p>
                <p className="text-xs text-amber-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Soil moisture card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="font-extrabold text-stone-800 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              humidity_percentage
            </span>
            {tUI('Soil Moisture Estimate', 'मिट्टी नमी अनुमान')}
          </h3>
          <div className="flex items-center gap-5 mb-4">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-300 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black text-amber-700">{sm}%</span>
              <span className="text-[10px] text-stone-500 font-semibold uppercase">moisture</span>
            </div>
            <div>
              <p className={`text-lg font-black ${band.color}`}>
                {band.emoji} {isHi ? band.labelHi : band.label}
              </p>
              <p className="text-sm text-stone-500 mt-1">
                {sm < 12 && tUI('Good for harvest and transport', 'कटाई और परिवहन के लिए ठीक')}
                {sm >= 12 && sm < 20 && tUI('Normal moisture level, good to go', 'सामान्य नमी, ठीक है')}
                {sm >= 20 && sm < 28 && tUI('High moisture – check produce before sale', 'अधिक नमी – बिक्री से पहले जांचें')}
                {sm >= 28 && tUI('Very wet – possible price deductions at mandi', 'बहुत गीला – मंडी में कटौती हो सकती है')}
              </p>
            </div>
          </div>

          {/* Moisture scale */}
          <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-200 via-emerald-300 via-yellow-300 to-red-400 mb-1">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-stone-700 shadow"
              style={{ left: `${Math.min(96, (sm / 38) * 100)}%`, marginLeft: '-8px' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 font-semibold mb-4">
            <span>0%</span><span>12%</span><span>20%</span><span>28%</span><span>38%</span>
          </div>

          {/* Crop impact */}
          {!compact && impactCrops.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {tUI('Moisture Impact on Your Crops', 'आपकी फसल पर नमी का असर')}
              </p>
              <div className="space-y-2">
                {impactCrops.map(impact => (
                  <div key={impact.crop} className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-sm text-stone-700">{impact.crop}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      impact.band === 'low' ? 'bg-emerald-100 text-emerald-700' :
                      impact.band === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {impact.band === 'low'
                        ? tUI('Low Risk', 'कम जोखिम')
                        : impact.band === 'medium'
                        ? `${impact.impactPctRange.low}% to ${impact.impactPctRange.high}% ${tUI('deduct', 'कटौती')}`
                        : `${impact.impactPctRange.low}% to ${impact.impactPctRange.high}% ${tUI('HIGH risk', 'उच्च जोखिम')}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------- Views --------

  const HomeView = () => (
    <div className="space-y-6">
      {/* Profile hero */}
      <section className="bg-gradient-to-br from-amber-800 to-stone-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center gap-5 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-amber-700/60 flex items-center justify-center border-2 border-amber-500/50 shrink-0">
          <span
            className="material-symbols-outlined text-[36px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            agriculture
          </span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-black mb-1">
            {tUI(`Welcome, ${farmerName}!`, `नमस्ते, ${farmerName}!`)}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-amber-200/80 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              {farmerLocation}
            </span>
            {weather && !loadingWeather && (
              <span className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {getWeatherIcon(weather.icon)}
                </span>
                {weather.temp}°C · {isHi ? weather.descriptionHi : weather.description}
              </span>
            )}
            {soilMoisture !== null && moistureBand && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">humidity_percentage</span>
                {tUI('Soil', 'मिट्टी')}: {soilMoisture}% {moistureBand.emoji}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-white/15 rounded-2xl p-4 text-center min-w-[80px]">
            <p className="text-3xl font-black">{pickupRequests.length}</p>
            <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">{tUI('Trips', 'ट्रिप्स')}</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-4 text-center min-w-[80px]">
            <p className="text-3xl font-black text-amber-400">{produceItems.length}</p>
            <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">{tUI('Crops', 'फसल')}</p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'book' as View, icon: 'local_shipping', label: tUI('Book Transport', 'ट्रांसपोर्ट बुक'), bg: 'bg-amber-50 border-amber-200 hover:border-amber-400', icon_color: 'text-amber-700' },
          { id: 'crops' as View, icon: 'grass', label: tUI('My Crops', 'मेरी फसल'), bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', icon_color: 'text-emerald-700' },
          { id: 'prices' as View, icon: 'trending_up', label: tUI('Mandi Rates', 'मंडी दाम'), bg: 'bg-stone-50 border-stone-200 hover:border-stone-400', icon_color: 'text-stone-700' },
          { id: 'weather' as View, icon: 'cloud', label: tUI('Weather', 'मौसम'), bg: 'bg-sky-50 border-sky-200 hover:border-sky-400', icon_color: 'text-sky-700' },
        ].map(a => (
          <button
            key={a.id}
            onClick={() => setView(a.id)}
            className={`${a.bg} border rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all group`}
          >
            <span
              className={`material-symbols-outlined text-[36px] ${a.icon_color} group-hover:scale-110 transition-transform`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {a.icon}
            </span>
            <span className="font-bold text-sm text-center leading-tight text-stone-800">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Weather + Moisture quick widget */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-extrabold text-stone-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              wb_sunny
            </span>
            {tUI('Weather & Soil Moisture', 'मौसम और मिट्टी नमी')}
          </h2>
          <button
            onClick={() => setView('weather')}
            className="text-amber-700 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            {tUI('Details', 'विवरण')}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
        <div className="px-5 pb-5">
          <WeatherMoistureCard compact />
        </div>
      </section>

      {/* Mandi ticker */}
      {mandiPrices.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-stone-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
              {tUI("Today's Mandi Rates", 'आज के मंडी दाम')}
            </h2>
            <button
              onClick={() => setView('prices')}
              className="text-amber-700 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              {tUI('All Rates', 'सब दाम')}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          {loadingPrices ? (
            <div className="flex justify-center py-4">
              <span className="material-symbols-outlined animate-spin text-amber-600">refresh</span>
            </div>
          ) : (
            <MandiTicker />
          )}
        </section>
      )}

      {/* Nearby Buyers */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <h2 className="font-extrabold text-stone-800 flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
            store
          </span>
          {tUI('Nearby Buyers', 'पास के खरीदार')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nearbyBuyers.map(b => (
            <div
              key={b.id}
              className="bg-stone-50 border border-stone-200 rounded-xl p-4 hover:border-amber-400 transition-colors cursor-pointer"
              onClick={() => {
                setDestType('buyer');
                setSelectedBuyerId(b.id);
                setView('book');
              }}
            >
              <p className="font-extrabold text-stone-800 text-sm">{b.name}</p>
              <p className="text-xs text-stone-500 mb-2">
                {isHi ? b.typeHi : b.typeEn} · {isHi ? b.cropHi : b.cropEn} · {b.distanceKm} km
              </p>
              <p className="text-lg font-black text-amber-700">
                ₹{b.pricePerQuintal.toLocaleString()}
                <span className="text-xs font-normal text-stone-500 ml-1">/{tUI('qtl', 'क्विं')}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Active trips */}
      {activeTrips.length > 0 && (
        <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
          <h2 className="font-extrabold text-stone-800 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_shipping
            </span>
            {tUI('Active Transport', 'सक्रिय परिवहन')}
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeTrips.length}</span>
          </h2>
          <div className="space-y-2">
            {activeTrips.slice(0, 3).map(req => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200"
              >
                <div>
                  <p className="font-bold text-sm text-stone-800">{req.pickupLocation} → {req.dropLocation}</p>
                  <p className="text-xs text-stone-500">{req.quantity} {req.unit} · #{req.id.slice(-8).toUpperCase()}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  req.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                  req.status === 'in_transit' ? 'bg-amber-100 text-amber-700' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {req.status === 'requested' ? tUI('Finding Driver', 'ड्राइवर खोज') :
                   req.status === 'assigned' ? tUI('Assigned', 'मिला') :
                   req.status === 'in_transit' ? tUI('In Transit', 'रास्ते में') : req.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Buyer negotiations */}
      {matchingDemands.length > 0 && (
        <section className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <h2 className="font-extrabold text-stone-800 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              handshake
            </span>
            {tUI('Buyer Offers', 'खरीदार के प्रस्ताव')}
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{matchingDemands.length}</span>
          </h2>
          <div className="space-y-3">
            {matchingDemands.map(demand => (
              <div key={demand.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm text-stone-800">{demand.buyerName}</p>
                    <p className="text-xs text-stone-500">{demand.quantity} {demand.unit} {demand.crop}</p>
                    <p className="text-xs text-stone-400">{demand.buyerLocation} · {demand.deliveryWindow}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-amber-700">₹{demand.priceTarget.toLocaleString()}</p>
                    <p className="text-xs text-stone-400">/{demand.unit}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptDemand(demand)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition-colors active:scale-95"
                  >
                    {tUI('Accept', 'स्वीकार')}
                  </button>
                  <button
                    onClick={() => setNegotiationActions(prev => ({ ...prev, [demand.id]: 'rejected' }))}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg text-sm transition-colors"
                  >
                    {tUI('Decline', 'अस्वीकार')}
                  </button>
                  <button
                    onClick={() => setNegotiationActions(prev => ({ ...prev, [demand.id]: 'countered' }))}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 rounded-lg text-sm transition-colors"
                  >
                    {tUI('Counter', 'काउंटर')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const BookView = () => {
    const dropLocation = getDropLocation();
    const isMoistureWarn = soilMoisture !== null && soilMoisture > 20;

    return (
      <section className="space-y-6">
        <div className="bg-gradient-to-br from-amber-800 to-stone-900 rounded-3xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
            <span className="material-symbols-outlined text-[180px]">local_shipping</span>
          </div>
          <div className="relative z-10">
            {bookingStep === 'form' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-600/40 p-3 rounded-2xl">
                    <span className="material-symbols-outlined text-[32px]">local_shipping</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold">{tUI('Book Transport', 'ट्रांसपोर्ट बुक करें')}</h2>
                    <p className="text-amber-200 text-sm">{tUI('Get your produce to market fast & fair.', 'अपनी फसल सही दाम पर मंडी तक पहुंचाएं।')}</p>
                  </div>
                </div>

                {/* Moisture warning */}
                {isMoistureWarn && (
                  <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3 mb-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-yellow-300 text-[22px] shrink-0 mt-0.5">warning</span>
                    <p className="text-yellow-200 text-sm font-medium">
                      {tUI(
                        `Soil moisture is high (${soilMoisture}%). Buyers may apply quality deductions. Dry produce before transport if possible.`,
                        `मिट्टी की नमी अधिक है (${soilMoisture}%)। खरीदार गुणवत्ता में कटौती कर सकते हैं। संभव हो तो परिवहन से पहले सुखाएं।`
                      )}
                    </p>
                  </div>
                )}

                {/* Destination type selector */}
                <div className="mb-5">
                  <label className="text-amber-200 text-sm font-bold block mb-2">
                    {tUI('Destination Type', 'मंज़िल का प्रकार')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['mandi', 'buyer', 'custom'] as DestType[]).map(dt => (
                      <button
                        key={dt}
                        onClick={() => setDestType(dt)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          destType === dt
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-white/10 text-amber-100 hover:bg-white/20'
                        }`}
                      >
                        {dt === 'mandi' ? tUI('Mandi', 'मंडी') :
                         dt === 'buyer' ? tUI('Buyer', 'खरीदार') :
                         tUI('Custom', 'कस्टम')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination input based on type */}
                <div className="mb-5">
                  {destType === 'mandi' && (
                    <div>
                      <label className="text-amber-200 text-sm font-bold block mb-2">
                        {tUI('Select Mandi', 'मंडी चुनें')}
                      </label>
                      <select
                        value={selectedMandi}
                        onChange={e => setSelectedMandi(e.target.value)}
                        className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                      >
                        {MP_MANDIS.map(m => (
                          <option key={m.name} value={m.name} className="bg-stone-900 text-white">
                            {m.name} ({m.km} km)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {destType === 'buyer' && (
                    <div>
                      <label className="text-amber-200 text-sm font-bold block mb-2">
                        {tUI('Select Buyer', 'खरीदार चुनें')}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {nearbyBuyers.map(b => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBuyerId(b.id)}
                            className={`rounded-xl p-4 text-left transition-all border-2 ${
                              selectedBuyerId === b.id
                                ? 'bg-amber-500/30 border-amber-400'
                                : 'bg-white/10 border-transparent hover:bg-white/20'
                            }`}
                          >
                            <p className="font-extrabold text-sm">{b.name}</p>
                            <p className="text-amber-200 text-xs mt-0.5">
                              {isHi ? b.cropHi : b.cropEn} · {b.distanceKm} km
                            </p>
                            <p className="text-amber-400 font-black mt-1">₹{b.pricePerQuintal.toLocaleString()}/qtl</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {destType === 'custom' && (
                    <div>
                      <label className="text-amber-200 text-sm font-bold block mb-2">
                        {tUI('Enter Destination', 'मंज़िल दर्ज करें')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-amber-400 text-[20px]">
                          location_on
                        </span>
                        <input
                          value={customDest}
                          onChange={e => setCustomDest(e.target.value)}
                          placeholder={tUI('Warehouse, storage or address...', 'गोदाम, भंडार या पता...')}
                          className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-amber-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pickup location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-amber-200 text-sm font-bold">{tUI('Pickup Location', 'पिकअप स्थान')}</label>
                      <button
                        onClick={() => setPickup(farmerLocation)}
                        className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:text-amber-300"
                      >
                        <span className="material-symbols-outlined text-[14px]">my_location</span>
                        {tUI('Use GPS', 'GPS')}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-amber-400 text-[20px]">
                        my_location
                      </span>
                      <input
                        value={pickup}
                        onChange={e => setPickup(e.target.value)}
                        placeholder={tUI('Farm location...', 'खेत का स्थान...')}
                        className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-amber-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2">{tUI('Crop Type', 'फसल')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-amber-400 text-[20px]">
                        grass
                      </span>
                      <input
                        value={cropInput}
                        onChange={e => setCropInput(e.target.value)}
                        placeholder={tUI('e.g. Wheat, Soybean', 'उदा. गेहूं, सोयाबीन')}
                        className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-amber-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Qty + unit */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1">
                    <label className="block text-amber-200 text-sm font-bold mb-2">{tUI('Quantity', 'मात्रा')}</label>
                    <input
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      type="number"
                      placeholder="0"
                      className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-3 px-4 text-white placeholder-amber-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-200 text-sm font-bold mb-2">{tUI('Unit', 'इकाई')}</label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value as ProductUnit)}
                      className="bg-white/10 border border-amber-500/30 rounded-xl py-3 px-3 text-white focus:outline-none font-medium"
                      style={{ height: '50px' }}
                    >
                      <option value="quintal" className="bg-stone-900">{tUI('Quintal', 'क्विंटल')}</option>
                      <option value="kg" className="bg-stone-900">KG</option>
                      <option value="ton" className="bg-stone-900">{tUI('Ton', 'टन')}</option>
                    </select>
                  </div>
                </div>

                {/* Round trip toggle */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                    <div
                      onClick={() => setIsRoundTrip(v => !v)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        isRoundTrip ? 'bg-amber-500 border-amber-500' : 'border-amber-500/50 bg-white/10'
                      }`}
                    >
                      {isRoundTrip && (
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold">{tUI('Round Trip', 'वापसी यात्रा')}</span>
                      <span className="block text-xs text-amber-300/80">
                        {tUI('Bring inputs on return journey', 'वापसी में उर्वरक/बीज लाएं')}
                      </span>
                    </div>
                  </label>

                  {/* Return cargo */}
                  {isRoundTrip && (
                    <div className="mt-4 bg-white/10 rounded-xl p-4 border border-amber-400/30 space-y-3 animate-in fade-in duration-200">
                      <p className="text-sm font-bold text-amber-200">{tUI('Return Cargo Details', 'वापसी माल विवरण')}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-amber-300 text-xs font-bold block mb-1">{tUI('Cargo Type', 'माल का प्रकार')}</label>
                          <select
                            value={returnCargoType}
                            onChange={e => setReturnCargoType(e.target.value as ReturnCargoType)}
                            className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-2.5 px-3 text-white focus:outline-none font-medium text-sm"
                          >
                            {returnCargoOptions.map(opt => (
                              <option key={opt} value={opt} className="bg-stone-900">
                                {isHi ? returnCargoHi[opt] : opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-amber-300 text-xs font-bold block mb-1">{tUI('Return Qty (bags)', 'वापसी मात्रा (बैग)')}</label>
                          <input
                            value={returnCargoQty}
                            onChange={e => setReturnCargoQty(e.target.value)}
                            type="number"
                            placeholder="0"
                            className="w-full bg-white/10 border border-amber-500/30 rounded-xl py-2.5 px-3 text-white placeholder-amber-300/50 focus:outline-none font-medium text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transport Sharing */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                    <div
                      onClick={() => setShareTransport(v => !v)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        shareTransport ? 'bg-emerald-500 border-emerald-500' : 'border-amber-500/50 bg-white/10'
                      }`}
                    >
                      {shareTransport && <span className="material-symbols-outlined text-white text-sm">check</span>}
                    </div>
                    <div>
                      <span className="text-sm font-bold">🤝 {tUI('Share Transport — Pay Less!', 'ट्रांसपोर्ट शेयर — कम पैसे!')}</span>
                      <span className="block text-xs text-amber-300/80">
                        {tUI('2+ farmers from same village share one vehicle', 'एक ही गांव के 2+ किसान एक गाड़ी शेयर करें')}
                      </span>
                    </div>
                  </label>

                  {shareTransport && (
                    <div className="mt-4 bg-emerald-900/30 border border-emerald-400/30 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-emerald-200">
                        {tUI('Sharing Details', 'शेयरिंग विवरण')}
                      </p>
                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          {tUI('Number of Farmers Sharing', 'कितने किसान शेयर करेंगे')}
                        </label>
                        <div className="flex gap-2">
                          {([2, 3, 4] as const).map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNumSharers(n)}
                              className={`flex-1 py-3 rounded-xl font-black text-lg transition-all ${
                                numSharers === n
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                              }`}
                            >
                              {n} 👨‍🌾
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          {tUI('Co-farmer Name (same village)', 'साथी किसान का नाम (एक ही गांव)')}
                        </label>
                        <input
                          value={coFarmerName}
                          onChange={e => setCoFarmerName(e.target.value)}
                          placeholder={tUI('e.g. Suresh Patel', 'उदा. सुरेश पटेल')}
                          className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 px-4 text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium text-base"
                        />
                      </div>
                      <div className="bg-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <p className="text-emerald-200 text-sm font-semibold">
                          {tUI(
                            `Each farmer pays only 1/${numSharers} of the fare! Save up to ${Math.round((1 - 1/numSharers)*100)}%.`,
                            `हर किसान केवल 1/${numSharers} हिस्सा देगा! ${Math.round((1 - 1/numSharers)*100)}% तक बचत!`
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const destValid =
                      (destType === 'mandi' && selectedMandi) ||
                      (destType === 'buyer' && selectedBuyerId) ||
                      (destType === 'custom' && customDest.trim());
                    if (!cropInput || !qty || !destValid) {
                      alert(tUI('Please fill all required fields.', 'कृपया सभी आवश्यक फ़ील्ड भरें।'));
                      return;
                    }
                    setBookingStep('options');
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xl py-5 px-8 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-[28px]">search</span>
                  {tUI('Find Transport Options', 'ट्रांसपोर्ट विकल्प खोजें')}
                </button>
              </>
            )}

            {bookingStep === 'options' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setBookingStep('form')}
                    className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-2xl font-extrabold">{tUI('Transport Options', 'परिवहन विकल्प')}</h2>
                    <p className="text-amber-200 text-sm">
                      {cropInput} · {qty} {unit} · {pickup || farmerLocation} → {dropLocation}
                      {isRoundTrip && returnCargoQty
                        ? ` · ${tUI('Return', 'वापसी')}: ${returnCargoQty} ${tUI('bags', 'बैग')} ${isHi ? returnCargoHi[returnCargoType] : returnCargoType}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: 'local_shipping',
                      label: tUI('Mini Truck (1–2 Tons)', 'छोटा ट्रक (1–2 टन)'),
                      sub: tUI('Arrives in ~45 min · 4.8★', '~45 मिनट में · 4.8★'),
                      fare: isRoundTrip ? 1600 : 1200,
                      orig: isRoundTrip ? 2000 : 1500,
                    },
                    {
                      icon: 'fire_truck',
                      label: tUI('Large Shared Truck', 'बड़ा साझा ट्रक'),
                      sub: tUI('Arrives in ~2 hrs · Cost effective', '~2 घंटे में · किफायती'),
                      fare: isRoundTrip ? 900 : 700,
                      orig: null,
                    },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className="bg-white/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-stone-900/60 p-3 rounded-xl">
                          <span className="material-symbols-outlined text-[32px] text-amber-400">{opt.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{opt.label}</h4>
                          <p className="text-sm text-amber-200">{opt.sub}</p>
                          {isRoundTrip && (
                            <p className="text-xs text-amber-300 mt-0.5">
                              {tUI('Includes return cargo', 'वापसी माल शामिल')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        {shareTransport ? (
                          <div className="text-right">
                            <div className="text-xs text-amber-300 line-through">₹{opt.fare.toLocaleString()} {tUI('full', 'पूरा')}</div>
                            <div className="text-2xl font-black text-emerald-400">
                              ₹{Math.round(opt.fare / numSharers).toLocaleString()}
                            </div>
                            <div className="text-xs text-emerald-300 font-semibold">
                              {tUI(`per farmer (÷${numSharers})`, `प्रति किसान (÷${numSharers})`)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-2xl font-black text-amber-400">₹{opt.fare.toLocaleString()}</div>
                            {opt.orig && <div className="text-xs text-amber-300 line-through">₹{opt.orig.toLocaleString()}</div>}
                          </div>
                        )}
                        <button
                          onClick={() => handleConfirmBooking(shareTransport ? Math.round(opt.fare / numSharers) : opt.fare)}
                          disabled={bookingLoading}
                          className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-black py-4 px-7 rounded-xl transition-colors active:scale-95 disabled:opacity-60 shrink-0 flex items-center gap-2 text-base"
                        >
                          {bookingLoading && (
                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                          )}
                          {bookingLoading ? tUI('Booking...', 'बुक हो रहा...') : tUI('Book Now', 'अभी बुक करें')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'confirmed' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                  <span
                    className="material-symbols-outlined text-stone-900 text-[48px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <h2 className="text-3xl font-black mb-2">{tUI('Booking Confirmed!', 'बुकिंग पक्की हो गई!')}</h2>
                <p className="text-amber-200 mb-6">
                  {tUI('Transport request live. Drivers notified.', 'अनुरोध भेज दिया गया। ड्राइवरों को सूचित किया गया।')}
                </p>
                <div className="bg-stone-900/50 border border-amber-500/30 rounded-2xl p-6 max-w-sm mx-auto mb-8">
                  <div className="text-sm text-amber-300 font-bold mb-1">{tUI('Tracking ID', 'ट्रैकिंग आईडी')}</div>
                  <div className="text-xl font-black text-amber-400 tracking-widest mb-2">
                    #{confirmedId.slice(-10).toUpperCase()}
                  </div>
                  <div className="text-sm text-amber-300">
                    {pickup || farmerLocation} → {dropLocation}
                  </div>
                  <div className="text-sm text-amber-300 mt-1">{cropInput} · {qty} {unit}</div>
                  {isRoundTrip && returnCargoQty && (
                    <div className="text-sm text-amber-300 mt-1">
                      {tUI('Return', 'वापसी')}: {returnCargoQty} {tUI('bags', 'बैग')} {isHi ? returnCargoHi[returnCargoType] : returnCargoType}
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setView('home')}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    {tUI('Back to Home', 'होम पर जाएं')}
                  </button>
                  <button
                    onClick={() => {
                      setBookingStep('form');
                      setPickup('');
                      setCropInput('');
                      setQty('');
                      setCustomDest('');
                      setReturnCargoQty('');
                      setIsRoundTrip(false);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    {tUI('Book Another', 'और बुक करें')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const CropsView = () => (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-800">{tUI('My Crop Listings', 'मेरी फसल लिस्टिंग')}</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {tUI('Manage listings and respond to buyer offers.', 'लिस्टिंग प्रबंधित करें और प्रस्तावों का जवाब दें।')}
          </p>
        </div>
        <button
          onClick={() => setShowListForm(true)}
          className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-95 flex items-center gap-2 text-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {tUI('Add Crop', 'फसल जोड़ें')}
        </button>
      </div>

      {showListForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-400 shadow-md">
          <h3 className="font-extrabold text-lg text-stone-800 mb-5">
            {tUI('List New Crop for Sale', 'नई फसल बिक्री के लिए लिस्ट करें')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-stone-500 block mb-1 uppercase tracking-wider">
                {tUI('Crop Name', 'फसल का नाम')}
              </label>
              <input
                value={newCropName}
                onChange={e => setNewCropName(e.target.value)}
                placeholder={tUI('e.g. Wheat, Soybean', 'उदा. गेहूं, सोयाबीन')}
                className="w-full border-2 border-stone-200 rounded-xl py-2.5 px-4 focus:border-amber-500 focus:outline-none font-medium text-stone-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1 uppercase tracking-wider">
                {tUI('Quantity', 'मात्रा')}
              </label>
              <input
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full border-2 border-stone-200 rounded-xl py-2.5 px-4 focus:border-amber-500 focus:outline-none font-medium text-stone-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1 uppercase tracking-wider">
                {tUI('Unit', 'इकाई')}
              </label>
              <select
                value={newUnit}
                onChange={e => setNewUnit(e.target.value as ProductUnit)}
                className="w-full border-2 border-stone-200 rounded-xl py-2.5 px-4 focus:border-amber-500 focus:outline-none font-medium text-stone-800"
                style={{ height: '46px' }}
              >
                <option value="quintal">{tUI('Quintal', 'क्विंटल')}</option>
                <option value="kg">KG</option>
                <option value="ton">{tUI('Ton', 'टन')}</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-stone-500 block mb-1 uppercase tracking-wider">
                {tUI('Price per Unit (₹)', 'प्रति इकाई दाम (₹)')}
              </label>
              <input
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                type="number"
                placeholder="₹ 0"
                className="w-full border-2 border-stone-200 rounded-xl py-2.5 px-4 focus:border-amber-500 focus:outline-none font-medium text-stone-800"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddListing}
              disabled={listingLoading || !newCropName || !newQty || !newPrice}
              className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {listingLoading ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
              {tUI('Publish Listing', 'लिस्टिंग प्रकाशित करें')}
            </button>
            <button
              onClick={() => setShowListForm(false)}
              className="bg-stone-100 text-stone-700 font-bold py-2.5 px-6 rounded-xl hover:bg-stone-200 transition-colors"
            >
              {tUI('Cancel', 'रद्द करें')}
            </button>
          </div>
        </div>
      )}

      {loadingProduce ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] animate-spin text-amber-600">refresh</span>
        </div>
      ) : produceItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <span
            className="material-symbols-outlined text-[64px] text-stone-300 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            grass
          </span>
          <p className="font-bold text-stone-400">
            {tUI('No listings yet. Add your first crop!', 'अभी कोई लिस्टिंग नहीं।')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {produceItems.map(item => {
            const sm2 = weather ? computeSoilMoisture(weather.humidity, weather.rainfall) : null;
            const impact = sm2 !== null ? computeMoistureImpact(item.crop, sm2) : null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <span
                        className="material-symbols-outlined text-amber-700 text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        grass
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-stone-800">{item.crop}</h3>
                      <p className="text-xs text-stone-500">{item.farmerName} · {item.farmerLocation}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {tUI('Active', 'सक्रिय')}
                    </span>
                    {impact && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        impact.band === 'low' ? 'bg-emerald-50 text-emerald-700' :
                        impact.band === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {impact.band === 'low'
                          ? tUI('Low Moisture Risk', 'कम नमी जोखिम')
                          : impact.band === 'medium'
                          ? tUI('Medium Moisture Risk', 'मध्यम नमी जोखिम')
                          : tUI('High Moisture Risk', 'उच्च नमी जोखिम')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-stone-50 p-2.5 rounded-xl text-center">
                    <p className="text-base font-black text-amber-700">₹{item.pricePerUnit.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-500 uppercase">/{item.unit}</p>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl text-center">
                    <p className="text-base font-black text-stone-800">{item.quantity}</p>
                    <p className="text-[10px] text-stone-500 uppercase">{item.unit}</p>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl text-center">
                    <p className="text-base font-black text-stone-800">
                      ₹{(item.pricePerUnit * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500 uppercase">{tUI('Total', 'कुल')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCropInput(item.crop);
                    setPickup(item.farmerLocation);
                    setQty(String(item.quantity));
                    setUnit(item.unit as ProductUnit);
                    setView('book');
                  }}
                  className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  {tUI('Book Transport for This Crop', 'इस फसल के लिए ट्रांसपोर्ट बुक करें')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const PricesView = () => (
    <section>
      <h2 className="text-2xl font-extrabold text-stone-800 mb-1">{tUI('Mandi Prices Today', 'आज के मंडी दाम')}</h2>
      <p className="text-stone-500 text-sm mb-6">
        {tUI('Live rates from Madhya Pradesh mandis', 'मध्य प्रदेश मंडियों के दाम')}
      </p>
      {loadingPrices ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] animate-spin text-amber-600">refresh</span>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
              {tUI('Quick Ticker', 'त्वरित दाम')}
            </p>
            <MandiTicker />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mandiPrices.map(p => (
              <div
                key={p.crop}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-stone-800">{isHi ? p.cropHi : p.crop}</h3>
                    <p className="text-xs text-stone-500 font-medium">{p.mandi} Mandi</p>
                  </div>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg shrink-0">
                    {p.date}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center">
                    <p className="text-sm font-black text-stone-700">₹{p.minPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-500 uppercase">{tUI('Min', 'न्यूनतम')}</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-lg py-1">
                    <p className="text-sm font-black text-amber-700">₹{p.modalPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-600 uppercase">{tUI('Modal', 'मोडल')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-stone-700">₹{p.maxPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-500 uppercase">{tUI('Max', 'अधिकतम')}</p>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 text-center">{p.unit}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );

  const WeatherView = () => (
    <section>
      <h2 className="text-2xl font-extrabold text-stone-800 mb-6">
        {tUI('Weather & Soil Analysis', 'मौसम और मिट्टी विश्लेषण')}
      </h2>
      <WeatherMoistureCard />
      {weather && !loadingWeather && soilMoisture !== null && (
        <div className={`mt-4 border rounded-2xl p-5 ${
          soilMoisture > 28 ? 'bg-red-50 border-red-200' :
          soilMoisture > 20 ? 'bg-yellow-50 border-yellow-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <p className={`font-bold flex items-center gap-2 mb-1 ${
            soilMoisture > 28 ? 'text-red-700' :
            soilMoisture > 20 ? 'text-yellow-700' :
            'text-emerald-700'
          }`}>
            <span className="material-symbols-outlined">
              {soilMoisture > 20 ? 'warning' : 'agriculture'}
            </span>
            {soilMoisture > 28
              ? tUI('Very wet conditions – harvest losses possible.', 'बहुत अधिक नमी – फसल नुकसान संभव।')
              : soilMoisture > 20
              ? tUI('High soil moisture – check produce quality before sale.', 'अधिक मिट्टी नमी – बिक्री से पहले गुणवत्ता जांचें।')
              : tUI('Good conditions for harvest and transport activities.', 'कटाई और परिवहन के लिए अच्छी स्थिति।')}
          </p>
          <p className={`text-sm ${
            soilMoisture > 28 ? 'text-red-600' :
            soilMoisture > 20 ? 'text-yellow-600' :
            'text-emerald-600'
          }`}>
            {soilMoisture > 20
              ? tUI('Mandi buyers may apply grade deductions for excess moisture. Consider drying produce before dispatch.', 'मंडी खरीदार अतिरिक्त नमी के लिए ग्रेड कटौती लगा सकते हैं। भेजने से पहले सुखाने पर विचार करें।')
              : tUI('Conditions are favorable. Monitor forecasts before committing to large-scale transport.', 'परिस्थितियां अनुकूल हैं। बड़े परिवहन से पहले पूर्वानुमान देखें।')}
          </p>
        </div>
      )}
    </section>
  );

  // -------- Main render --------
  return (
    <div className="bg-stone-50 text-stone-900 font-['Lexend'] min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-amber-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[22px] text-amber-200"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              agriculture
            </span>
          </div>
          <span className="text-lg font-black text-white tracking-tight">Sarthi</span>
          <span className="hidden md:block text-xs font-semibold text-amber-200 bg-amber-700/50 px-2 py-0.5 rounded-full ml-1">
            {tUI('Farmer', 'किसान')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button className="p-2 text-amber-200 rounded-full hover:bg-amber-700/60 transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-amber-200 rounded-full hover:bg-amber-700/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-100 shrink-0 border-r border-stone-800">
          {/* Farmer mini-profile */}
          <div className="px-4 py-5 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-700/60 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[22px] text-amber-300"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  agriculture
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-stone-100 truncate">{farmerName}</p>
                <p className="text-xs text-stone-400 truncate">{farmerLocation}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(item => <SidebarNavBtn key={item.id} item={item} />)}
          </nav>

          {/* Weather quick peek */}
          {weather && !loadingWeather && (
            <div className="mx-3 mb-4 bg-stone-800 rounded-xl p-3 border border-stone-700">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="material-symbols-outlined text-amber-400 text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {getWeatherIcon(weather.icon)}
                </span>
                <span className="text-sm font-bold text-stone-200">{weather.temp}°C</span>
                <span className="text-xs text-stone-400">{isHi ? weather.descriptionHi : weather.description}</span>
              </div>
              {soilMoisture !== null && moistureBand && (
                <p className={`text-xs font-semibold ${moistureBand.color.replace('text-', 'text-')} mt-0.5`}>
                  {moistureBand.emoji} {tUI('Soil', 'मिट्टी')}: {soilMoisture}% ({isHi ? moistureBand.labelHi : moistureBand.label})
                </p>
              )}
            </div>
          )}

          {/* Logout */}
          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-stone-400 hover:bg-stone-800 hover:text-red-400 transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
              {tUI('Logout', 'लॉगआउट')}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6 pb-28 md:pb-8">
            {view === 'home' && <HomeView />}
            {view === 'book' && <BookView />}
            {view === 'crops' && <CropsView />}
            {view === 'prices' && <PricesView />}
            {view === 'weather' && <WeatherView />}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-stone-900 border-t border-stone-800 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${
              view === item.id ? 'text-amber-400' : 'text-stone-500'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings: view === item.id ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
              }}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] ${view === item.id ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
