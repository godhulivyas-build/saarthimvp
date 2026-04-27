import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import { useV2Session } from '../state/v2Session';
import LanguageSelector from './LanguageSelector';
import type { ProduceItem, Order } from '../types';
import {
  listProduce, placeOrder, listOrders, createBuyerDemand,
} from '../services/mvpDataService';

type View = 'marketplace' | 'cart' | 'orders' | 'demand';

interface CartItem {
  produceId: string;
  crop: string;
  farmerName: string;
  farmerLocation: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
}

type ChatMessage = { from: 'buyer' | 'farmer'; text: string; time: string };

const CROP_EMOJI: Record<string, string> = {
  Soybean: '🫘', Wheat: '🌾', Onion: '🧅', Tomato: '🍅', Potato: '🥔',
  Maize: '🌽', Garlic: '🧄', Cotton: '🌸', Mustard: '🌻', Rice: '🍚',
  Lentil: '🫘', Gram: '🫘', Coriander: '🌿',
};

const CROP_CATEGORY: Record<string, string[]> = {
  grains: ['Wheat', 'Rice', 'Maize', 'Soybean', 'Gram', 'Lentil', 'Mustard'],
  vegetables: ['Onion', 'Tomato', 'Potato', 'Garlic', 'Coriander', 'Green Chilli'],
};

// Mock quality metadata per crop (pilot data)
const CROP_QUALITY: Record<string, { harvestDate: string; fertilizerUsed: string; fertilizerHi: string; moisturePct: number; grade: string; certifiedOrganic: boolean }> = {
  Soybean:  { harvestDate: 'Oct 2024', fertilizerUsed: 'DAP + Urea', fertilizerHi: 'डीएपी + यूरिया', moisturePct: 12, grade: 'A', certifiedOrganic: false },
  Wheat:    { harvestDate: 'Mar 2024', fertilizerUsed: 'NPK 10-26-26', fertilizerHi: 'एनपीके 10-26-26', moisturePct: 11, grade: 'A', certifiedOrganic: false },
  Onion:    { harvestDate: 'Nov 2024', fertilizerUsed: 'SSP + Potash', fertilizerHi: 'एसएसपी + पोटाश', moisturePct: 13, grade: 'B+', certifiedOrganic: false },
  Tomato:   { harvestDate: 'Dec 2024', fertilizerUsed: 'Organic compost', fertilizerHi: 'जैविक खाद', moisturePct: 9, grade: 'A', certifiedOrganic: true },
  Potato:   { harvestDate: 'Jan 2025', fertilizerUsed: 'NPK + Sulphur', fertilizerHi: 'एनपीके + सल्फर', moisturePct: 14, grade: 'B', certifiedOrganic: false },
  Garlic:   { harvestDate: 'Nov 2024', fertilizerUsed: 'SSP + Sulphur 90%', fertilizerHi: 'एसएसपी + सल्फर', moisturePct: 10, grade: 'A+', certifiedOrganic: false },
  Rice:     { harvestDate: 'Sep 2024', fertilizerUsed: 'Urea + Zinc Sulphate', fertilizerHi: 'यूरिया + जिंक सल्फेट', moisturePct: 13, grade: 'A', certifiedOrganic: false },
};

const getQuality = (crop: string) => CROP_QUALITY[crop] ?? { harvestDate: 'Recent', fertilizerUsed: 'Standard NPK', fertilizerHi: 'स्टैंडर्ड एनपीके', moisturePct: 12, grade: 'B', certifiedOrganic: false };

const QUICK_QUESTIONS: Array<{ en: string; hi: string; answerKey: string }> = [
  { en: 'What fertilizer did you use?', hi: 'कौन सा खाद इस्तेमाल किया?', answerKey: 'fertilizer' },
  { en: 'When was it harvested?', hi: 'फसल कब काटी गई?', answerKey: 'harvest' },
  { en: 'What is the moisture content?', hi: 'नमी का प्रतिशत क्या है?', answerKey: 'moisture' },
  { en: 'Can you share a video of the crop?', hi: 'क्या आप फसल का वीडियो दिखा सकते हैं?', answerKey: 'video' },
  { en: 'Can you offer a lower price?', hi: 'क्या कीमत कम हो सकती है?', answerKey: 'discount' },
];

function getFarmerAnswer(key: string, crop: string, isHi: boolean): string {
  const q = getQuality(crop);
  if (key === 'fertilizer') return isHi ? `हमने ${q.fertilizerHi} इस्तेमाल किया है।` : `We used ${q.fertilizerUsed}.`;
  if (key === 'harvest') return isHi ? `फसल ${q.harvestDate} में काटी गई थी।` : `Harvested in ${q.harvestDate}.`;
  if (key === 'moisture') return isHi ? `नमी ${q.moisturePct}% है, जो मानक श्रेणी में है।` : `Moisture content is ${q.moisturePct}% — within standard range.`;
  if (key === 'video') return isHi ? `जी हाँ! मैं अभी वीडियो भेज रहा हूँ। 📹` : `Sure! Sending you a video now. 📹`;
  if (key === 'discount') return isHi ? `मैं देख सकता हूँ। 5-10% छूट बड़े ऑर्डर पर मिल सकती है।` : `I can consider. 5-10% off is possible for larger orders.`;
  return isHi ? 'हाँ, ज़रूर।' : 'Sure, happy to help.';
}

function getCropCategory(crop: string): 'grains' | 'vegetables' | 'other' {
  if (CROP_CATEGORY.grains.some(c => crop.toLowerCase().includes(c.toLowerCase()))) return 'grains';
  if (CROP_CATEGORY.vegetables.some(c => crop.toLowerCase().includes(c.toLowerCase()))) return 'vegetables';
  return 'other';
}

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang } = useI18n();
  const { session } = useV2Session();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => (isHi ? hi : en);

  const buyerName = session.name || 'Demo Buyer';
  const buyerLocation = session.addressLabel || 'Mumbai, MH';

  const [view, setView] = useState<View>('marketplace');

  // Data
  const [products, setProducts] = useState<ProduceItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'grains' | 'vegetables' | 'other'>('all');

  // Post demand form
  const [demandCrop, setDemandCrop] = useState('');
  const [demandQty, setDemandQty] = useState('');
  const [demandPrice, setDemandPrice] = useState('');
  const [demandWindow, setDemandWindow] = useState('');
  const [demandPosted, setDemandPosted] = useState(false);
  const [demandLoading, setDemandLoading] = useState(false);

  // Product detail / transparency drawer
  const [detailItem, setDetailItem] = useState<ProduceItem | null>(null);

  // Chat
  const [chatItem, setChatItem] = useState<ProduceItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true);
    const items = await listProduce();
    setProducts(items);
    setLoadingProducts(false);
  }, []);

  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true);
    const o = await listOrders();
    setOrders(o);
    setLoadingOrders(false);
  }, []);

  useEffect(() => { refreshProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const openChat = (item: ProduceItem) => {
    setDetailItem(null);
    setChatItem(item);
    const q = getQuality(item.crop);
    setChatMessages([
      {
        from: 'farmer',
        text: isHi
          ? `नमस्ते! मैं ${item.farmerName} हूँ। हमारा ${item.crop} अभी उपलब्ध है — ${q.grade} ग्रेड, नमी ${q.moisturePct}%।`
          : `Hello! I'm ${item.farmerName}. Our ${item.crop} is ready — Grade ${q.grade}, Moisture ${q.moisturePct}%.`,
        time: 'now',
      },
    ]);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !chatItem) return;
    const userMsg: ChatMessage = { from: 'buyer', text: chatInput, time: 'now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setTimeout(() => {
      const reply: ChatMessage = {
        from: 'farmer',
        text: isHi ? 'जी हाँ, हम मदद करेंगे। 🙏' : 'Sure, happy to help. 🙏',
        time: 'now',
      };
      setChatMessages(prev => [...prev, reply]);
    }, 800);
  };

  const sendQuickQuestion = (q: typeof QUICK_QUESTIONS[0]) => {
    if (!chatItem) return;
    const userMsg: ChatMessage = { from: 'buyer', text: isHi ? q.hi : q.en, time: 'now' };
    setChatMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply: ChatMessage = {
        from: 'farmer',
        text: getFarmerAnswer(q.answerKey, chatItem.crop, isHi),
        time: 'now',
      };
      setChatMessages(prev => [...prev, reply]);
    }, 700);
  };

  const handleAddToCart = (item: ProduceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.produceId === item.id);
      if (existing) return prev.map(c => c.produceId === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { produceId: item.id, crop: item.crop, farmerName: item.farmerName, farmerLocation: item.farmerLocation, qty: 1, unit: item.unit, pricePerUnit: item.pricePerUnit }];
    });
  };

  const handleUpdateQty = (produceId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.produceId !== produceId)); return; }
    setCart(prev => prev.map(c => c.produceId === produceId ? { ...c, qty } : c));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.qty * c.pricePerUnit, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const ids: string[] = [];
      for (const item of cart) {
        try {
          const order = await placeOrder({ produceId: item.produceId, buyerName, buyerLocation: deliveryAddress, quantity: item.qty });
          ids.push(order.id);
        } catch { /* out of stock */ }
      }
      setPlacedOrderIds(ids);
      setOrderConfirmed(true);
      setCart([]);
      refreshProducts();
      refreshOrders();
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePostDemand = async () => {
    if (!demandCrop || !demandQty || !demandPrice) return;
    setDemandLoading(true);
    try {
      await createBuyerDemand({ buyerName, buyerLocation, crop: demandCrop, quantity: Number(demandQty), unit: 'quintal', priceTarget: Number(demandPrice), deliveryWindow: demandWindow || tUI('Flexible', 'लचीला') });
      setDemandPosted(true);
    } finally { setDemandLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.crop.toLowerCase().includes(searchQuery.toLowerCase()) || p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || getCropCategory(p.crop) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const NAV_ITEMS = [
    { id: 'marketplace', icon: 'storefront', label: tUI('Marketplace', 'मार्केटप्लेस'), badge: null },
    { id: 'cart', icon: 'shopping_cart', label: tUI('Cart', 'कार्ट'), badge: cartCount > 0 ? cartCount : null },
    { id: 'orders', icon: 'assignment', label: tUI('My Orders', 'मेरे ऑर्डर'), badge: null },
    { id: 'demand', icon: 'post_add', label: tUI('Post Demand', 'मांग पोस्ट'), badge: null },
  ];

  return (
    <div className="bg-[#f8f9f8] text-stone-900 min-h-screen font-['Lexend'] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-16 bg-[#1B4332] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px] text-emerald-200" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
          </div>
          <span className="text-lg font-black text-white">Sarthi</span>
          <span className="hidden md:block text-xs font-semibold text-emerald-300 bg-emerald-800/50 px-2 py-0.5 rounded-full ml-1">
            {tUI('Buyer', 'खरीदार')}
          </span>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.filter(n => n.id !== 'cart').map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id as View); if (item.id === 'orders') refreshOrders(); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === item.id ? 'bg-white/20 text-white' : 'text-emerald-200/80 hover:text-white hover:bg-white/10'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button
            onClick={() => setView('cart')}
            className="relative p-2 text-emerald-200 hover:bg-emerald-700/60 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1B4332]">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={handleLogout} className="p-2 text-emerald-200 hover:bg-emerald-700/60 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-24 md:pb-8">

        {/* ======== MARKETPLACE ======== */}
        {view === 'marketplace' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Search + filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-2xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full border-2 border-stone-200 focus:border-[#E85D04] focus:outline-none bg-white text-stone-900 text-base"
                  placeholder={tUI('Search produce, farmers, locations...', 'फसल, किसान, जगह खोजें...')}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {(['all', 'grains', 'vegetables', 'other'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#E85D04] text-white shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat === 'all' ? tUI('All Produce', 'सभी') : cat === 'grains' ? tUI('Grains', 'अनाज') : cat === 'vegetables' ? tUI('Vegetables', 'सब्ज़ियाँ') : tUI('Other', 'अन्य')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 relative h-44 rounded-3xl overflow-hidden bg-gradient-to-r from-[#1B4332] to-[#0e6c4a] shadow-lg">
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <span className="bg-[#E85D04] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mb-2">
                    {tUI('Direct from Farmers', 'किसानों से सीधे')}
                  </span>
                  <h2 className="text-white text-2xl font-black mb-1">{tUI('Fresh Harvest Marketplace', 'ताज़ी फसल मार्केटप्लेस')}</h2>
                  <p className="text-emerald-200 text-sm">
                    {tUI('See quality info, chat with farmers, best prices guaranteed.', 'गुणवत्ता देखें, किसान से बात करें, सबसे अच्छे दाम।')}
                  </p>
                </div>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] opacity-20">🌾</span>
              </div>
              <div className="bg-[#e1f5ea] rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-emerald-900 text-lg font-bold">{tUI('Market Trends', 'बाज़ार रुझान')}</h3>
                  <p className="text-emerald-700 mt-2 text-sm">
                    {tUI(`${products.length} listings from verified farmers.`, `${products.length} लिस्टिंग सत्यापित किसानों से।`)}
                  </p>
                </div>
                <button
                  onClick={() => setView('demand')}
                  className="flex items-center gap-2 text-emerald-800 font-bold mt-4 text-sm hover:opacity-80 bg-white/60 rounded-xl px-3 py-2.5 w-fit"
                >
                  <span className="material-symbols-outlined text-base">post_add</span>
                  {tUI('Post Your Demand', 'मांग पोस्ट करें')}
                </button>
              </div>
            </div>

            {/* Product grid */}
            {loadingProducts ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-[56px] animate-spin text-[#E85D04]">refresh</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <span className="material-symbols-outlined text-[64px] text-stone-300 block mb-2">search_off</span>
                <p className="font-bold text-stone-400">{tUI('No produce found.', 'कोई उपज नहीं मिली।')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map(item => {
                  const emoji = CROP_EMOJI[item.crop] || '🌱';
                  const q = getQuality(item.crop);
                  const inCart = cart.find(c => c.produceId === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col"
                    >
                      {/* Image area */}
                      <div className="relative h-44 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center overflow-hidden group cursor-pointer"
                        onClick={() => setDetailItem(item)}
                      >
                        <span className="text-[72px] group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                        <div className="absolute top-3 left-3 flex gap-2">
                          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[#1B4332] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="text-[10px] font-bold text-stone-700">{tUI('Verified', 'सत्यापित')}</span>
                          </div>
                          {q.certifiedOrganic && (
                            <div className="bg-emerald-700 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                              {tUI('Organic', 'जैविक')}
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-emerald-700 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {item.quantity} {item.unit} {tUI('avail.', 'उपलब्ध')}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-600">
                          {tUI('Tap for details', 'विवरण देखें')}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 flex flex-col flex-1 gap-3">
                        {/* Crop + farmer */}
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-lg leading-tight text-stone-900">{item.crop}</h4>
                            <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              {tUI('Grade', 'ग्रेड')} {q.grade}
                            </span>
                          </div>
                          <p className="text-stone-500 text-xs mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {item.farmerName}
                            <span className="mx-1">·</span>
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {item.farmerLocation}
                          </p>
                        </div>

                        {/* Quality transparency strip */}
                        <div className="bg-stone-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center border border-stone-100">
                          <div>
                            <p className="text-[10px] text-stone-400 font-semibold uppercase">{tUI('Moisture', 'नमी')}</p>
                            <p className={`text-sm font-black ${q.moisturePct > 16 ? 'text-amber-600' : 'text-emerald-700'}`}>{q.moisturePct}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-400 font-semibold uppercase">{tUI('Harvested', 'कटाई')}</p>
                            <p className="text-sm font-black text-stone-700">{q.harvestDate}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-400 font-semibold uppercase">{tUI('Fertilizer', 'खाद')}</p>
                            <p className="text-[11px] font-bold text-stone-700 leading-tight">{isHi ? q.fertilizerHi : q.fertilizerUsed}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#E85D04] font-black text-2xl">₹{item.pricePerUnit.toLocaleString()}</span>
                          <span className="text-stone-400 text-sm">/{item.unit}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => openChat(item)}
                            className="flex-none h-12 px-4 border-2 border-[#1B4332] text-[#1B4332] rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                            {tUI('Chat', 'चैट')}
                          </button>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 h-12 bg-[#E85D04] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            {inCart ? `${tUI('In Cart', 'कार्ट में')} (${inCart.qty})` : tUI('Quick Add', 'जोड़ें')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======== CART & CHECKOUT ======== */}
        {view === 'cart' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button onClick={() => setView('marketplace')} className="flex items-center gap-2 text-[#1B4332] mb-5 font-bold hover:opacity-80">
              <span className="material-symbols-outlined">arrow_back</span>
              {tUI('Back to Marketplace', 'मार्केटप्लेस पर वापस')}
            </button>

            {orderConfirmed ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-emerald-100 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="text-3xl font-extrabold mb-2">{tUI('Order Placed!', 'ऑर्डर दे दिया गया!')}</h1>
                <p className="text-stone-500 mb-6 max-w-md">
                  {tUI('Farmers notified. Sarthi logistics will arrange transport on the most efficient route.', 'किसानों को सूचित किया गया। सार्थी लॉजिस्टिक्स सबसे कुशल मार्ग से परिवहन करेगा।')}
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 w-full max-w-sm mb-5 text-left">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-2">{tUI('Order ID(s)', 'ऑर्डर आईडी')}</p>
                  {placedOrderIds.map(id => (
                    <p key={id} className="text-lg font-black text-[#1B4332] tracking-wider">#{id.slice(-10).toUpperCase()}</p>
                  ))}
                  <p className="text-xs font-bold text-stone-400 uppercase mt-3 mb-1">{tUI('Delivery To', 'डिलीवरी')}</p>
                  <p className="font-semibold text-stone-800 text-sm">{deliveryAddress}</p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 w-full max-w-sm mb-6 flex items-start gap-3">
                  <span className="text-xl shrink-0">🛣️</span>
                  <p className="text-sky-700 text-xs font-medium">
                    {tUI('Transport optimized: your route is combined with other orders nearby so the driver never goes empty.', 'ट्रांसपोर्ट ऑप्टिमाइज़: आपकी डिलीवरी पास के ऑर्डर के साथ जोड़ी गई — ड्राइवर की गाड़ी खाली नहीं जाएगी।')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setView('orders'); refreshOrders(); }} className="border-2 border-[#1B4332] text-[#1B4332] font-bold py-3 px-7 rounded-xl hover:bg-emerald-50 transition-colors">
                    {tUI('Track Orders', 'ऑर्डर ट्रैक करें')}
                  </button>
                  <button onClick={() => { setOrderConfirmed(false); setDeliveryAddress(''); setView('marketplace'); }} className="bg-[#1B4332] text-white font-bold py-3 px-7 rounded-xl hover:opacity-90 shadow-md transition-colors">
                    {tUI('Continue Shopping', 'खरीदारी जारी रखें')}
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                <span className="material-symbols-outlined text-[80px] text-stone-200 block mb-3">shopping_cart</span>
                <h2 className="text-xl font-bold text-stone-400 mb-4">{tUI('Your cart is empty', 'कार्ट खाली है')}</h2>
                <button onClick={() => setView('marketplace')} className="bg-[#E85D04] text-white font-bold py-3 px-8 rounded-xl hover:opacity-90">
                  {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100">
                <h1 className="text-3xl font-extrabold mb-6">{tUI('Your Cart', 'आपका कार्ट')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.produceId} className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{CROP_EMOJI[item.crop] || '🌱'}</span>
                          <div>
                            <p className="font-bold text-sm text-stone-900">{item.crop}</p>
                            <p className="text-xs text-stone-500">{item.farmerName} · {item.farmerLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleUpdateQty(item.produceId, item.qty - 1)} className="w-8 h-8 rounded-lg bg-stone-200 font-bold flex items-center justify-center hover:bg-stone-300">−</button>
                            <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                            <button onClick={() => handleUpdateQty(item.produceId, item.qty + 1)} className="w-8 h-8 rounded-lg bg-stone-200 font-bold flex items-center justify-center hover:bg-stone-300">+</button>
                          </div>
                          <div className="text-right min-w-[72px]">
                            <p className="font-black text-[#E85D04] text-sm">₹{(item.qty * item.pricePerUnit).toLocaleString()}</p>
                            <p className="text-[10px] text-stone-400">₹{item.pricePerUnit.toLocaleString()}/{item.unit}</p>
                          </div>
                          <button onClick={() => setCart(prev => prev.filter(c => c.produceId !== item.produceId))} className="text-stone-300 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-stone-500">{tUI('Items', 'आइटम')}</span>
                        <span className="font-bold">{cartCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-black mt-3 pt-3 border-t border-stone-200">
                        <span>{tUI('Total', 'कुल')}</span>
                        <span className="text-[#1B4332]">₹{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-2 text-xs text-sky-700 font-medium">
                      <span className="text-lg shrink-0">🛣️</span>
                      {tUI('Transport will be route-optimized by Sarthi — your order gets combined with nearby deliveries so the driver earns more and you pay less for logistics.', 'परिवहन सार्थी द्वारा ऑप्टिमाइज़ किया जाएगा — पास के ऑर्डर के साथ जोड़ा जाएगा।')}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                        {tUI('Delivery Address', 'डिलीवरी का पता')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-600 text-[20px]">location_on</span>
                        <input
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder={tUI('Warehouse, mandi, or address...', 'गोदाम, मंडी या पता...')}
                          className="w-full border-2 border-stone-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#E85D04] font-medium text-base"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!deliveryAddress || checkoutLoading}
                      className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                        deliveryAddress && !checkoutLoading
                          ? 'bg-[#E85D04] text-white hover:opacity-90 active:scale-95 shadow-lg'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {checkoutLoading
                        ? <><span className="material-symbols-outlined animate-spin">refresh</span> {tUI('Placing...', 'हो रहा है...')}</>
                        : <><span className="material-symbols-outlined text-[24px]">payments</span> {tUI('Confirm Order', 'ऑर्डर पक्का करें')}</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======== ORDERS ======== */}
        {view === 'orders' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-extrabold mb-1">{tUI('Track Your Orders', 'आपके ऑर्डर ट्रैक करें')}</h1>
            <p className="text-stone-500 text-sm mb-5">{tUI('View active shipments and purchase history.', 'सक्रिय शिपमेंट और खरीद इतिहास देखें।')}</p>
            {loadingOrders ? (
              <div className="text-center py-16"><span className="material-symbols-outlined text-[48px] animate-spin text-[#E85D04]">refresh</span></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <span className="material-symbols-outlined text-[64px] text-stone-200 block mb-2">assignment</span>
                <p className="font-bold text-stone-400">{tUI('No orders yet. Start shopping!', 'अभी कोई ऑर्डर नहीं।')}</p>
                <button onClick={() => setView('marketplace')} className="mt-4 bg-[#E85D04] text-white font-bold py-3 px-7 rounded-xl hover:opacity-90">
                  {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{CROP_EMOJI[order.crop] || '🌱'}</span>
                          <h3 className="font-extrabold text-lg">{order.crop}</h3>
                        </div>
                        <p className="text-sm text-stone-500">{tUI('Farmer', 'किसान')}: {order.farmerName} · {order.quantity} {order.unit}</p>
                        <p className="text-xs text-stone-400 mt-0.5">#{order.id.slice(-10).toUpperCase()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-[#E85D04]">₹{order.totalAmount.toLocaleString()}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-1 ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'in_transit' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'placed' ? 'bg-blue-100 text-blue-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {order.status === 'placed' ? tUI('Order Placed', 'ऑर्डर दिया') :
                           order.status === 'confirmed' ? tUI('Confirmed', 'पुष्टि') :
                           order.status === 'in_transit' ? tUI('In Transit', 'रास्ते में') :
                           order.status === 'delivered' ? tUI('Delivered ✓', 'डिलीवर ✓') : order.status}
                        </span>
                      </div>
                    </div>
                    {/* Progress stepper */}
                    <div className="flex items-center gap-0 mt-3 mb-3">
                      {['placed', 'confirmed', 'in_transit', 'delivered'].map((step, idx, arr) => {
                        const statuses = ['placed', 'confirmed', 'in_transit', 'delivered'];
                        const currentIdx = statuses.indexOf(order.status);
                        const done = idx <= currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all ${done ? 'bg-[#1B4332] text-white' : 'bg-stone-100 text-stone-400'}`}>
                              {done ? <span className="material-symbols-outlined text-[14px]">check</span> : idx + 1}
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`flex-1 h-1 ${done && idx < currentIdx ? 'bg-[#1B4332]' : 'bg-stone-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-50 p-2.5 rounded-lg">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{order.buyerLocation}</span>
                      <span>·</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======== POST DEMAND ======== */}
        {view === 'demand' && (
          <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-extrabold mb-1">{tUI('Post Buying Demand', 'खरीद की मांग पोस्ट करें')}</h1>
            <p className="text-stone-500 text-sm mb-6">{tUI('Tell farmers what you need and at what price. Matching farmers will respond to you.', 'किसानों को बताएं आपको क्या चाहिए और किस दाम पर।')}</p>

            {demandPosted ? (
              <div className="bg-white rounded-3xl p-10 border border-emerald-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="text-2xl font-extrabold mb-2">{tUI('Demand Posted!', 'मांग पोस्ट हो गई!')}</h2>
                <p className="text-stone-500 mb-6">{tUI('Farmers with matching produce will see your demand and respond.', 'मिलती-जुलती फसल वाले किसान आपकी मांग देखेंगे।')}</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => { setDemandPosted(false); setDemandCrop(''); setDemandQty(''); setDemandPrice(''); setDemandWindow(''); }} className="border-2 border-[#1B4332] text-[#1B4332] font-bold py-3 px-7 rounded-xl hover:bg-emerald-50">
                    {tUI('Post Another', 'और पोस्ट करें')}
                  </button>
                  <button onClick={() => setView('marketplace')} className="bg-[#1B4332] text-white font-bold py-3 px-7 rounded-xl hover:opacity-90 shadow-md">
                    {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-5">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">{tUI('Crop Required', 'आवश्यक फसल')}</label>
                  <input value={demandCrop} onChange={e => setDemandCrop(e.target.value)} placeholder={tUI('e.g. Soybean, Onion', 'उदा. सोयाबीन, प्याज़')} className="w-full border-2 border-stone-200 rounded-xl py-3.5 px-4 focus:border-[#E85D04] focus:outline-none font-medium text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">{tUI('Quantity (Quintals)', 'मात्रा (क्विंटल)')}</label>
                    <input value={demandQty} onChange={e => setDemandQty(e.target.value)} type="number" placeholder="0" className="w-full border-2 border-stone-200 rounded-xl py-3.5 px-4 focus:border-[#E85D04] focus:outline-none font-medium text-base" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">{tUI('Target Price (₹/q)', 'लक्ष्य मूल्य (₹/क्विं)')}</label>
                    <input value={demandPrice} onChange={e => setDemandPrice(e.target.value)} type="number" placeholder="₹ 0" className="w-full border-2 border-stone-200 rounded-xl py-3.5 px-4 focus:border-[#E85D04] focus:outline-none font-medium text-base" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">{tUI('Delivery Window', 'डिलीवरी समयसीमा')}</label>
                  <input value={demandWindow} onChange={e => setDemandWindow(e.target.value)} placeholder={tUI('e.g. Within 7 days', 'उदा. 7 दिन में')} className="w-full border-2 border-stone-200 rounded-xl py-3.5 px-4 focus:border-[#E85D04] focus:outline-none font-medium text-base" />
                </div>
                <button
                  onClick={handlePostDemand}
                  disabled={demandLoading || !demandCrop || !demandQty || !demandPrice}
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                    demandCrop && demandQty && demandPrice && !demandLoading
                      ? 'bg-[#E85D04] text-white hover:opacity-90 active:scale-95 shadow-lg'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {demandLoading
                    ? <><span className="material-symbols-outlined animate-spin">refresh</span> {tUI('Posting...', 'पोस्ट हो रहा...')}</>
                    : <><span className="material-symbols-outlined text-[24px]">post_add</span> {tUI('Post Demand', 'मांग पोस्ट करें')}</>
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-2 bg-white border-t border-stone-200 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { setView(item.id as View); if (item.id === 'orders') refreshOrders(); }}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${view === item.id ? 'text-[#E85D04]' : 'text-stone-400'}`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: view === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className={`text-[10px] ${view === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            {item.badge && (
              <span className="absolute -top-0.5 right-1 bg-[#E85D04] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ======== PRODUCT DETAIL / TRANSPARENCY DRAWER ======== */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-extrabold text-xl text-stone-900">{detailItem.crop}</h3>
              <button onClick={() => setDetailItem(null)} className="p-2 rounded-full hover:bg-stone-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Farmer profile */}
              <div className="flex items-center gap-4 bg-[#1B4332]/5 rounded-2xl p-4">
                <div className="w-14 h-14 rounded-full bg-[#1B4332]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1B4332] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div>
                  <p className="font-extrabold text-stone-900">{detailItem.farmerName}</p>
                  <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {detailItem.farmerLocation}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-xs text-emerald-700 font-bold">{tUI('Verified Farmer', 'सत्यापित किसान')}</span>
                  </div>
                </div>
              </div>

              {/* Quality details */}
              <div>
                <h4 className="font-bold text-stone-700 text-sm mb-3 uppercase tracking-wider">
                  🔍 {tUI('Crop Quality & Transparency', 'फसल गुणवत्ता और पारदर्शिता')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '💧', label: tUI('Moisture %', 'नमी %'), val: `${getQuality(detailItem.crop).moisturePct}%` },
                    { icon: '🌾', label: tUI('Grade', 'ग्रेड'), val: getQuality(detailItem.crop).grade },
                    { icon: '📅', label: tUI('Harvested', 'कटाई'), val: getQuality(detailItem.crop).harvestDate },
                    { icon: '🌱', label: tUI('Fertilizer', 'खाद'), val: isHi ? getQuality(detailItem.crop).fertilizerHi : getQuality(detailItem.crop).fertilizerUsed },
                    { icon: '✅', label: tUI('Organic', 'जैविक'), val: getQuality(detailItem.crop).certifiedOrganic ? tUI('Yes', 'हाँ') : tUI('No', 'नहीं') },
                    { icon: '📦', label: tUI('Available', 'उपलब्ध'), val: `${detailItem.quantity} ${detailItem.unit}` },
                  ].map(d => (
                    <div key={d.label} className="bg-stone-50 rounded-xl p-3 flex items-start gap-2">
                      <span className="text-lg shrink-0">{d.icon}</span>
                      <div>
                        <p className="text-[10px] text-stone-400 font-semibold uppercase">{d.label}</p>
                        <p className="text-sm font-bold text-stone-800">{d.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-[#E85D04] font-black text-3xl">₹{detailItem.pricePerUnit.toLocaleString()}</span>
                <span className="text-stone-400">/{detailItem.unit}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { openChat(detailItem); setDetailItem(null); }}
                  className="flex-1 py-4 border-2 border-[#1B4332] text-[#1B4332] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined">chat</span>
                  {tUI('Chat / Call', 'चैट / कॉल')}
                </button>
                <button
                  onClick={() => { handleAddToCart(detailItem); setDetailItem(null); }}
                  className="flex-1 py-4 bg-[#E85D04] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {tUI('Add to Cart', 'कार्ट में जोड़ें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== CHAT DRAWER ======== */}
      {chatItem && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setChatItem(null)} />
          <div className="relative bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Chat header */}
            <div className="bg-[#1B4332] text-white rounded-t-3xl px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">{chatItem.farmerName}</p>
                <p className="text-emerald-300 text-xs">{chatItem.crop} · {chatItem.farmerLocation}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:+919876543210`} className="p-2 rounded-full bg-emerald-700/50 hover:bg-emerald-600/50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
                <button className="p-2 rounded-full bg-emerald-700/50 hover:bg-emerald-600/50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">videocam</span>
                </button>
                <button onClick={() => setChatItem(null)} className="p-2 rounded-full bg-emerald-700/50 hover:bg-emerald-600/50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50" style={{ minHeight: '200px', maxHeight: '40vh' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.from === 'buyer'
                      ? 'bg-[#E85D04] text-white rounded-br-sm'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick questions */}
            <div className="px-4 py-2 bg-white border-t border-stone-100 overflow-x-auto">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">{tUI('Quick Questions', 'त्वरित सवाल')}</p>
              <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q.answerKey}
                    onClick={() => sendQuickQuestion(q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-xs font-semibold transition-colors"
                  >
                    {isHi ? q.hi : q.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-stone-100 flex gap-3 items-center">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={tUI('Type a message...', 'संदेश लिखें...')}
                className="flex-1 border-2 border-stone-200 rounded-full py-2.5 px-4 focus:border-[#1B4332] focus:outline-none text-sm font-medium"
              />
              <button
                onClick={sendMessage}
                className="w-11 h-11 rounded-full bg-[#1B4332] text-white flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
