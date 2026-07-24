import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang, t } = useI18n();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => isHi ? hi : en;

  const [cart, setCart] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickAdd = (price: number) => {
    setCart(cart + 1);
    setTotal(total + price);
  };

  const handleCheckout = () => {
    if (cart > 0) setIsCheckout(true);
  };

  const handlePlaceOrder = () => {
    setOrderConfirmed(true);
  };

  const handleBackToShopping = () => {
    setIsCheckout(false);
    setOrderConfirmed(false);
    setCart(0);
    setTotal(0);
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-['Lexend'] overflow-x-hidden">
      {/* SideNavBar (Desktop Only) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 py-6 bg-emerald-50 dark:bg-slate-950 h-screen w-64 border-r border-emerald-200 dark:border-slate-800 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-50">{tUI('Sarthi Portal', 'सारथी पोर्टल')}</h1>
          <p className="text-sm text-emerald-800/60 dark:text-slate-400">{tUI('Empowering Growth', 'विकास को सशक्त बनाना')}</p>
        </div>
        <nav className="flex-1 space-y-2">
          <a onClick={() => setIsCheckout(false)} className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${!isCheckout ? 'bg-emerald-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-semibold' : 'text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>dashboard</span>
            <span className="text-sm">{tUI('Dashboard', 'डैशबोर्ड')}</span>
          </a>
          <a className="flex items-center gap-3 text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900 rounded-lg mx-2 px-4 py-3 transition-colors active:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>local_shipping</span>
            <span className="text-sm">{tUI('Bookings', 'बुकिंग्स')}</span>
          </a>
          <a className="flex items-center gap-3 text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900 rounded-lg mx-2 px-4 py-3 transition-colors active:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>payments</span>
            <span className="text-sm">{tUI('Earnings', 'कमाई')}</span>
          </a>
          <a className="flex items-center gap-3 text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900 rounded-lg mx-2 px-4 py-3 transition-colors active:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>inventory_2</span>
            <span className="text-sm">{tUI('Inventory', 'इन्वेंट्री')}</span>
          </a>
          <a className="flex items-center gap-3 text-emerald-800 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-slate-900 rounded-lg mx-2 px-4 py-3 transition-colors active:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>settings</span>
            <span className="text-sm">{tUI('Settings', 'सेटिंग्स')}</span>
          </a>
        </nav>
        <div className="px-4 mt-auto">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleLogout}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-900">logout</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">{tUI('Pro Buyer', 'प्रो खरीदार')}</p>
                <p className="text-[10px] text-on-surface-variant">{t('profile.logout')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 relative">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-5 h-20 bg-[#1B4332] dark:bg-slate-950 text-base sticky top-0 z-50 border-b border-emerald-800 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Sarthi Logo" className="w-10 h-10 rounded-xl shadow-sm bg-white p-1" />
            <span className="text-2xl font-bold text-white tracking-tight">Sarthi</span>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <a onClick={() => setIsCheckout(false)} className={`cursor-pointer ${!isCheckout ? 'text-white border-b-2 border-white pb-1' : 'text-emerald-100/80 hover:text-white'} transition-all`}>{tUI('Marketplace', 'मार्केटप्लेस')}</a>
              <a className="text-emerald-100/80 hover:bg-emerald-700/50 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all cursor-pointer">{tUI('Orders', 'ऑर्डर')}</a>
              <a className="text-emerald-100/80 hover:bg-emerald-700/50 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all cursor-pointer">{tUI('Reports', 'रिपोर्ट्स')}</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button onClick={handleCheckout} className="relative p-2 text-white hover:bg-emerald-700/50 rounded-full transition-all active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cart > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1B4332]">{cart}</span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-emerald-200 overflow-hidden cursor-pointer" onClick={handleLogout}>
              <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCt4rHSkAnYg24iB41_mh-JSaX2qlkVmYkiGso21hLBbP4eATSH6Du3fFUTv0mK08wGn_Won8zU14EFuY0RryJcOMB63Dsyvs0ZXPaxbKKPLQqlTfcHmBjuN3Q6s4s1NRILJqVMiNWjXq8wl8ourqKpR_c3aBKbf2YTyL5cTxpDeaDp2i4t2PDdRokQWEC0o-tn2IVAkpCSQZdKiXUM6OjKyNaW0oYh_xmtQb0y0ABlaFzJHzNF9z0r45OeKj2ay4TUvzFNt4iaos"/>
            </div>
          </div>
        </header>

        {!isCheckout ? (
          <div className="animate-in fade-in duration-500">
            {/* Search and Filter Section */}
            <section className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-2xl">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-outline-variant focus:border-[#E85D04] focus:ring-0 bg-surface-container-lowest text-on-surface" placeholder={tUI("Search for fresh produce, farmers, or locations...", "ताज़ी उपज, किसानों या स्थानों की खोज करें...")} type="text"/>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:scale-110 active:scale-95 transition-all bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">mic</button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  <button className="whitespace-nowrap px-6 py-2 rounded-full bg-[#E85D04] text-white font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">{tUI('All Produce', 'सभी उपज')}</button>
                  <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-all">{tUI('Grains', 'अनाज')}</button>
                  <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-all">{tUI('Vegetables', 'सब्ज़ियाँ')}</button>
                  <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-all">{tUI('Fruits', 'फल')}</button>
                </div>
              </div>

              {/* Dashboard Stats / Featured */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative h-48 rounded-3xl overflow-hidden shadow-lg group">
                  <img alt="Market banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA14exxAIMxpnDNmx4wNdnDVYgNwqdrSn-1ghE2MRwi-7Hfe66H1fqmevGHG9hA40EMREbVMJyy5RIeuNdzI1QP02BV_m3CH1qQcydOoTV44IfZVOBMyxxEwCWRJ-Y5hvt5LPpjrZFkdl5QlLZp_ZkgFQAIFsBltuI4DaIQXlSLbVXQgdrEex7t0TE9vA7C1XgaaR6aeRs5e2wBQDfaGJGNdZKIp76PAl5aa1AbcFdQf36qQRbVJg09sbjj0vBqBWa-2_Xfl9KfgMY"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8">
                    <span className="bg-[#E85D04] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mb-2">{tUI('Seasonal Pick', 'मौसमी पसंद')}</span>
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">{tUI('Premium Sharbati Wheat', 'प्रीमियम शरबती गेहूं')}</h2>
                    <p className="text-white/80 max-w-sm">{tUI('Directly from the fertile plains of Madhya Pradesh. Freshly harvested this week.', 'मध्य प्रदेश के उपजाऊ मैदानों से सीधे। इस सप्ताह ताज़ा काटा गया।')}</p>
                  </div>
                </div>
                <div className="bg-[#e1d4fd] rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-[#63597c]/10">
                  <div>
                    <h3 className="text-[#63597c] text-xl font-bold">{tUI('Market Trends', 'बाज़ार के रुझान')}</h3>
                    <p className="text-[#4b4263] mt-2">{tUI('Prices for Onions are down by 12% today.', 'आज प्याज की कीमतों में 12% की गिरावट आई है।')}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#63597c] font-bold mt-4 cursor-pointer hover:opacity-80">
                    <span className="material-symbols-outlined">trending_down</span>
                    <span>{tUI('Check Opportunities', 'अवसर देखें')}</span>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pt-4">
                {/* Product Card 1: Wheat */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
                  <div className="relative h-56 overflow-hidden">
                    <img alt="Wheat grains" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOr4HODaDIHLB_lqIPmv47WUh4AM-YByGzAgeaFslPo3iEqhr2uzzoYmOZlY_V8nOC6kQjHGwN1BwhxO_dlP_5oecefGZZHnCe2ivq5keHNIARJDUIFUOcySQTkKDUwNzSU80FErQn5HmHI60QCKo2JXNIl5O_PeGvLB3eETs4j8Jum-X_zdLNvw8lRgxEAbXG692bMCzAEhN_JhspVc_GunmmoSKKVv8cNZOtdxO_G9QHuyuZnRTwZGCBZ4l96AtvZUEW4s6-Mpg"/>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-green-600 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>verified</span>
                      <span className="text-[10px] font-bold">{tUI('Verified Farmer', 'सत्यापित किसान')}</span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-[#E85D04] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {tUI('Bulk Discount Available', 'थोक छूट उपलब्ध है')}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Lokwan Wheat', 'लोकवन गेहूं')}</h4>
                        <p className="text-on-surface-variant text-xs">{tUI('Farmer: Rajesh Kumar • Vidisha, MP', 'किसान: राजेश कुमार • विदिशा, म.प्र.')}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-yellow-700 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>star</span>
                        <span className="text-xs font-bold text-yellow-800">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#E85D04] font-bold text-2xl">₹2,450</span>
                      <span className="text-on-surface-variant text-xs">{tUI('/ Quintal', '/ क्विंटल')}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                      <button onClick={() => handleQuickAdd(2450)} className="flex-1 h-12 bg-[#E85D04] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        {tUI('Quick Add', 'जल्दी जोड़ें')}
                      </button>
                      <button className="w-12 h-12 border-2 border-[#E85D04] text-[#E85D04] rounded-2xl flex items-center justify-center hover:bg-[#E85D04]/5 active:scale-90 transition-all">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Card 2: Tomatoes */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
                  <div className="relative h-56 overflow-hidden">
                    <img alt="Fresh tomatoes" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRIaGSqLvVwGUckQrY_zfgGjAXDY6OOfYoqjHtIyNqI4BWBrpjhZdJm913-MpqDN8HWzKTXcognwVuTxENkvu0gdOQdcRrVSYYTbdn49HlfIemw3s9M4mOsu2PIHcibO61IQ9msM21GYCH4AyndB7SBCfYZbA7v7IIpkEeQ-_DKwLIJ5OQhj49uHnZc5pEo5wftf94fueUjxi9cGVWLNiKvtdiZfrF9r_T0xrb66KLqk2t69UKLRgblfo3fbBBtuobpaktbXuh-ME"/>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-green-600 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>verified</span>
                      <span className="text-[10px] font-bold">{tUI('Organic Certified', 'जैविक प्रमाणित')}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Hybrid Tomatoes', 'हाइब्रिड टमाटर')}</h4>
                        <p className="text-on-surface-variant text-xs">{tUI('Farmer: Sunita Devi • Nasik, MH', 'किसान: सुनीता देवी • नासिक, महा.')}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-yellow-700 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>star</span>
                        <span className="text-xs font-bold text-yellow-800">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#E85D04] font-bold text-2xl">₹1,800</span>
                      <span className="text-on-surface-variant text-xs">{tUI('/ Quintal', '/ क्विंटल')}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                      <button onClick={() => handleQuickAdd(1800)} className="flex-1 h-12 bg-[#E85D04] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        {tUI('Quick Add', 'जल्दी जोड़ें')}
                      </button>
                      <button className="w-12 h-12 border-2 border-[#E85D04] text-[#E85D04] rounded-2xl flex items-center justify-center hover:bg-[#E85D04]/5 active:scale-90 transition-all">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Card 3: Onions */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
                  <div className="relative h-56 overflow-hidden">
                    <img alt="Red onions" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOj9jMcDQCHrUM7D4g6iojelwv_RgM6TlGdEKvBObha4qrox77UvWg-_MbziRf002T5rQa8K-eW4WxEd5ijtMWBl6lCWokxTaRLw_IuDRtPOfIbr9iYMupmDbSQkK46yGWA3EKzTrHBwJ-obfK0VPJTenQbBKHfr8aWlOwzIAdmnpFYU2Zpo6HCDcqHJlqEtYYmc5eJEe9cjYwhOZs_q6lqNyj3PMxSU9eIXfFN2IpPmbLi4sjGAi7OvELDOHA-x3nOxzkVuabENg"/>
                    <div className="absolute bottom-4 left-4 bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {tUI('Price Drop: -12%', 'मूल्य में गिरावट: -12%')}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Red Nashik Onions', 'लाल नासिक प्याज')}</h4>
                        <p className="text-on-surface-variant text-xs">{tUI('Farmer: Anil Deshmukh • Pune, MH', 'किसान: अनिल देशमुख • पुणे, महा.')}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-yellow-700 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>star</span>
                        <span className="text-xs font-bold text-yellow-800">4.7</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#E85D04] font-bold text-2xl">₹2,100</span>
                      <span className="text-on-surface-variant text-xs">{tUI('/ Quintal', '/ क्विंटल')}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                      <button onClick={() => handleQuickAdd(2100)} className="flex-1 h-12 bg-[#E85D04] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        {tUI('Quick Add', 'जल्दी जोड़ें')}
                      </button>
                      <button className="w-12 h-12 border-2 border-[#E85D04] text-[#E85D04] rounded-2xl flex items-center justify-center hover:bg-[#E85D04]/5 active:scale-90 transition-all">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Card 4: Basmati Rice */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
                  <div className="relative h-56 overflow-hidden">
                    <img alt="Basmati rice" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz6NbIB2q73PPaFVhRVcg0Mcm7haInz9LyQS-YVhb8i_M6g4QX6SH7ZsSgcpgP8rbS7E2OxWQWNmUlB2yEIRzG59Kv-n-0a8ibhZKKz0oWCbZWqTD_JBQ1kAHE70byK5ljjK5AUPKQKY_PriR3a3lWjZ3pxu2ekn50EoMB1lcD45F_e2B4e61Cg3TZurFt4mBka3upR2I2W5yeOkqGwfkuJdnp7DVAQDePAgvR9QlaK4e8-5l99oOXglQr29o19Ew1ukzicMFf8PM"/>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-green-600 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>verified</span>
                      <span className="text-[10px] font-bold">{tUI('Grade A++', 'ग्रेड A++')}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Basmati Rice 1121', 'बासमती चावल 1121')}</h4>
                        <p className="text-on-surface-variant text-xs">{tUI('Farmer: Gurbaksh Singh • Amritsar, PB', 'किसान: गुरबक्श सिंह • अमृतसर, पं.')}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-yellow-700 text-sm" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>star</span>
                        <span className="text-xs font-bold text-yellow-800">5.0</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#E85D04] font-bold text-2xl">₹9,500</span>
                      <span className="text-on-surface-variant text-xs">{tUI('/ Quintal', '/ क्विंटल')}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                      <button onClick={() => handleQuickAdd(9500)} className="flex-1 h-12 bg-[#E85D04] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        {tUI('Quick Add', 'जल्दी जोड़ें')}
                      </button>
                      <button className="w-12 h-12 border-2 border-[#E85D04] text-[#E85D04] rounded-2xl flex items-center justify-center hover:bg-[#E85D04]/5 active:scale-90 transition-all">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <button onClick={() => setIsCheckout(false)} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-6 font-bold hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">arrow_back</span>
              {tUI('Back to Marketplace', 'मार्केटप्लेस पर वापस जाएं')}
            </button>

            {!orderConfirmed ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-emerald-100 dark:border-slate-800">
                <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-white mb-8">{tUI('Complete Your Order', 'अपना ऑर्डर पूरा करें')}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-4">{tUI('Order Summary', 'ऑर्डर सारांश')}</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 dark:text-slate-400">{tUI('Total Items', 'कुल आइटम')}</span>
                          <span className="font-bold">{cart}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600 dark:text-slate-400">{tUI('Produce Value', 'उपज मूल्य')}</span>
                          <span className="font-bold text-[#E85D04]">₹{total.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 w-full mb-4"></div>
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-extrabold">{tUI('Total Payment', 'कुल भुगतान')}</span>
                          <span className="font-black text-[#1B4332] dark:text-emerald-400">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium flex items-start gap-2">
                        <span className="material-symbols-outlined text-base">info</span>
                        {tUI('Logistics will be calculated based on your delivery location and weight after confirmation.', 'रसद की गणना आपकी डिलीवरी के स्थान और वजन के आधार पर पुष्टि के बाद की जाएगी।')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-4">{tUI('Delivery Details', 'डिलिवरी विवरण')}</h3>
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{tUI('Delivery Location', 'वितरण स्थान')}</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-600">location_on</span>
                            <input 
                              type="text" 
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              placeholder={tUI('Enter warehouse or mandi address...', 'गोदाम या मंडी का पता दर्ज करें...')} 
                              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-12 text-slate-900 dark:text-white focus:outline-none focus:border-[#E85D04] transition-all font-medium" 
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 hover:text-[#E85D04] hover:scale-110 active:scale-95 transition-all bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg">mic</button>
                          </div>
                        </div>

                        {/* Negotiate Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="w-6 h-6 rounded border-2 border-slate-300 group-hover:border-[#E85D04] bg-white flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-sm text-transparent">check</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{tUI('I want to negotiate the price', 'मैं कीमत पर मोल-भाव करना चाहता हूँ')}</span>
                            <span className="text-xs text-slate-500">{tUI('Send an offer to the farmers', 'किसानों को एक प्रस्ताव भेजें')}</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button onClick={handlePlaceOrder} disabled={!deliveryAddress} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${deliveryAddress ? 'bg-[#E85D04] text-white hover:opacity-90 active:scale-95 shadow-md cursor-pointer' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                      <span className="material-symbols-outlined">payments</span>
                      {tUI('Confirm & Place Order', 'पुष्टि करें और ऑर्डर दें')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-emerald-100 dark:border-slate-800 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="material-symbols-outlined text-[64px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
                <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-white mb-2">{tUI('Order Successfully Placed!', 'ऑर्डर सफलतापूर्वक रखा गया!')}</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">{tUI('Your produce request has been sent to the farmers. You will be notified once logistics are assigned.', 'आपके उपज का अनुरोध किसानों को भेज दिया गया है। रसद सौंपे जाने के बाद आपको सूचित किया जाएगा।')}</p>
                
                <div className="bg-emerald-50 dark:bg-slate-800 p-6 rounded-xl w-full max-w-md mb-8 border border-emerald-100 dark:border-slate-700 text-left">
                  <p className="text-sm text-slate-500 font-bold mb-1 uppercase">{tUI('Order ID', 'ऑर्डर आईडी')}</p>
                  <p className="text-2xl font-black text-[#1B4332] dark:text-emerald-400 mb-4 tracking-wider">ORD-88392X</p>
                  <p className="text-sm text-slate-500 font-bold mb-1 uppercase">{tUI('Delivery Address', 'वितरण का पता')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{deliveryAddress}</p>
                </div>

                <div className="flex gap-4">
                  <button className="bg-white border-2 border-emerald-600 text-emerald-700 font-bold py-3 px-8 rounded-xl hover:bg-emerald-50 transition-colors">
                    {tUI('Track Order', 'ऑर्डर ट्रैक करें')}
                  </button>
                  <button onClick={handleBackToShopping} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-colors shadow-md">
                    {tUI('Back to Marketplace', 'मार्केटप्लेस पर वापस')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800 shadow-[0_-4px_10px_rgba(27,67,50,0.1)] pb-safe">
        <a onClick={() => setIsCheckout(false)} className={`flex flex-col items-center justify-center rounded-xl px-6 py-2 transition-all cursor-pointer ${!isCheckout ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100' : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>home</span>
          <span className="text-xs font-medium">{tUI('Home', 'होम')}</span>
        </a>
        <a onClick={handleCheckout} className={`relative flex flex-col items-center justify-center px-4 py-2 transition-all cursor-pointer ${isCheckout ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>shopping_cart</span>
          <span className="text-xs font-medium">{tUI('Cart', 'कार्ट')}</span>
          {cart > 0 && (
            <span className="absolute top-1 right-2 bg-[#E85D04] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart}</span>
          )}
        </a>
        <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 active:scale-90 transition-transform duration-150 cursor-pointer">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>assignment</span>
          <span className="text-xs font-medium">{tUI('Orders', 'ऑर्डर')}</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 active:scale-90 transition-transform duration-150 cursor-pointer" onClick={handleLogout}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>logout</span>
          <span className="text-xs font-medium">{tUI('Logout', 'लॉग आउट')}</span>
        </a>
      </nav>

      {/* FAB for Quick Actions (Mobile Contextual) */}
      {!isCheckout && (
        <button onClick={handleCheckout} className="md:hidden fixed right-6 bottom-24 w-14 h-14 bg-[#E85D04] text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
          {cart > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-[#E85D04] text-[12px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-sm">{cart}</span>
          )}
        </button>
      )}
    </div>
  );
};
