import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import { useV2Session } from '../state/v2Session';
import LanguageSelector from './LanguageSelector';
import type { ProduceItem, Order, BuyerDemand } from '../types';
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

const CROP_EMOJI: Record<string, string> = {
  Soybean: '🫘', Wheat: '🌾', Onion: '🧅', Tomato: '🍅', Potato: '🥔',
  Maize: '🌽', Garlic: '🧄', Cotton: '🌸', Mustard: '🌻', Rice: '🍚',
  Lentil: '🫘', Gram: '🫘', Coriander: '🌿',
};

const CROP_CATEGORY: Record<string, string[]> = {
  grains: ['Wheat', 'Rice', 'Maize', 'Soybean', 'Gram', 'Lentil', 'Mustard'],
  vegetables: ['Onion', 'Tomato', 'Potato', 'Garlic', 'Coriander', 'Green Chilli'],
};

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
  const [wantsNegotiation, setWantsNegotiation] = useState(false);
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

  useEffect(() => {
    refreshProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = (item: ProduceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.produceId === item.id);
      if (existing) {
        return prev.map(c => c.produceId === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        produceId: item.id,
        crop: item.crop,
        farmerName: item.farmerName,
        farmerLocation: item.farmerLocation,
        qty: 1,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
      }];
    });
  };

  const handleRemoveFromCart = (produceId: string) => {
    setCart(prev => prev.filter(c => c.produceId !== produceId));
  };

  const handleUpdateQty = (produceId: string, qty: number) => {
    if (qty <= 0) { handleRemoveFromCart(produceId); return; }
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
          const order = await placeOrder({
            produceId: item.produceId,
            buyerName,
            buyerLocation: deliveryAddress,
            quantity: item.qty,
          });
          ids.push(order.id);
        } catch { /* item may be out of stock */ }
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
      await createBuyerDemand({
        buyerName,
        buyerLocation,
        crop: demandCrop,
        quantity: Number(demandQty),
        unit: 'quintal',
        priceTarget: Number(demandPrice),
        deliveryWindow: demandWindow || tUI('Flexible', 'लचीला'),
      });
      setDemandPosted(true);
    } finally {
      setDemandLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.crop.toLowerCase().includes(searchQuery.toLowerCase()) || p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || getCropCategory(p.crop) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const cartItems = (
    <div className="space-y-3">
      {cart.map(item => (
        <div key={item.produceId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{CROP_EMOJI[item.crop] || '🌱'}</span>
            <div>
              <p className="font-bold text-sm">{item.crop}</p>
              <p className="text-xs text-slate-500">{item.farmerName} • {item.farmerLocation}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button onClick={() => handleUpdateQty(item.produceId, item.qty - 1)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600">-</button>
              <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
              <button onClick={() => handleUpdateQty(item.produceId, item.qty + 1)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600">+</button>
            </div>
            <div className="text-right min-w-[70px]">
              <p className="font-black text-[#E85D04] text-sm">₹{(item.qty * item.pricePerUnit).toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">₹{item.pricePerUnit.toLocaleString()}/{item.unit}</p>
            </div>
            <button onClick={() => handleRemoveFromCart(item.produceId)} className="text-slate-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-['Lexend'] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 py-6 bg-emerald-50 dark:bg-slate-950 h-screen w-64 border-r border-emerald-200 dark:border-slate-800 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-50">{tUI('Sarthi Portal', 'सारथी पोर्टल')}</h1>
          <p className="text-sm text-emerald-800/60 dark:text-slate-400">{buyerName}</p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {[
            { id: 'marketplace', icon: 'storefront', label: tUI('Marketplace', 'मार्केटप्लेस') },
            { id: 'cart', icon: 'shopping_cart', label: tUI('Cart & Checkout', 'कार्ट और चेकआउट'), badge: cartCount > 0 ? cartCount : null },
            { id: 'orders', icon: 'assignment', label: tUI('My Orders', 'मेरे ऑर्डर') },
            { id: 'demand', icon: 'post_add', label: tUI('Post Demand', 'मांग पोस्ट करें') },
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as View); if (item.id === 'orders') refreshOrders(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all relative ${view === item.id ? 'bg-emerald-900 text-white dark:bg-emerald-600 font-semibold' : 'text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[#E85D04] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={handleLogout}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-900 dark:text-emerald-300">logout</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{buyerName}</p>
                <p className="text-[10px] text-slate-500">{tUI('Tap to logout', 'लॉग आउट करें')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 relative">
        {/* TopBar */}
        <header className="flex justify-between items-center w-full px-5 h-16 bg-[#1B4332] dark:bg-slate-950 text-base sticky top-0 z-50 border-b border-emerald-800 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Sarthi" className="w-9 h-9 rounded-xl bg-white p-1" />
            <span className="text-xl font-bold text-white">Sarthi</span>
            <div className="hidden md:flex items-center gap-5 ml-6">
              {(['marketplace', 'orders', 'demand'] as View[]).map(v => (
                <button key={v} onClick={() => { setView(v); if (v === 'orders') refreshOrders(); }}
                  className={`text-sm font-medium transition-all ${view === v ? 'text-white border-b-2 border-white pb-0.5' : 'text-emerald-100/80 hover:text-white'}`}>
                  {v === 'marketplace' ? tUI('Marketplace', 'मार्केटप्लेस') : v === 'orders' ? tUI('Orders', 'ऑर्डर') : tUI('Post Demand', 'मांग पोस्ट')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button onClick={() => setView('cart')} className="relative p-2 text-white hover:bg-emerald-700/50 rounded-full transition-all">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1B4332]">{cartCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="p-2 text-white hover:bg-emerald-700/50 rounded-full transition-all">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* ======== MARKETPLACE ======== */}
        {view === 'marketplace' && (
          <div className="animate-in fade-in duration-300">
            <section className="p-5 space-y-5">
              {/* Search + filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xl">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-full border-2 border-slate-200 dark:border-slate-700 focus:border-[#E85D04] focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder={tUI('Search produce, farmers...', 'उपज, किसानों की खोज करें...')}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {(['all', 'grains', 'vegetables', 'other'] as const).map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === cat ? 'bg-[#E85D04] text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      {cat === 'all' ? tUI('All', 'सभी') : cat === 'grains' ? tUI('Grains', 'अनाज') : cat === 'vegetables' ? tUI('Vegetables', 'सब्ज़ियाँ') : tUI('Other', 'अन्य')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 relative h-44 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-emerald-900 to-emerald-700">
                  <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <span className="bg-[#E85D04] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mb-2">{tUI('Fresh Harvest', 'ताज़ी फसल')}</span>
                    <h2 className="text-white text-2xl font-bold mb-1">{tUI('Farm-to-Door Produce', 'खेत से दरवाज़े तक')}</h2>
                    <p className="text-white/80 text-sm">{tUI('Direct from verified farmers across India.', 'पूरे भारत के सत्यापित किसानों से सीधे।')}</p>
                  </div>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] opacity-30">🌾</span>
                </div>
                <div className="bg-[#e1d4fd] dark:bg-[#2d1f4a] rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-[#63597c] dark:text-purple-200 text-lg font-bold">{tUI('Market Trends', 'बाज़ार के रुझान')}</h3>
                    <p className="text-[#4b4263] dark:text-purple-300 mt-2 text-sm">{tUI(`${products.length} listings available from verified farmers.`, `${products.length} लिस्टिंग उपलब्ध।`)}</p>
                  </div>
                  <button onClick={() => setView('demand')} className="flex items-center gap-2 text-[#63597c] dark:text-purple-300 font-bold mt-4 text-sm hover:opacity-80">
                    <span className="material-symbols-outlined text-base">post_add</span>
                    <span>{tUI('Post Your Demand', 'मांग पोस्ट करें')}</span>
                  </button>
                </div>
              </div>

              {/* Product grid */}
              {loadingProducts ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-[56px] animate-spin text-[#E85D04]">refresh</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-[64px] block mb-2">search_off</span>
                  <p className="font-bold">{tUI('No produce found for your search.', 'कोई उपज नहीं मिली।')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProducts.map(item => {
                    const emoji = CROP_EMOJI[item.crop] || '🌱';
                    const inCart = cart.find(c => c.produceId === item.id);
                    return (
                      <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                        <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
                          <span className="text-[80px] group-hover:scale-110 transition-transform duration-500">{emoji}</span>
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{tUI('Verified', 'सत्यापित')}</span>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-emerald-700 dark:bg-emerald-800 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                            {item.quantity} {item.unit} {tUI('avail.', 'उपलब्ध')}
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg leading-tight">{item.crop}</h4>
                              <p className="text-slate-500 dark:text-slate-400 text-xs">{item.farmerName} • {item.farmerLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[#E85D04] font-bold text-2xl">₹{item.pricePerUnit.toLocaleString()}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs">/{item.unit}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={() => handleAddToCart(item)} className="flex-1 h-11 bg-[#E85D04] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm hover:opacity-90">
                              <span className="material-symbols-outlined text-lg">shopping_cart</span>
                              {inCart ? `${tUI('In Cart', 'कार्ट में')} (${inCart.qty})` : tUI('Add to Cart', 'कार्ट में जोड़ें')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ======== CART & CHECKOUT ======== */}
        {view === 'cart' && (
          <div className="p-5 md:p-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <button onClick={() => setView('marketplace')} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-5 font-bold hover:opacity-80">
              <span className="material-symbols-outlined">arrow_back</span>
              {tUI('Back to Marketplace', 'मार्केटप्लेस पर वापस')}
            </button>

            {orderConfirmed ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-emerald-100 dark:border-slate-700 text-center flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="text-3xl font-extrabold mb-2">{tUI('Order Placed Successfully!', 'ऑर्डर सफलतापूर्वक दे दिया गया!')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">{tUI('Farmers have been notified. Logistics will be arranged shortly.', 'किसानों को सूचित किया गया है। रसद जल्द तैयार होगी।')}</p>
                <div className="bg-emerald-50 dark:bg-slate-800 p-5 rounded-xl w-full max-w-sm mb-6 text-left border border-emerald-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">{tUI('Order ID(s)', 'ऑर्डर आईडी')}</p>
                  {placedOrderIds.map(id => (
                    <p key={id} className="text-lg font-black text-[#1B4332] dark:text-emerald-400 tracking-wider">#{id.slice(-10).toUpperCase()}</p>
                  ))}
                  <p className="text-xs font-bold text-slate-500 uppercase mt-3 mb-1">{tUI('Delivery Address', 'वितरण का पता')}</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{deliveryAddress}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setView('orders'); refreshOrders(); }} className="bg-white dark:bg-slate-800 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold py-3 px-7 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                    {tUI('Track Orders', 'ऑर्डर ट्रैक करें')}
                  </button>
                  <button onClick={() => { setOrderConfirmed(false); setDeliveryAddress(''); setView('marketplace'); }} className="bg-emerald-600 text-white font-bold py-3 px-7 rounded-xl hover:bg-emerald-700 shadow-md transition-colors">
                    {tUI('Continue Shopping', 'खरीदारी जारी रखें')}
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[80px] text-slate-200 dark:text-slate-700 block mb-3">shopping_cart</span>
                <h2 className="text-xl font-bold text-slate-500 mb-4">{tUI('Your cart is empty', 'आपका कार्ट खाली है')}</h2>
                <button onClick={() => setView('marketplace')} className="bg-[#E85D04] text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity">
                  {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-sm border border-emerald-100 dark:border-slate-700">
                <h1 className="text-3xl font-extrabold mb-7">{tUI('Your Cart', 'आपका कार्ट')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold mb-3 text-slate-700 dark:text-slate-300">{tUI('Items', 'आइटम')}</h3>
                      {cartItems}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500">{tUI('Items', 'आइटम')}</span>
                        <span className="font-bold">{cartCount}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-500">{tUI('Produce Value', 'उपज मूल्य')}</span>
                        <span className="font-bold text-[#E85D04]">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-3"></div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-extrabold">{tUI('Total', 'कुल')}</span>
                        <span className="font-black text-[#1B4332] dark:text-emerald-400">₹{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium flex items-start gap-2">
                      <span className="material-symbols-outlined text-base shrink-0">info</span>
                      {tUI('Logistics cost will be calculated after confirming your delivery address.', 'डिलीवरी पता पुष्टि के बाद लॉजिस्टिक्स लागत जोड़ी जाएगी।')}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold mb-3 text-slate-700 dark:text-slate-300">{tUI('Delivery Details', 'डिलीवरी विवरण')}</h3>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-600 text-[20px]">location_on</span>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder={tUI('Warehouse or mandi address...', 'गोदाम या मंडी का पता...')}
                          className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#E85D04] font-medium transition-all"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700" onClick={() => setWantsNegotiation(!wantsNegotiation)}>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${wantsNegotiation ? 'bg-[#E85D04] border-[#E85D04]' : 'border-slate-300 bg-white dark:bg-slate-900'}`}>
                        {wantsNegotiation && <span className="material-symbols-outlined text-white text-sm">check</span>}
                      </div>
                      <div>
                        <span className="text-sm font-bold">{tUI('I want to negotiate price', 'मैं कीमत पर मोल-भाव करना चाहता हूँ')}</span>
                        <span className="block text-xs text-slate-500">{tUI('Send offer to farmers', 'किसानों को प्रस्ताव भेजें')}</span>
                      </div>
                    </label>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!deliveryAddress || checkoutLoading}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${deliveryAddress && !checkoutLoading ? 'bg-[#E85D04] text-white hover:opacity-90 active:scale-95 shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                      {checkoutLoading
                        ? <><span className="material-symbols-outlined animate-spin">refresh</span> {tUI('Placing Order...', 'ऑर्डर हो रहा है...')}</>
                        : <><span className="material-symbols-outlined">payments</span> {tUI('Confirm & Place Order', 'पुष्टि करें और ऑर्डर दें')}</>
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
          <div className="p-5 md:p-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-extrabold mb-5">{tUI('My Orders', 'मेरे ऑर्डर')}</h1>
            {loadingOrders ? (
              <div className="text-center py-16"><span className="material-symbols-outlined text-[48px] animate-spin text-[#E85D04]">refresh</span></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[64px] text-slate-200 dark:text-slate-700 block mb-2">assignment</span>
                <p className="font-bold text-slate-500">{tUI('No orders yet. Start shopping!', 'अभी कोई ऑर्डर नहीं।')}</p>
                <button onClick={() => setView('marketplace')} className="mt-4 bg-[#E85D04] text-white font-bold py-2.5 px-7 rounded-xl hover:opacity-90">
                  {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{CROP_EMOJI[order.crop] || '🌱'}</span>
                          <h3 className="font-extrabold text-lg">{order.crop}</h3>
                        </div>
                        <p className="text-sm text-slate-500">{tUI('Farmer', 'किसान')}: {order.farmerName} • {order.quantity} {order.unit}</p>
                        <p className="text-xs text-slate-400 mt-0.5">#{order.id.slice(-10).toUpperCase()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-[#E85D04]">₹{order.totalAmount.toLocaleString()}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-1 ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          order.status === 'in_transit' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          order.status === 'placed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {order.status === 'placed' ? tUI('Order Placed', 'ऑर्डर दिया') :
                           order.status === 'confirmed' ? tUI('Confirmed', 'पुष्टि') :
                           order.status === 'packed' ? tUI('Packed', 'पैक') :
                           order.status === 'in_transit' ? tUI('In Transit', 'रास्ते में') :
                           order.status === 'delivered' ? tUI('Delivered', 'वितरित') :
                           order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{order.buyerLocation}</span>
                      <span>•</span>
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
          <div className="p-5 md:p-8 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h1 className="text-2xl font-extrabold mb-2">{tUI('Post Buying Demand', 'खरीद की मांग पोस्ट करें')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{tUI('Tell farmers what you need and at what price. They will reach out to you.', 'किसानों को बताएं आपको क्या चाहिए और किस दाम पर।')}</p>

            {demandPosted ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-emerald-100 dark:border-slate-700 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="text-2xl font-extrabold mb-2">{tUI('Demand Posted!', 'मांग पोस्ट हो गई!')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{tUI('Farmers with matching produce will see your demand.', 'मिलती-जुलती फसल वाले किसान आपकी मांग देखेंगे।')}</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => { setDemandPosted(false); setDemandCrop(''); setDemandQty(''); setDemandPrice(''); setDemandWindow(''); }} className="bg-white dark:bg-slate-800 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold py-3 px-7 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                    {tUI('Post Another', 'और पोस्ट करें')}
                  </button>
                  <button onClick={() => setView('marketplace')} className="bg-emerald-600 text-white font-bold py-3 px-7 rounded-xl hover:bg-emerald-700 shadow-md transition-colors">
                    {tUI('Browse Marketplace', 'मार्केटप्लेस देखें')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-emerald-100 dark:border-slate-700 shadow-sm space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{tUI('Crop Required', 'आवश्यक फसल')}</label>
                  <input value={demandCrop} onChange={e => setDemandCrop(e.target.value)} placeholder={tUI('e.g. Soybean, Onion', 'उदा. सोयाबीन, प्याज़')} className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 focus:border-[#E85D04] focus:outline-none font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{tUI('Quantity (Quintals)', 'मात्रा (क्विंटल)')}</label>
                    <input value={demandQty} onChange={e => setDemandQty(e.target.value)} type="number" placeholder="0" className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 focus:border-[#E85D04] focus:outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{tUI('Target Price (₹/q)', 'लक्ष्य मूल्य (₹/क्विंटल)')}</label>
                    <input value={demandPrice} onChange={e => setDemandPrice(e.target.value)} type="number" placeholder="₹ 0" className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 focus:border-[#E85D04] focus:outline-none font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">{tUI('Delivery Window', 'डिलीवरी की समयसीमा')}</label>
                  <input value={demandWindow} onChange={e => setDemandWindow(e.target.value)} placeholder={tUI('e.g. Within 7 days, This week', 'उदा. 7 दिन में, इस हफ्ते')} className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 focus:border-[#E85D04] focus:outline-none font-medium" />
                </div>
                <button onClick={handlePostDemand} disabled={demandLoading || !demandCrop || !demandQty || !demandPrice} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${demandCrop && demandQty && demandPrice && !demandLoading ? 'bg-[#E85D04] text-white hover:opacity-90 active:scale-95 shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                  {demandLoading
                    ? <><span className="material-symbols-outlined animate-spin">refresh</span> {tUI('Posting...', 'पोस्ट हो रहा...')}</>
                    : <><span className="material-symbols-outlined">post_add</span> {tUI('Post Demand', 'मांग पोस्ट करें')}</>
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
        {[
          { id: 'marketplace', icon: 'storefront', label: tUI('Shop', 'दुकान') },
          { id: 'cart', icon: 'shopping_cart', label: tUI('Cart', 'कार्ट'), badge: cartCount > 0 ? cartCount : null },
          { id: 'orders', icon: 'assignment', label: tUI('Orders', 'ऑर्डर') },
          { id: 'demand', icon: 'post_add', label: tUI('Demand', 'मांग') },
        ].map(item => (
          <button key={item.id} onClick={() => { setView(item.id as View); if (item.id === 'orders') refreshOrders(); }} className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all ${view === item.id ? 'text-[#E85D04]' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: view === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className={`text-[10px] ${view === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            {item.badge && (
              <span className="absolute -top-0.5 right-1 bg-[#E85D04] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
