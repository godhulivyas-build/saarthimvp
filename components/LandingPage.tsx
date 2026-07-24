import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, TrendingUp, Store } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import MandiPriceTicker from './landing/MandiPriceTicker';
import { LivePriceIntel } from './landing/LivePriceIntel';
import FarmerPhoneSection from './landing/FarmerPhoneSection';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { AppHeader } from './shared/AppHeader';
import { ExpandableGallery } from './ui/gallery-animation';
import { registeredFarmerCount } from '../services/farmerRegistry';
import { CROP_CATALOG } from '../services/cropCatalog';

function MiniBars() {
  return (
    <div className="mt-4 flex h-20 items-end gap-3">
      {[18, 40, 60, 84].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0.6 }}
          animate={{ height: h }}
          transition={{ delay: 0.3 + i * 0.12, type: 'spring' }}
          className="w-7 rounded-lg bg-gradient-to-t from-emerald-200 to-emerald-500"
        />
      ))}
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const navItems = [
    { name: lang === 'hi' ? 'भाव ट्रैकर' : 'Price Tracker', url: '#live-prices', icon: TrendingUp },
    { name: lang === 'hi' ? 'फ़ायदे' : 'Benefits', url: '#advantages', icon: Store },
  ];

  const galleryImages = [
    { src: '/images/farmer.png', alt: lang === 'hi' ? 'खेत में किसान' : 'Farmer in the field' },
    { src: '/images/field.png', alt: lang === 'hi' ? 'हरा-भरा खेत' : 'Green farmland' },
    { src: '/images/community.png', alt: lang === 'hi' ? 'गाँव समुदाय' : 'Village community' },
    { src: '/images/agritech.png', alt: lang === 'hi' ? 'कृषि तकनीक' : 'Agri-tech in use' },
  ];

  return (
    <div className="bg-background text-on-background font-['Lexend'] min-h-screen overflow-x-hidden">
      <MandiPriceTicker />
      <AppHeader navItems={navItems} />

      <main className="pb-12">
        {/* Hero Section — white background, real farmer photo kept, only real stats shown */}
        <section className="relative w-full overflow-hidden bg-white dark:bg-slate-900 py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: headline */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                  {t('landing.heroTitle')}
                </h1>
                <p className="mt-2 max-w-md text-slate-600 dark:text-emerald-200/80 text-lg leading-relaxed">
                  {t('landing.v2.heroBody')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="min-h-[56px] px-7 bg-emerald-900 hover:bg-emerald-800 text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  {t('landing.v2.ctaGo')}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => document.getElementById('live-prices')?.scrollIntoView({ behavior: 'smooth' })}
                  className="min-h-[56px] px-7 border-2 border-emerald-700 text-emerald-700 dark:border-emerald-500 dark:text-emerald-500 rounded-full font-semibold text-base flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">record_voice_over</span>
                  {t('landing.v2.ctaDidi')}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2 opacity-80">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {lang === 'hi' ? 'ज़मीनी सच्चाई पर बना' : 'Built on ground truth'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? '30+ किसानों से बातचीत · 15+ गाँवों तक पहुँच' : '30+ farmers interviewed · 15+ villages reached'}
                </span>
              </div>
            </div>

            {/* Right: card grid — one card carries the real farmer photo, the rest are honest, real numbers */}
            <div className="grid grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-1 rounded-2xl bg-gradient-to-b from-emerald-900 to-emerald-800 p-6 text-emerald-50 shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-700/60 p-2 ring-1 ring-white/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-emerald-200">
                    {lang === 'hi' ? 'ईमानदार भाव' : 'Honest Pricing'}
                  </span>
                </div>
                <div className="mt-6 text-lg leading-snug text-emerald-50/95">
                  {lang === 'hi'
                    ? 'सरकारी भाव से तुलना — कभी मनगढ़ंत नहीं'
                    : 'Compared to real government rates — never invented'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-1 relative overflow-hidden rounded-2xl shadow-lg min-h-[180px]"
              >
                <img
                  src="/hero_farmer.png"
                  alt={lang === 'hi' ? 'स्मार्टफोन के साथ भारतीय किसान' : 'Indian farmer with smartphone'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/10 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-5 text-white">
                  <p className="font-bold text-sm">{lang === 'hi' ? t('landing.v2.trust2b') : t('landing.v2.trust2a')}</p>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{lang === 'hi' ? t('landing.v2.trust1b') : t('landing.v2.trust1a')}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-1 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700"
              >
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? 'सारथी नेटवर्क' : 'Sarthi Network'}
                </div>
                <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {registeredFarmerCount()}+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? 'असली, पंजीकृत किसान' : 'real, registered farmers'}
                </div>
                <MiniBars />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-b from-teal-400 to-emerald-500 p-6 text-white shadow-lg flex flex-col justify-end min-h-[180px]"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute right-4 top-10 w-10 h-10 rounded-full bg-white/20" />
                <div className="relative">
                  <div className="text-sm text-white/90">{lang === 'hi' ? 'फसलें' : 'Crops'}</div>
                  <div className="text-xl font-medium leading-snug">
                    {lang === 'hi' ? `${CROP_CATALOG.length}+ अनाज से सब्ज़ी तक` : `${CROP_CATALOG.length}+ grains to vegetables`}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Real moments from the field */}
        <section className="bg-white dark:bg-slate-900 pb-8">
          <div className="mx-auto max-w-6xl px-6">
            <ExpandableGallery images={galleryImages} />
          </div>
        </section>

        <LivePriceIntel />

        {/* The Saarthi Advantage Section */}
        <section id="advantages" className="py-12 bg-background dark:bg-slate-900 border-t border-emerald-50 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-3 text-center mb-8">
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

        <FarmerPhoneSection />

      </main>

      {/* New Simple Footer */}
      <footer className="bg-[#fdf6f5] dark:bg-slate-950 py-10 px-6 text-center mt-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {lang === 'hi' ? 'किसानों तक हर दिन समृद्धि पहुंचाना' : 'Prosperity Delivered to Farmers Every Day'}
          </h2>

          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 mb-3">
            {lang === 'hi' ? 'भारत में ❤️ के साथ बनाया गया' : 'Carefully crafted with ❤️ in India'}
          </p>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-5">
            {lang === 'hi' ? 'ऑपरेशनल समय - सुबह 9 बजे से रात 9 बजे तक' : 'Operational Timing - 9 AM - 9 PM'}
          </p>

          <div className="flex items-center gap-4 mb-6">
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
