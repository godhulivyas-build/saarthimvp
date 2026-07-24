import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, state } = useAppState();
  const { t, lang } = useI18n();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // State for booking form
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [crop, setCrop] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  const [bookingStep, setBookingStep] = useState<'form' | 'options' | 'confirmed'>('form');

  const isHi = lang !== 'en';

  const tUI = (en: string, hi: string) => isHi ? hi : en;

  const handleConfirmForm = () => {
    if (pickup && destination && crop) {
      setBookingStep('options');
    } else {
      alert(tUI('Please fill pickup, destination, and crop.', 'कृपया पिकअप, मंज़िल और फसल भरें।'));
    }
  };

  const handleSelectTransport = () => {
    setBookingStep('confirmed');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-['Lexend'] min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 h-20 w-full bg-white dark:bg-slate-900 shadow-sm border-b border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Sarthi Logo" className="w-12 h-12 rounded-xl shadow-sm bg-emerald-50 p-1" />
          <div className="hidden md:block text-2xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">Sarthi</div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <LanguageSelector />
          <button className="p-2 md:p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-100 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48"}}>notifications</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 md:p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48"}}>logout</span>
            <span className="hidden md:block font-bold">{t('profile.logout')}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Farmer Personal Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0 border-4 border-emerald-50">
            <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-300 text-[48px]" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"}}>face</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950 dark:text-emerald-50 mb-1">
              {tUI('Welcome, Ramesh Kumar!', 'नमस्ते, रमेश कुमार!')}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-sm md:text-base text-emerald-800/80 dark:text-emerald-200/80 font-medium">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">location_on</span> {tUI('Indore, MP', 'इंदौर, मध्य प्रदेश')}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">translate</span> {tUI('Language: ', 'भाषा: ')} {lang === 'hi' ? 'हिन्दी' : 'English'}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex-1 md:flex-none bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">12</p>
              <p className="text-xs font-bold text-emerald-900/60 dark:text-emerald-100/60 uppercase tracking-wider">{tUI('Trips', 'ट्रिप्स')}</p>
            </div>
            <div className="flex-1 md:flex-none bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">3</p>
              <p className="text-xs font-bold text-amber-900/60 dark:text-amber-100/60 uppercase tracking-wider">{tUI('Orders', 'ऑर्डर')}</p>
            </div>
          </div>
        </section>

        {/* Primary Feature: Slot Booking */}
        <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2rem] p-6 md:p-10 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">local_shipping</span>
          </div>
          
          <div className="relative z-10">
            {bookingStep === 'form' && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <span className="material-symbols-outlined text-white text-[32px]">local_shipping</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold">{tUI('Book Transport Slot', 'ट्रांसपोर्ट स्लॉट बुक करें')}</h2>
                    <p className="text-emerald-200 text-sm md:text-base font-medium">{tUI('Get fair prices for logistics right from your farm.', 'अपने खेत से सीधे सही दाम पर लॉजिस्टिक्स पाएं।')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-emerald-200 text-sm font-bold">{tUI('Pickup Location', 'पिकअप स्थान')}</label>
                      <button onClick={() => setPickup('Indore Farm')} className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[14px]">my_location</span>
                        {tUI('Use GPS', 'GPS उपयोग करें')}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">my_location</span>
                      <input value={pickup} onChange={e => setPickup(e.target.value)} type="text" placeholder={tUI('Farm location...', 'खेत का स्थान...')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-12 pr-12 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-medium" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-300 hover:text-emerald-100 hover:scale-110 active:scale-95 transition-all bg-emerald-800/50 p-1.5 rounded-lg">mic</button>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Destination', 'मंज़िल (मंडी/गोदाम)')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">location_on</span>
                      <input value={destination} onChange={e => setDestination(e.target.value)} type="text" placeholder={tUI('Mandi or Warehouse...', 'मंडी या गोदाम...')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-12 pr-12 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-medium" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-300 hover:text-emerald-100 hover:scale-110 active:scale-95 transition-all bg-emerald-800/50 p-1.5 rounded-lg">mic</button>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-emerald-200 text-sm font-bold mb-2">{tUI('Crop & Qty', 'फसल और मात्रा')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">scale</span>
                      <input value={crop} onChange={e => setCrop(e.target.value)} type="text" placeholder={tUI('e.g. Wheat, 50q', 'उदा. गेहूं, 50q')} className="w-full bg-white/10 border border-emerald-500/30 rounded-xl py-3 pl-12 pr-12 text-white placeholder-emerald-300/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-medium" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-300 hover:text-emerald-100 hover:scale-110 active:scale-95 transition-all bg-emerald-800/50 p-1.5 rounded-lg">mic</button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isRoundTrip ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/50 group-hover:border-emerald-400 bg-white/10'}`}>
                      <input type="checkbox" checked={isRoundTrip} onChange={e => setIsRoundTrip(e.target.checked)} className="opacity-0 absolute" />
                      <span className={`material-symbols-outlined text-sm ${isRoundTrip ? 'text-white' : 'text-transparent'}`}>check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-50">{tUI('Round Trip', 'वापसी यात्रा (राउंड ट्रिप)')}</span>
                      <span className="text-xs text-emerald-300/80">{tUI('Bring back fertilizers/inputs', 'वापसी में उर्वरक/सामग्री लाएं')}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isShared ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/50 group-hover:border-emerald-400 bg-white/10'}`}>
                      <input type="checkbox" checked={isShared} onChange={e => setIsShared(e.target.checked)} className="opacity-0 absolute" />
                      <span className={`material-symbols-outlined text-sm ${isShared ? 'text-white' : 'text-transparent'}`}>check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-50">{tUI('Shared Transport', 'साझा परिवहन')}</span>
                      <span className="text-xs text-emerald-300/80">{tUI('Lower cost by sharing truck space', 'अन्य किसानों के साथ ट्रक साझा कर कम लागत')}</span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button onClick={handleConfirmForm} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg py-4 px-8 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"}}>check_circle</span>
                    {tUI('Find Transport', 'ट्रांसपोर्ट खोजें')}
                  </button>
                  <button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[28px]">mic</span>
                    {tUI('Voice Book', 'बोल कर बुक करें')}
                  </button>
                </div>
              </>
            )}

            {bookingStep === 'options' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setBookingStep('form')} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-2xl font-extrabold">{tUI('Transport Options', 'परिवहन विकल्प')}</h2>
                    <p className="text-emerald-200 text-sm font-medium">{tUI(`For ${crop} from ${pickup} to ${destination}`, `${pickup} से ${destination} तक ${crop} के लिए`)}</p>
                  </div>
                </div>

                <div className="grid gap-4 mb-6">
                  <div className="bg-white/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-900 p-3 rounded-xl">
                        <span className="material-symbols-outlined text-[32px] text-emerald-400">local_shipping</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Mini Truck (1-2 Tons)', 'छोटा ट्रक (1-2 टन)')}</h4>
                        <p className="text-sm text-emerald-200">{tUI('Arrives in 45 mins • Rated 4.8★', '45 मिनट में पहुंचेगा • रेटिंग 4.8★')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right flex-1 md:flex-none">
                        <div className="text-2xl font-black text-amber-400">₹1,200</div>
                        <div className="text-xs text-emerald-200 line-through">₹1,500</div>
                      </div>
                      <button onClick={handleSelectTransport} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors active:scale-95 shrink-0">
                        {tUI('Book', 'बुक करें')}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-900 p-3 rounded-xl">
                        <span className="material-symbols-outlined text-[32px] text-emerald-400">fire_truck</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{tUI('Large Truck (Shared)', 'बड़ा ट्रक (साझा)')}</h4>
                        <p className="text-sm text-emerald-200">{tUI('Arrives in 2 hrs • Cost effective', '2 घंटे में पहुंचेगा • कम लागत')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right flex-1 md:flex-none">
                        <div className="text-2xl font-black text-amber-400">₹800</div>
                        <div className="text-xs text-emerald-200">{tUI('Shared Price', 'साझा कीमत')}</div>
                      </div>
                      <button onClick={handleSelectTransport} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors active:scale-95 shrink-0">
                        {tUI('Book', 'बुक करें')}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-emerald-900/50 p-4 rounded-xl border border-emerald-500/30">
                  <span className="material-symbols-outlined text-amber-400">handshake</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{tUI('Want to negotiate?', 'क्या आप भाव कम करना चाहते हैं?')}</p>
                    <p className="text-xs text-emerald-200">{tUI('Suggest your price and drivers may accept it.', 'अपना दाम बताएं, ड्राइवर इसे स्वीकार कर सकते हैं।')}</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="₹" className="w-20 bg-white/10 border border-emerald-500/50 rounded-lg px-3 py-2 text-white focus:outline-none" />
                    <button className="bg-white/20 hover:bg-white/30 font-bold px-4 py-2 rounded-lg">{tUI('Offer', 'ऑफर दें')}</button>
                  </div>
                </div>
              </div>
            )}

            {bookingStep === 'confirmed' && (
              <div className="animate-in zoom-in duration-500 text-center py-8">
                <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                  <span className="material-symbols-outlined text-emerald-950 text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
                <h2 className="text-3xl font-black mb-2">{tUI('Booking Confirmed!', 'बुकिंग पक्की हो गई!')}</h2>
                <p className="text-emerald-200 mb-6">{tUI('Your transport is on the way.', 'आपका ट्रांसपोर्ट रास्ते में है।')}</p>
                
                <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-6 max-w-sm mx-auto mb-8">
                  <div className="text-sm text-emerald-300 font-bold mb-1">{tUI('Tracking ID', 'ट्रैकिंग आईडी')}</div>
                  <div className="text-2xl font-black text-amber-400 tracking-widest mb-4">TX-99210</div>
                  <div className="h-px bg-emerald-500/30 w-full mb-4"></div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-left">
                      <div className="text-emerald-300">{tUI('Vehicle', 'वाहन')}</div>
                      <div className="font-bold">MP09 AB 1234</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-300">{tUI('Driver', 'ड्राइवर')}</div>
                      <div className="font-bold">{tUI('Rajesh (4.8★)', 'राजेश (4.8★)')}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined">call</span>
                    {tUI('Call Driver', 'ड्राइवर को कॉल करें')}
                  </button>
                  <button onClick={() => { setBookingStep('form'); setPickup(''); setDestination(''); setCrop(''); }} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                    {tUI('Done', 'पूरा हुआ')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Secondary Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Ask Sarthi — the core discovery feature */}
          <button
            onClick={() => navigate('/discover')}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all text-left flex flex-col group text-white"
          >
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-[36px]" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{tUI('Ask Sarthi', 'सारथी से पूछें')}</h3>
            <p className="text-emerald-100 text-sm font-medium mb-6 flex-1">
              {tUI('Say what you have. Find nearby buyers and today\'s price.', 'बताएं आपके पास क्या है। आस-पास के खरीदार और आज का भाव पाएं।')}
            </p>
            <div className="flex items-center text-white font-bold gap-2">
              {tUI('Try it now', 'अभी आज़माएं')} <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </button>

          {/* Marketplace */}
          <button className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col group">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-[36px]" style={{fontVariationSettings: "'FILL' 1"}}>storefront</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tUI('Marketplace', 'मार्केटप्लेस')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 flex-1">
              {tUI('Buy fertilizers, seeds, and equipment at best prices.', 'उर्वरक, बीज और उपकरण सर्वोत्तम मूल्य पर खरीदें।')}
            </p>
            <div className="flex items-center text-emerald-600 font-bold gap-2">
              {tUI('Browse Shop', 'दुकान देखें')} <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </button>

          {/* Expert Advisors */}
          <button className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col group">
            <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-700 dark:text-blue-400 text-[36px]" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tUI('Expert Advisors', 'कृषि सलाहकार')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 flex-1">
              {tUI('Crop guidance, soil info, and disease support.', 'फसल मार्गदर्शन, मिट्टी की जानकारी और रोग सहायता।')}
            </p>
            <div className="flex items-center text-blue-600 font-bold gap-2">
              {tUI('Ask Expert', 'विशेषज्ञ से पूछें')} <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </button>

          {/* Weather */}
          <button className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col group">
            <div className="bg-amber-100 dark:bg-amber-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-amber-700 dark:text-amber-400 text-[36px]" style={{fontVariationSettings: "'FILL' 1"}}>cloud</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tUI('Local Weather', 'स्थानीय मौसम')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 flex-1">
              {tUI('28°C Sunny. Light rain expected at 4:00 PM.', '28°C धूप। शाम 4:00 बजे हल्की बारिश की उम्मीद है।')}
            </p>
            <div className="flex items-center text-amber-600 font-bold gap-2">
              {tUI('Full Forecast', 'पूरा पूर्वानुमान')} <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </button>

        </div>

        {/* Crop Listing & Negotiation Section */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-10 shadow-sm border border-emerald-100 dark:border-emerald-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-emerald-950 dark:text-white">{tUI('My Crop Listings & Negotiation', 'मेरी फसल लिस्टिंग और भाव-तोल')}</h2>
              <p className="text-emerald-700 dark:text-emerald-300 font-medium">{tUI('Set minimum prices and negotiate directly with buyers.', 'न्यूनतम दाम तय करें और खरीदारों से सीधे मोल-भाव करें।')}</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-colors active:scale-95 flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined">add</span>
              {tUI('List New Crop', 'नई फसल लिस्ट करें')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Listing Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-emerald-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <span className="material-symbols-outlined">grass</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tUI('Sharbati Wheat (Premium)', 'शरबती गेहूं (प्रीमियम)')}</h3>
                    <p className="text-sm text-slate-500 font-medium">50 Quintals</p>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{tUI('Active', 'सक्रिय')}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-bold mb-1">{tUI('Asking Price', 'मांगी गई कीमत')}</div>
                  <div className="text-lg font-black text-emerald-700">₹3,200 <span className="text-xs font-medium">/q</span></div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-bold mb-1">{tUI('Minimum (Floor) Price', 'न्यूनतम दाम')}</div>
                  <div className="text-lg font-black text-red-600">₹3,000 <span className="text-xs font-medium">/q</span></div>
                </div>
              </div>

              {/* Active Negotiation */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-bold text-emerald-950 dark:text-emerald-50">{tUI('Buyer Offer: Amit Trading', 'खरीदार का ऑफर: अमित ट्रेडिंग')}</div>
                  <div className="text-sm font-black text-amber-500">₹3,100 /q</div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition-colors">{tUI('Accept', 'स्वीकार करें')}</button>
                  <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg transition-colors">{tUI('Reject', 'अस्वीकार करें')}</button>
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg transition-colors">{tUI('Counter', 'काउंटर ऑफर')}</button>
                </div>
              </div>
            </div>

            {/* List New Crop Mock Form */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-emerald-100 dark:border-slate-700 opacity-70 hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                <span className="material-symbols-outlined text-[32px]">add_business</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{tUI('Ready to sell another crop?', 'क्या आप दूसरी फसल बेचने के लिए तैयार हैं?')}</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm">{tUI('List your produce, set a minimum acceptable price, and start receiving offers from verified buyers.', 'अपनी उपज लिस्ट करें, न्यूनतम स्वीकार्य कीमत तय करें और सत्यापित खरीदारों से ऑफर प्राप्त करना शुरू करें।')}</p>
              <button className="bg-white border-2 border-emerald-500 text-emerald-700 font-bold py-2 px-6 rounded-xl hover:bg-emerald-50 transition-colors">
                {tUI('Create Listing', 'लिस्टिंग बनाएं')}
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
