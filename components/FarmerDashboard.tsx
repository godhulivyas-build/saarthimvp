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

type View = 'home' | 'book' | 'crops' | 'prices' | 'weather';
type ProductUnit = 'kg' | 'quintal' | 'ton';

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

  // Booking form
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<ProductUnit>('quintal');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'options' | 'confirmed'>('form');
  const [confirmedId, setConfirmedId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // New crop listing form
  const [showListForm, setShowListForm] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState<ProductUnit>('quintal');
  const [newPrice, setNewPrice] = useState('');
  const [listingLoading, setListingLoading] = useState(false);

  // Negotiation actions per demand id
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

  const handleConfirmBooking = async (optionFare: number) => {
    setBookingLoading(true);
    try {
      const matched = produceItems.find(p => p.crop.toLowerCase().includes(cropInput.toLowerCase()));
      let produceId: string;
      if (matched) {
        produceId = matched.id;
      } else {
        const created = await addProduce({
          farmerName,
          farmerLocation: pickup,
          crop: cropInput,
          quantity: Number(qty) || 1,
          unit,
          pricePerUnit: 0,
        });
        produceId = created.id;
      }
      const req = await requestPickup({
        produceId,
        farmerName,
        pickupLocation: pickup,
        dropLocation: destination,
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
      await addProduce({
        farmerName,
        farmerLocation,
        crop: newCropName,
        quantity: Number(newQty),
        unit: newUnit,
        pricePerUnit: Number(newPrice),
      });
      setShowListForm(false);
      setNewCropName(''); setNewQty(''); setNewPrice('');
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

  const activeTrips = pickupRequests.filter(r => r.status !== 'delivered' && r.status !== 'cancelled');
  const farmerCrops = new Set(produceItems.map(p => p.crop.toLowerCase()));
  const matchingDemands = buyerDemands.filter(d => farmerCrops.has(d.crop.toLowerCase()) && !negotiationActions[d.id]);

  const weatherIconMap: Record<string, string> = {
    '01d': 'sunny', '01n': 'nights_stay', '02d': 'partly_cloudy_day', '02n': 'partly_cloudy_night',
    '03d': 'cloud', '03n': 'cloud', '04d': 'cloud', '04n': 'cloud',
    '09d': 'rainy', '09n': 'rainy', '10d': 'rainy', '10n': 'rainy',
    '11d': 'thunderstorm', '11n': 'thunderstorm', '50d': 'foggy', '50n': 'foggy',
  };
  const weatherIcon = (icon: string) => weatherIconMap[icon] || 'cloud';

  const navItems = [
    { id: 'home', icon: 'home', label: tUI('Home', 'होम') },
    { id: 'book', icon: 'local_shipping', label: tUI('Book', 'बुक') },
    { id: 'crops', icon: 'grass', label: tUI('Crops', 'फसल') },
    { id: 'prices', icon: 'trending_up', label: tUI('Rates', 'दाम') },
    { id: 'weather', icon: 'cloud', label: tUI('Weather', 'मौसम') },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-['Lexend'] min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-white dark:bg-slate-900 shadow-sm border-b border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Sarthi" className="w-10 h-10 rounded-xl shadow-sm bg-emerald-50 p-1" />
          <span className="hidden md:block text-xl font-black text-emerald-900 dark:text-emerald-50">Sarthi</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as View)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${view === item.id ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button className="p-2 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button onClick={handleLogout} className="p-2 text-red-600 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-28 md:pb-8 space-y-6">

        {/* ======== HOME ======== */}
        {view === 'home' && (
          <>
            {/* Profile hero */}
            <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center gap-5 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-emerald-700/70 flex items-center justify-center border-2 border-emerald-500/60 shrink-0">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>face</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-black mb-0.5">{tUI(`Welcome, ${farmerName}!`, `नमस्ते, ${farmerName}!`)}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-emerald-200/80 font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span>{farmerLocation}</span>
                  {weather && !loadingWeather && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">{weatherIcon(weather.icon)}</span>
                      {weather.temp}°C • {isHi ? weather.descriptionHi : weather.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="bg-white/15 rounded-2xl p-4 text-center min-w-[80px]">
                  <p className="text-3xl font-black">{pickupRequests.length}</p>
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{tUI('Trips', 'ट्रिप्स')}</p>
                </div>
                <div className="bg-white/15 rounded-2xl p-4 text-center min-w-[80px]">
                  <p className="text-3xl font-black text-amber-400">{produceItems.length}</p>
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{tUI('Listings', 'लिस्टिंग')}</p>
                </div>
              </div>
            </section>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'book', icon: 'local_shipping', label: tUI('Book Transport', 'ट्रांसपोर्ट बुक करें'), color: 'emerald' },
                { id: 'crops', icon: 'grass', label: tUI('My Crops', 'मेरी फसल'), color: 'amber' },
                { id: 'prices', icon: 'trending_up', label: tUI('Mandi Rates', 'मंडी दाम'), color: 'blue' },
                { id: 'weather', icon: 'cloud', label: tUI('Weather', 'मौसम'), color: 'violet' },
              ].map(a => (
                <button key={a.id} onClick={() => setView(a.id as View)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                  <span className="material-symbols-outlined text-[36px] text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                  <span className="font-bold text-sm text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Active trips */}
            {activeTrips.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <h2 className="font-extrabold text-base mb-4 flex items-center gap-2 text-emerald-900 dark:text-emerald-50">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">local_shipping</span>
                  {tUI('Active Transport Requests', 'सक्रिय परिवहन अनुरोध')}
                  <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">{activeTrips.length}</span>
                </h2>
                <div className="space-y-2">
                  {activeTrips.slice(0, 3).map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-bold text-sm">{req.pickupLocation} → {req.dropLocation}</p>
                        <p className="text-xs text-slate-500">{req.quantity} {req.unit} • #{req.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'assigned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : req.status === 'in_transit' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {req.status === 'requested' ? tUI('Finding Driver', 'ड्राइवर खोज रहे') : req.status === 'assigned' ? tUI('Driver Assigned', 'ड्राइवर मिला') : req.status === 'in_transit' ? tUI('In Transit', 'रास्ते में') : req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Buyer negotiations */}
            {matchingDemands.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-200 dark:border-amber-800 shadow-sm">
                <h2 className="font-extrabold text-base mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <span className="material-symbols-outlined text-[20px]">handshake</span>
                  {tUI('Buyer Offers', 'खरीदार के प्रस्ताव')}
                  <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">{matchingDemands.length}</span>
                </h2>
                <div className="space-y-3">
                  {matchingDemands.map(demand => (
                    <div key={demand.id} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm">{demand.buyerName}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{tUI('Wants', 'चाहिए')}: {demand.quantity} {demand.unit} {demand.crop}</p>
                          <p className="text-xs text-slate-500">{demand.buyerLocation} • {demand.deliveryWindow}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-amber-600">₹{demand.priceTarget.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">/{demand.unit}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptDemand(demand)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-sm transition-colors active:scale-95">{tUI('Accept', 'स्वीकार')}</button>
                        <button onClick={() => setNegotiationActions(prev => ({ ...prev, [demand.id]: 'rejected' }))} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold py-2 rounded-lg text-sm transition-colors">{tUI('Decline', 'अस्वीकार')}</button>
                        <button onClick={() => setNegotiationActions(prev => ({ ...prev, [demand.id]: 'countered' }))} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-lg text-sm transition-colors">{tUI('Counter', 'काउंटर')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mandi price snapshot */}
            {mandiPrices.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold text-base">{tUI("Today's Mandi Rates", 'आज के मंडी दाम')}</h2>
                  <button onClick={() => setView('prices')} className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1">
                    {tUI('See All', 'सब देखें')} <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mandiPrices.slice(0, 6).map(p => (
                    <div key={p.crop} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-sm">{isHi ? p.cropHi : p.crop}</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">₹{p.modalPrice.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{p.mandi} • {p.unit}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ======== BOOK TRANSPORT ======== */}
        {view === 'book' && (
          <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-6 md:p-10 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[200px]">local_shipping</span>
            </div>
            <div className="relative z-10">

              {bookingStep === 'form' && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-white/20 p-3 rounded-2xl"><span className="material-symbols-outlined text-white text-[32px]">local_shipping</span></div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold">{tUI('Book Transport', 'ट्रांसपोर्ट बुक करें')}</h2>
                      <p className="text-emerald-200 text-sm font-medium">{tUI('Get your produce to market fast & fair.', 'अपनी फसल सही दाम पर मंडी तक भेजें।')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-emerald-200 text-sm font-bold">{tUI('Pickup Location', 'पिकअप स्थान')}</label>
                        <button onClick={() => setPickup(farmerLocation)} className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:text-amber-300">
                          <span className="material-symbols-outlined text-[14px]">my_location</span> {tUI('Use GPS', 'GPS')}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-400 text-[20px]">my_location</span>
                        <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder={tUI('Farm location...', 'खेत का स्थान...')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Destination (Mandi/Warehouse)', 'मंज़िल (मंडी/गोदाम)')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-400 text-[20px]">location_on</span>
                        <input value={destination} onChange={e => setDestination(e.target.value)} placeholder={tUI('Mandi or warehouse...', 'मंडी या गोदाम...')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Crop Type', 'फसल का प्रकार')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-400 text-[20px]">grass</span>
                        <input value={cropInput} onChange={e => setCropInput(e.target.value)} placeholder={tUI('e.g. Wheat, Soybean', 'उदा. गेहूं, सोयाबीन')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Quantity', 'मात्रा')}</label>
                        <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="0" className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 px-4 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium" />
                      </div>
                      <div>
                        <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Unit', 'इकाई')}</label>
                        <select value={unit} onChange={e => setUnit(e.target.value as ProductUnit)} className="bg-white/10 border border-emerald-500/30 rounded-xl py-3 px-3 text-white focus:outline-none font-medium" style={{ height: '50px' }}>
                          <option value="quintal" className="text-slate-900 bg-white">{tUI('Quintal', 'क्विंटल')}</option>
                          <option value="kg" className="text-slate-900 bg-white">KG</option>
                          <option value="ton" className="text-slate-900 bg-white">{tUI('Ton', 'टन')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setIsRoundTrip(!isRoundTrip)} className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isRoundTrip ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/50 bg-white/10'}`}>
                        {isRoundTrip && <span className="material-symbols-outlined text-white text-sm">check</span>}
                      </div>
                      <div>
                        <span className="text-sm font-bold">{tUI('Round Trip', 'वापसी यात्रा')}</span>
                        <span className="block text-xs text-emerald-300/80">{tUI('Bring inputs on return', 'वापसी में उर्वरक लाएं')}</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setIsShared(!isShared)} className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isShared ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/50 bg-white/10'}`}>
                        {isShared && <span className="material-symbols-outlined text-white text-sm">check</span>}
                      </div>
                      <div>
                        <span className="text-sm font-bold">{tUI('Shared Transport', 'साझा परिवहन')}</span>
                        <span className="block text-xs text-emerald-300/80">{tUI('Lower cost, share truck space', 'कम खर्च, ट्रक साझा करें')}</span>
                      </div>
                    </label>
                  </div>

                  <button onClick={() => { if (pickup && destination && cropInput && qty) setBookingStep('options'); else alert(tUI('Please fill all fields.', 'कृपया सभी फ़ील्ड भरें।')); }}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg py-4 px-8 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[28px]">search</span>
                    {tUI('Find Transport Options', 'ट्रांसपोर्ट विकल्प खोजें')}
                  </button>
                </>
              )}

              {bookingStep === 'options' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setBookingStep('form')} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors">
                      <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div>
                      <h2 className="text-2xl font-extrabold">{tUI('Transport Options', 'परिवहन विकल्प')}</h2>
                      <p className="text-emerald-200 text-sm">{cropInput} • {qty} {unit} • {pickup} → {destination}</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {[
                      { icon: 'local_shipping', label: tUI('Mini Truck (1-2 Tons)', 'छोटा ट्रक (1-2 टन)'), sub: tUI('Arrives in 45 min • 4.8★', '45 मिनट में • 4.8★'), fare: isShared ? 800 : 1200, orig: 1500 },
                      { icon: 'fire_truck', label: tUI('Large Truck (Shared)', 'बड़ा ट्रक (साझा)'), sub: tUI('Arrives in 2 hrs • Cost effective', '2 घंटे में • किफायती'), fare: 800, orig: null },
                    ].map((opt, i) => (
                      <div key={i} className="bg-white/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-900 p-3 rounded-xl"><span className="material-symbols-outlined text-[32px] text-emerald-400">{opt.icon}</span></div>
                          <div>
                            <h4 className="font-bold text-lg">{opt.label}</h4>
                            <p className="text-sm text-emerald-200">{opt.sub}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="text-right flex-1 md:flex-none">
                            <div className="text-2xl font-black text-amber-400">₹{opt.fare.toLocaleString()}</div>
                            {opt.orig && <div className="text-xs text-emerald-200 line-through">₹{opt.orig.toLocaleString()}</div>}
                          </div>
                          <button onClick={() => handleConfirmBooking(opt.fare)} disabled={bookingLoading} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors active:scale-95 disabled:opacity-60 shrink-0">
                            {bookingLoading ? tUI('Booking...', 'बुक हो रहा...') : tUI('Book', 'बुक करें')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookingStep === 'confirmed' && (
                <div className="animate-in zoom-in duration-500 text-center py-8">
                  <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                    <span className="material-symbols-outlined text-emerald-950 text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h2 className="text-3xl font-black mb-2">{tUI('Booking Confirmed!', 'बुकिंग पक्की हो गई!')}</h2>
                  <p className="text-emerald-200 mb-6">{tUI('Transport request is live. Drivers will be notified.', 'अनुरोध भेज दिया गया है। ड्राइवरों को सूचित किया जाएगा।')}</p>
                  <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-6 max-w-sm mx-auto mb-8">
                    <div className="text-sm text-emerald-300 font-bold mb-1">{tUI('Tracking ID', 'ट्रैकिंग आईडी')}</div>
                    <div className="text-xl font-black text-amber-400 tracking-widest mb-2">#{confirmedId.slice(-10).toUpperCase()}</div>
                    <div className="text-sm text-emerald-300">{pickup} → {destination}</div>
                    <div className="text-sm text-emerald-300 mt-1">{cropInput} • {qty} {unit}</div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setView('home')} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                      {tUI('Back to Home', 'होम पर जाएं')}
                    </button>
                    <button onClick={() => { setBookingStep('form'); setPickup(''); setDestination(''); setCropInput(''); setQty(''); }} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                      {tUI('Book Another', 'और बुक करें')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======== MY CROPS ======== */}
        {view === 'crops' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold">{tUI('My Crop Listings', 'मेरी फसल लिस्टिंग')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{tUI('Manage listings and respond to buyer offers.', 'लिस्टिंग प्रबंधित करें और खरीदारों के प्रस्तावों का जवाब दें।')}</p>
              </div>
              <button onClick={() => setShowListForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-95 flex items-center gap-2 text-sm shrink-0">
                <span className="material-symbols-outlined text-[20px]">add</span>
                {tUI('Add Crop', 'फसल जोड़ें')}
              </button>
            </div>

            {showListForm && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-400 shadow-md animate-in fade-in duration-200">
                <h3 className="font-extrabold text-lg mb-5">{tUI('List New Crop for Sale', 'नई फसल बिक्री के लिए लिस्ट करें')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">{tUI('Crop Name', 'फसल का नाम')}</label>
                    <input value={newCropName} onChange={e => setNewCropName(e.target.value)} placeholder={tUI('e.g. Wheat, Soybean', 'उदा. गेहूं, सोयाबीन')} className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 focus:outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">{tUI('Quantity', 'मात्रा')}</label>
                    <input value={newQty} onChange={e => setNewQty(e.target.value)} type="number" placeholder="0" className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 focus:outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">{tUI('Unit', 'इकाई')}</label>
                    <select value={newUnit} onChange={e => setNewUnit(e.target.value as ProductUnit)} className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 focus:outline-none font-medium" style={{ height: '46px' }}>
                      <option value="quintal">{tUI('Quintal', 'क्विंटल')}</option>
                      <option value="kg">KG</option>
                      <option value="ton">{tUI('Ton', 'टन')}</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">{tUI('Price per Unit (₹)', 'प्रति इकाई दाम (₹)')}</label>
                    <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" placeholder="₹ 0" className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 focus:outline-none font-medium" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddListing} disabled={listingLoading || !newCropName || !newQty || !newPrice} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                    {listingLoading
                      ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      : <span className="material-symbols-outlined text-[18px]">check</span>}
                    {tUI('Publish Listing', 'लिस्टिंग प्रकाशित करें')}
                  </button>
                  <button onClick={() => setShowListForm(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {tUI('Cancel', 'रद्द करें')}
                  </button>
                </div>
              </div>
            )}

            {loadingProduce ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-[48px] animate-spin text-emerald-500">refresh</span>
              </div>
            ) : produceItems.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[64px] text-emerald-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>grass</span>
                <p className="font-bold text-slate-500">{tUI('No listings yet. Add your first crop!', 'अभी कोई लिस्टिंग नहीं।')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {produceItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>grass</span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base">{item.crop}</h3>
                          <p className="text-xs text-slate-500">{item.farmerName} • {item.farmerLocation}</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        {tUI('Active', 'सक्रिय')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-center">
                        <p className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{item.pricePerUnit.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase">/{item.unit}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-center">
                        <p className="text-base font-black">{item.quantity}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{item.unit}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-center">
                        <p className="text-base font-black">₹{(item.pricePerUnit * item.quantity).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{tUI('Total', 'कुल')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setView('book'); setCropInput(item.crop); setPickup(item.farmerLocation); setQty(String(item.quantity)); setUnit(item.unit as ProductUnit); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                      {tUI('Book Transport for This Crop', 'इस फसल के लिए ट्रांसपोर्ट बुक करें')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ======== MANDI PRICES ======== */}
        {view === 'prices' && (
          <section>
            <h2 className="text-2xl font-extrabold mb-1">{tUI('Mandi Prices Today', 'आज के मंडी दाम')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{tUI('Live rates from Madhya Pradesh mandis', 'मध्य प्रदेश मंडियों के दाम')}</p>
            {loadingPrices ? (
              <div className="text-center py-12"><span className="material-symbols-outlined text-[48px] animate-spin text-emerald-500">refresh</span></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mandiPrices.map(p => (
                  <div key={p.crop} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-extrabold text-lg">{isHi ? p.cropHi : p.crop}</h3>
                        <p className="text-xs text-slate-500 font-medium">{p.mandi} Mandi</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg shrink-0">{p.date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300">₹{p.minPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{tUI('Min', 'न्यूनतम')}</p>
                      </div>
                      <div className="text-center bg-emerald-50 dark:bg-emerald-900/30 rounded-lg py-1">
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">₹{p.modalPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase">{tUI('Modal', 'मोडल')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300">₹{p.maxPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{tUI('Max', 'अधिकतम')}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">{p.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ======== WEATHER ======== */}
        {view === 'weather' && (
          <section>
            <h2 className="text-2xl font-extrabold mb-6">{tUI('Local Weather', 'स्थानीय मौसम')}</h2>
            {loadingWeather ? (
              <div className="text-center py-12"><span className="material-symbols-outlined text-[48px] animate-spin text-blue-500">refresh</span></div>
            ) : weather ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-8 text-white shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-blue-200 font-medium mb-2">{farmerLocation}</p>
                      <p className="text-7xl font-black leading-none">{weather.temp}°C</p>
                      <p className="text-xl font-semibold text-blue-100 mt-3">{isHi ? weather.descriptionHi : weather.description}</p>
                    </div>
                    <span className="material-symbols-outlined text-[80px] text-blue-300/70" style={{ fontVariationSettings: "'FILL' 1" }}>{weatherIcon(weather.icon)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: 'water_drop', val: `${weather.humidity}%`, label: tUI('Humidity', 'नमी') },
                      { icon: 'air', val: `${weather.windSpeed} km/h`, label: tUI('Wind', 'हवा') },
                      { icon: 'rainy', val: `${weather.rainfall} mm`, label: tUI('Rainfall', 'बारिश') },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/15 rounded-2xl p-4 text-center">
                        <span className="material-symbols-outlined text-blue-200 block mb-1">{stat.icon}</span>
                        <p className="text-2xl font-black">{stat.val}</p>
                        <p className="text-xs text-blue-200">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`border rounded-2xl p-4 ${weather.rainfall > 3 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
                  <p className={`font-bold flex items-center gap-2 ${weather.rainfall > 3 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    <span className="material-symbols-outlined">{weather.rainfall > 3 ? 'warning' : 'agriculture'}</span>
                    {weather.rainfall > 3
                      ? tUI('Heavy rain expected. Consider delaying transport today.', 'भारी बारिश की संभावना। आज परिवहन टालना उचित होगा।')
                      : tUI('Good conditions for transport and harvest activities.', 'परिवहन और कटाई के लिए अच्छा मौसम।')}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-white dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id as View)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${view === item.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: view === item.id ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>{item.icon}</span>
            <span className={`text-[10px] ${view === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
