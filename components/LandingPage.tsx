import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';
import MandiPriceTicker from './landing/MandiPriceTicker';
import UserFlowIllustration from './landing/UserFlowIllustration';
import LiveMapSection from './landing/LiveMapSection';
import FarmerPhoneSection from './landing/FarmerPhoneSection';
import { TestimonialsSection } from './landing/TestimonialsSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  return (
    <div className="bg-background text-on-background font-['Lexend'] min-h-screen overflow-x-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b-2 border-emerald-100 dark:border-emerald-900 shadow-sm">
        <MandiPriceTicker />
        <div className="flex justify-between items-center px-6 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Sarthi Logo" className="w-12 h-12 rounded-xl shadow-sm bg-white p-1" />
              <span className="text-3xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">
                Sarthi
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <a className="text-emerald-900 dark:text-emerald-100 font-bold hover:text-emerald-600 transition-colors" href="#how-it-works">
                {t('landing.v2.navHow')}
              </a>
              <a className="text-emerald-700 dark:text-emerald-200 font-medium hover:text-emerald-600 transition-colors" href="#advantages">
                {t('landing.v2.navMandi')}
              </a>
              <a className="text-emerald-700 dark:text-emerald-200 font-medium hover:text-emerald-600 transition-colors" href="#map">
                {t('landing.v2.navNetworkMap')}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-primary hover:bg-emerald-800 text-white px-5 py-2 rounded-xl font-bold transition-transform active:scale-95 shadow-md flex items-center gap-2"
            >
              {t('landing.v2.login')}
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24"}}>arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-emerald-50/50 dark:bg-slate-900/50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="flex flex-col gap-4">
                <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-950 dark:text-white tracking-tight leading-tight">
                  {t('landing.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-emerald-800/80 dark:text-emerald-200/80 max-w-lg leading-relaxed">
                  {t('landing.v2.heroBody')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="min-h-[64px] px-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  {t('landing.v2.ctaGo')}
                </button>
                <button
                  onClick={() => navigate('/discover')}
                  className="min-h-[64px] px-8 border-2 border-emerald-700 text-emerald-700 dark:border-emerald-500 dark:text-emerald-500 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">record_voice_over</span>
                  {t('landing.v2.ctaDidi')}
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <img 
                  alt={lang === 'hi' ? "स्मार्टफोन के साथ भारतीय किसान" : "Indian farmer with smartphone"} 
                  className="w-full h-full object-cover" 
                  src="/hero_farmer.png"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-emerald-50 dark:border-emerald-900/50">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 dark:text-white text-sm">{lang === 'hi' ? t('landing.v2.trust2b') : t('landing.v2.trust2a')}</p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">{lang === 'hi' ? t('landing.v2.trust1b') : t('landing.v2.trust1a')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Saarthi Advantage Section */}
        <section id="advantages" className="py-20 bg-background dark:bg-slate-900 border-t border-emerald-50 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-4 text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white">{t('landing.advantage')}</h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'mic', title: t('landing.adv.booking'), desc: t('landing.adv.bookingDesc') },
                { icon: 'price_check', title: t('landing.adv.price'), desc: t('landing.adv.priceDesc') },
                { icon: 'storefront', title: t('landing.adv.local'), desc: t('landing.adv.localDesc') },
                { icon: 'schedule', title: t('landing.adv.updates'), desc: t('landing.adv.updatesDesc') },
              ].map((card) => (
                <div
                  key={card.icon}
                  className="bg-white dark:bg-slate-800 p-7 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-center flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                    <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <section id="map" className="py-20 bg-emerald-50 dark:bg-slate-900">
          <LiveMapSection />
        </section>

        <FarmerPhoneSection />

      </main>

      {/* New Simple Footer */}
      <footer className="bg-[#fdf6f5] dark:bg-slate-950 py-16 px-6 text-center mt-20">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {lang === 'hi' ? 'किसानों तक हर दिन समृद्धि पहुंचाना' : 'Prosperity Delivered to Farmers Every Day'}
          </h2>
          
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 mb-4">
            {lang === 'hi' ? 'भारत में ❤️ के साथ बनाया गया' : 'Carefully crafted with ❤️ in India'}
          </p>
          
          <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-8">
            {lang === 'hi' ? 'ऑपरेशनल समय - सुबह 9 बजे से रात 9 बजे तक' : 'Operational Timing - 9 AM - 9 PM'}
          </p>

          <div className="flex items-center gap-4 mb-12">
            <a href="#" className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="text-slate-600 dark:text-slate-400">@2026 Sarthi</span>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">{lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">{lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}</a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">{lang === 'hi' ? 'संपर्क जानकारी' : 'Contact Information'}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
