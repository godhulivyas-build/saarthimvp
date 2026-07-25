import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, TrendingUp, Store, Instagram, Linkedin, MessageCircle, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useTr, type Tr } from '../i18n/useTr';
import MandiPriceTicker from './landing/MandiPriceTicker';
import { LivePriceIntel } from './landing/LivePriceIntel';
import FarmerPhoneSection from './landing/FarmerPhoneSection';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { AppHeader } from './shared/AppHeader';
import { ExpandableGallery, type GalleryItem } from './ui/gallery-animation';
import { InstagramEmbed } from './ui/InstagramEmbed';
import { registeredFarmerCount } from '../services/farmerRegistry';
import { CROP_CATALOG } from '../services/cropCatalog';

const SOCIAL_LINKS = {
  whatsappGroup: 'https://chat.whatsapp.com/JVSOHA8tcPF8keE9MREzGa',
  instagram: 'https://www.instagram.com/saarthi_ind/',
  linkedinCompany: 'https://www.linkedin.com/company/sarthi-setu/',
  linkedinFounder: 'https://www.linkedin.com/in/godhuli-vyas-4b7128253/',
  instagramReelPermalink: 'https://www.instagram.com/reel/DYjPf3-hw_F/',
};

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

/** Floating WhatsApp group button — click opens a small popup card before leaving the site. */
function WhatsAppFab({ tr }: { tr: Tr }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900 p-4"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label={tr('Close', 'बंद करें', 'ಮುಚ್ಚಿ', 'మూసివేయండి', 'மூடு')}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              {tr(
                'Sarthi Farmer Community',
                'सारथी किसान समुदाय',
                'ಸಾರಥಿ ರೈತ ಸಮುದಾಯ',
                'సార్థి రైతు సంఘం',
                'சார்தி விவசாயி சமூகம்'
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              {tr(
                'Join for live prices, advice, and support from real farmers.',
                'भाव, सलाह और सहायता के लिए हमारे किसान समुदाय से जुड़ें।',
                'ಬೆಲೆ, ಸಲಹೆ ಮತ್ತು ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ರೈತ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ.',
                'ధరలు, సలహాలు మరియు సహాయం కోసం మా రైతు సంఘంలో చేరండి.',
                'விலைகள், ஆலோசனை மற்றும் உதவிக்காக எங்கள் விவசாயி சமூகத்தில் இணையுங்கள்.'
              )}
            </p>
            <a
              href={SOCIAL_LINKS.whatsappGroup}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {tr('Join Now', 'अभी जुड़ें', 'ಈಗ ಸೇರಿ', 'ఇప్పుడే చేరండి', 'இப்போது இணையுங்கள்')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={tr(
          'Join our WhatsApp group',
          'WhatsApp ग्रुप जॉइन करें',
          'ನಮ್ಮ WhatsApp ಗುಂಪಿಗೆ ಸೇರಿ',
          'మా WhatsApp గ్రూప్‌లో చేరండి',
          'எங்கள் WhatsApp குழுவில் இணையுங்கள்'
        )}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
      </button>
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const tr = useTr();

  const navItems = [
    { name: tr('Price Tracker', 'भाव ट्रैकर', 'ಬೆಲೆ ಟ್ರ್ಯಾಕರ್', 'ధర ట్రాకర్', 'விலை டிராக்கர்'), url: '#live-prices', icon: TrendingUp },
    { name: tr('Benefits', 'फ़ायदे', 'ಪ್ರಯೋಜನಗಳು', 'ప్రయోజనాలు', 'நன்மைகள்'), url: '#advantages', icon: Store },
  ];

  const galleryItems: GalleryItem[] = [
    {
      type: 'video',
      src: '/images/Home-page/videos/field-visit-1.mp4',
      alt: tr('Field visit video', 'फील्ड विज़िट वीडियो', 'ಕ್ಷೇತ್ರ ಭೇಟಿ ವೀಡಿಯೊ', 'క్షేత్ర సందర్శన వీడియో', 'வயல் வருகை வீடியோ'),
    },
    {
      type: 'image',
      src: '/images/Home-page/images/field-visit-1.jpg',
      alt: tr('Field visit photo', 'फील्ड विज़िट फ़ोटो', 'ಕ್ಷೇತ್ರ ಭೇಟಿ ಫೋಟೋ', 'క్షేత్ర సందర్శన ఫోటో', 'வயல் வருகை புகைப்படம்'),
    },
    {
      type: 'image',
      src: '/images/Home-page/images/field-visit-2.jpg',
      alt: tr('Field visit photo', 'फील्ड विज़िट फ़ोटो', 'ಕ್ಷೇತ್ರ ಭೇಟಿ ಫೋಟೋ', 'క్షేత్ర సందర్శన ఫోటో', 'வயல் வருகை புகைப்படம்'),
    },
  ];

  return (
    <div className="bg-background text-on-background font-['Lexend'] min-h-screen">
      <WhatsAppFab tr={tr} />

      <MandiPriceTicker />
      <AppHeader navItems={navItems} />

      <main className="pb-12 overflow-x-hidden">
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
                  {tr(
                    'Built on ground truth',
                    'ज़मीनी सच्चाई पर बना',
                    'ನೆಲದ ಸತ್ಯದ ಆಧಾರದ ಮೇಲೆ ನಿರ್ಮಿಸಲಾಗಿದೆ',
                    'నేల వాస్తవం ఆధారంగా నిర్మించబడింది',
                    'நிலத்தின் உண்மையின் அடிப்படையில் கட்டப்பட்டது'
                  )}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(
                    '30+ farmers interviewed · 15+ villages reached',
                    '30+ किसानों से बातचीत · 15+ गाँवों तक पहुँच',
                    '30+ ರೈತರೊಂದಿಗೆ ಮಾತುಕತೆ · 15+ ಹಳ್ಳಿಗಳಿಗೆ ತಲುಪಿದೆ',
                    '30+ మంది రైతులతో సంభాషణ · 15+ గ్రామాలకు చేరుకుంది',
                    '30+ விவசாயிகளுடன் உரையாடல் · 15+ கிராமங்களை சென்றடைந்தது'
                  )}
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
                    {tr('Honest Pricing', 'ईमानदार भाव', 'ಪ್ರಾಮಾಣಿಕ ಬೆಲೆ', 'నిజాయితీ ధర', 'நேர்மையான விலை')}
                  </span>
                </div>
                <div className="mt-6 text-lg leading-snug text-emerald-50/95">
                  {tr(
                    'Compared to real government rates — never invented',
                    'सरकारी भाव से तुलना — कभी मनगढ़ंत नहीं',
                    'ನಿಜವಾದ ಸರ್ಕಾರಿ ದರಗಳಿಗೆ ಹೋಲಿಕೆ — ಎಂದಿಗೂ ಕಲ್ಪಿತವಲ್ಲ',
                    'నిజమైన ప్రభుత్వ ధరలతో పోలిక — ఎప్పుడూ కల్పితం కాదు',
                    'உண்மையான அரசு விலைகளுடன் ஒப்பீடு — ஒருபோதும் கற்பனையல்ல'
                  )}
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
                  alt={tr(
                    'Indian farmer with smartphone',
                    'स्मार्टफोन के साथ भारतीय किसान',
                    'ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಜೊತೆ ಭಾರತೀಯ ರೈತ',
                    'స్మార్ట్‌ఫోన్‌తో భారతీయ రైతు',
                    'ஸ்மார்ட்போனுடன் இந்திய விவசாயி'
                  )}
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
                  {tr('Sarthi Network', 'सारथी नेटवर्क', 'ಸಾರಥಿ ನೆಟ್‌ವರ್ಕ್', 'సార్థి నెట్‌వర్క్', 'சார்தி நெட்வொர்க்')}
                </div>
                <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {registeredFarmerCount()}+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(
                    'real, registered farmers',
                    'असली, पंजीकृत किसान',
                    'ನಿಜವಾದ, ನೋಂದಾಯಿತ ರೈತರು',
                    'నిజమైన, నమోదిత రైతులు',
                    'உண்மையான, பதிவு செய்யப்பட்ட விவசாயிகள்'
                  )}
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
                  <div className="text-sm text-white/90">{tr('Crops', 'फसलें', 'ಬೆಳೆಗಳು', 'పంటలు', 'பயிர்கள்')}</div>
                  <div className="text-xl font-medium leading-snug">
                    {CROP_CATALOG.length}+{' '}
                    {tr(
                      'grains to vegetables',
                      'अनाज से सब्ज़ी तक',
                      'ಧಾನ್ಯದಿಂದ ತರಕಾರಿಯವರೆಗೆ',
                      'ధాన్యం నుండి కూరగాయల వరకు',
                      'தானியங்கள் முதல் காய்கறிகள் வரை'
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
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
          {/* Real moments from the field */}
          <div className="w-full max-w-6xl mb-10">
            <ExpandableGallery items={galleryItems} />

            <div className="mt-8 flex flex-col items-center gap-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {tr('Watch our reel', 'हमारी रील देखें', 'ನಮ್ಮ ರೀಲ್ ನೋಡಿ', 'మా రీల్ చూడండి', 'எங்கள் ரீலைப் பாருங்கள்')}
              </h3>
              <InstagramEmbed permalink={SOCIAL_LINKS.instagramReelPermalink} />
            </div>

            {/* Connect with us */}
            <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-8">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {tr(
                  'Connect with us',
                  'हमसे जुड़ें',
                  'ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ',
                  'మాతో కనెక్ట్ అవ్వండి',
                  'எங்களுடன் இணையுங்கள்'
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-pink-400 hover:text-pink-600 transition-colors text-sm font-bold"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a
                  href={SOCIAL_LINKS.linkedinCompany}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-bold"
                >
                  <Linkedin className="w-4 h-4" /> {tr('Sarthi Setu', 'सारथी सेतु', 'ಸಾರಥಿ ಸೇತು', 'సార్థి సేతు', 'சார்தி சேது')}
                </a>
                <a
                  href={SOCIAL_LINKS.linkedinFounder}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-bold"
                >
                  <Linkedin className="w-4 h-4" /> {tr('Founder', 'फ़ाउंडर', 'ಸಂಸ್ಥಾಪಕ', 'వ్యవస్థాపకుడు', 'நிறுவனர்')}
                </a>
                <a
                  href={SOCIAL_LINKS.whatsappGroup}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {tr(
                    'Join our WhatsApp group',
                    'WhatsApp ग्रुप जॉइन करें',
                    'ನಮ್ಮ WhatsApp ಗುಂಪಿಗೆ ಸೇರಿ',
                    'మా WhatsApp గ్రూప్‌లో చేరండి',
                    'எங்கள் WhatsApp குழுவில் இணையுங்கள்'
                  )}
                </a>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {tr(
              'Prosperity Delivered to Farmers Every Day',
              'किसानों तक हर दिन समृद्धि पहुंचाना',
              'ಪ್ರತಿದಿನ ರೈತರಿಗೆ ಸಮೃದ್ಧಿ ತಲುಪಿಸುವುದು',
              'ప్రతిరోజూ రైతులకు శ్రేయస్సు అందించడం',
              'தினமும் விவசாயிகளுக்கு செழிப்பை வழங்குதல்'
            )}
          </h2>

          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 mb-3">
            {tr(
              'Carefully crafted with ❤️ in India',
              'भारत में ❤️ के साथ बनाया गया',
              'ಭಾರತದಲ್ಲಿ ❤️ ಜೊತೆ ರಚಿಸಲಾಗಿದೆ',
              'భారతదేశంలో ❤️ తో రూపొందించబడింది',
              'இந்தியாவில் ❤️ உடன் உருவாக்கப்பட்டது'
            )}
          </p>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-5">
            {tr(
              'Operational Timing - 9 AM - 9 PM',
              'ऑपरेशनल समय - सुबह 9 बजे से रात 9 बजे तक',
              'ಕಾರ್ಯಾಚರಣೆ ಸಮಯ - ಬೆಳಿಗ್ಗೆ 9 ರಿಂದ ರಾತ್ರಿ 9 ಗಂಟೆ',
              'పని వేళలు - ఉదయం 9 నుండి రాత్రి 9 వరకు',
              'செயல்பாட்டு நேரம் - காலை 9 முதல் இரவு 9 வரை'
            )}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="text-slate-600 dark:text-slate-400">@2026 Sarthi</span>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">
              {tr('Privacy Policy', 'गोपनीयता नीति', 'ಗೌಪ್ಯತಾ ನೀತಿ', 'గోప్యతా విధానం', 'தனியுரிமைக் கொள்கை')}
            </a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">
              {tr('Terms of Service', 'सेवा की शर्तें', 'ಸೇವಾ ನಿಯಮಗಳು', 'సేవా నిబంధనలు', 'சேவை விதிமுறைகள்')}
            </a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline">
              {tr('Contact Information', 'संपर्क जानकारी', 'ಸಂಪರ್ಕ ಮಾಹಿತಿ', 'సంప్రదింపు సమాచారం', 'தொடர்பு தகவல்')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
