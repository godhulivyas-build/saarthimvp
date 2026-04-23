import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Truck,
  CircleCheck,
  Radio,
} from 'lucide-react';
import { UserRole } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { Phone, Mail } from 'lucide-react';
import type { TranslationKey } from '../i18n/translations';
import { useAppState } from '../state/AppState';
import { useV2Session } from '../state/v2Session';
import { CONTACT } from '../config/contact';
import { Card } from './v2/ui/Card';
import { V2Button } from './v2/ui/V2Button';
import { AnimatePresence, motion, useReducedMotion, useInView } from 'framer-motion';
import { IndiaStorySection } from './landing/IndiaStorySection';
import { HowItWorks3DDemo } from './landing/HowItWorks3DDemo';
import UserFlowIllustration from './landing/UserFlowIllustration';

// Landing is intentionally visual-first and minimal; role demos are handled after onboarding.

const LANG_OPTS = [
  { code: 'hi' as const, label: 'हिं' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kn' as const, label: 'ಕ' },
  { code: 'te' as const, label: 'తె' },
];

type Lang = 'hi' | 'en' | 'kn' | 'te';
const LANDING_COPY: Record<Lang, any> = {
  hi: {
    nav: { home: 'होम', how: 'कैसे काम करता है', mandi: 'मंडी भाव', login: 'लॉगिन' },
    hero: {
      pill: 'किसान-प्रथम • लॉजिस्टिक्स + सीधा बाज़ार',
      headline: 'अच्छा दाम, सीधा बाज़ार, पूरे भारत से जुड़ाव',
      sub: 'अपनी फसल सीधे खरीदारों को बेचें, ट्रांसपोर्ट बुक करें और मंडी भाव देखें।',
      primary: 'बिक्री शुरू करें',
      secondary: 'डेमो देखें',
      mandiTitle: 'आज के लाइव मंडी भाव',
      live: 'लाइव',
    },
    howCta: {
      title: 'आज ही शुरू करें',
      sub: 'फसल बेचें, ट्रक बुक करें, बेहतर दाम पाएं।',
      farmer: 'किसान बनें',
      buyer: 'खरीदार बनें',
      login: 'लॉगिन करें',
    },
  },
  en: {
    nav: { home: 'Home', how: 'How It Works', mandi: 'Market Rates', login: 'Login' },
    hero: {
      pill: 'Farmer-first • Logistics + Direct Market',
      headline: 'Better price. Direct market. Connected across India.',
      sub: 'Sell directly to buyers, book transport, and check market rates.',
      primary: 'Start selling',
      secondary: 'Watch demo',
      mandiTitle: 'Live market rates today',
      live: 'Live',
    },
    howCta: {
      title: 'Start today',
      sub: 'Sell crops, book trucks, and earn better prices.',
      farmer: 'Join as farmer',
      buyer: 'Join as buyer',
      login: 'Login',
    },
  },
  kn: {
    nav: { home: 'ಮುಖಪುಟ', how: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', mandi: 'ಮಂಡಿ ದರ', login: 'ಲಾಗಿನ್' },
    hero: {
      pill: 'ಕೃಷಿಕ-ಪ್ರಥಮ • ಲಾಜಿಸ್ಟಿಕ್ಸ್ + ನೇರ ಮಾರುಕಟ್ಟೆ',
      headline: 'ಉತ್ತಮ ದರ, ನೇರ ಮಾರುಕಟ್ಟೆ, ಭಾರತಾದ್ಯಂತ ಸಂಪರ್ಕ',
      sub: 'ಬೆಳೆ ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಮಾರಾಟ ಮಾಡಿ, ಸಾಗಣೆ ಬುಕ್ ಮಾಡಿ ಮತ್ತು ಮಂಡಿ ದರ ನೋಡಿ.',
      primary: 'ಮಾರಾಟ ಆರಂಭಿಸಿ',
      secondary: 'ಡೆಮೋ ನೋಡಿ',
      mandiTitle: 'ಇಂದಿನ ಲೈವ್ ಮಂಡಿ ದರ',
      live: 'ಲೈವ್',
    },
    howCta: {
      title: 'ಇಂದೇ ಆರಂಭಿಸಿ',
      sub: 'ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ, ಟ್ರಕ್ ಬುಕ್ ಮಾಡಿ, ಉತ್ತಮ ದರ ಪಡೆಯಿರಿ.',
      farmer: 'ಕೃಷಿಕನಾಗಿ ಸೇರಿ',
      buyer: 'ಖರೀದಿದಾರನಾಗಿ ಸೇರಿ',
      login: 'ಲಾಗಿನ್',
    },
  },
  te: {
    nav: { home: 'హోమ్', how: 'ఎలా పనిచేస్తుంది', mandi: 'మండీ ధరలు', login: 'లాగిన్' },
    hero: {
      pill: 'రైతు-ముందు • లాజిస్టిక్స్ + నేర మార్కెట్',
      headline: 'మంచి ధర, నేర మార్కెట్, భారత్ అంతా కనెక్షన్',
      sub: 'పంటను నేరుగా కొనుగోలుదారులకు అమ్మండి, ట్రాన్స్‌పోర్ట్ బుక్ చేయండి, మండీ ధరలు చూడండి.',
      primary: 'అమ్మకం ప్రారంభించండి',
      secondary: 'డెమో చూడండి',
      mandiTitle: 'ఈరోజు లైవ్ మండీ ధరలు',
      live: 'లైవ్',
    },
    howCta: {
      title: 'ఈరోజే ప్రారంభించండి',
      sub: 'పంట అమ్మండి, ట్రక్ బుక్ చేయండి, మంచి ధర పొందండి.',
      farmer: 'రైతుగా చేరండి',
      buyer: 'కొనుగోలుదారుగా చేరండి',
      login: 'లాగిన్',
    },
  },
};

function asLang(raw: string): Lang {
  return raw === 'en' || raw === 'kn' || raw === 'te' ? raw : 'hi';
}

type CountUpOpts = { from?: number; to: number; durationMs?: number };
const useCountUp = (active: boolean, opts: CountUpOpts) => {
  const { from = 0, to, durationMs = 900 } = opts;
  const [v, setV] = React.useState(from);

  React.useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, from, to, durationMs]);

  return v;
};

export const LandingPage: React.FC = () => {
  // Hindi-first version: do not mix languages on the same page.
  const { t, lang, setLang } = useI18n();
  const copy = LANDING_COPY[asLang(lang)];
  const navigate = useNavigate();
  const { setCurrentScreen, setUserRoleFromEnum, setLang: setAppLang } = useAppState();
  useV2Session();
  const reduce = useReducedMotion();
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [heroUiStep, setHeroUiStep] = React.useState(0);
  const [splashOpen, setSplashOpen] = React.useState(false);

  const heroRef = React.useRef<HTMLElement | null>(null);
  const howRef = React.useRef<HTMLElement | null>(null);
  const mandiRef = React.useRef<HTMLElement | null>(null);
  const journeyRef = React.useRef<HTMLElement | null>(null);
  const didiRef = React.useRef<HTMLDivElement | null>(null);

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goOnboarding = () => navigate('/onboarding');

  const navHome = t('landing.v2.navHome');

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    // Small, premium splash (session-only)
    const key = 'saarthi.setu.splash.shown';
    let shown = false;
    try {
      shown = sessionStorage.getItem(key) === '1';
    } catch {
      shown = true;
    }
    if (shown) return;
    setSplashOpen(true);
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // ignore
    }
    const tId = window.setTimeout(() => setSplashOpen(false), 900);
    return () => window.clearTimeout(tId);
  }, []);

  React.useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setHeroUiStep((s) => (s + 1) % 3), 2400);
    return () => window.clearInterval(id);
  }, [reduce]);

  React.useEffect(() => {
    // Speak once per session for a “guide” feel.
    const key = 'saarthi.avatar.greeted';
    let greeted = false;
    try {
      greeted = sessionStorage.getItem(key) === '1';
    } catch {
      greeted = false;
    }
    if (greeted) return;
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // ignore
    }

    const msg =
      lang === 'hi'
        ? 'नमस्ते। मैं आपको स्वस्थ अनाज दूँगा। लॉगिन करो।'
        : 'Namaste. I will help you get healthier grains. Please login.';
    const speak = () => {
      try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(msg);
        u.rate = 1;
        u.pitch = 1;
        u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(u);
      } catch {
        // ignore
      }
    };
    const tId = window.setTimeout(speak, 800);
    return () => window.clearTimeout(tId);
  }, [lang]);

  const trust = [
    { en: 'landing.v2.trust1a' as const, hi: 'landing.v2.trust1b' as const, Icon: ShieldCheck },
    { en: 'landing.v2.trust2a' as const, hi: 'landing.v2.trust2b' as const, Icon: CircleCheck },
    { en: 'landing.v2.trust3a' as const, hi: 'landing.v2.trust3b' as const, Icon: MapPin },
    { en: 'landing.v2.trust4a' as const, hi: 'landing.v2.trust4b' as const, Icon: Radio },
  ];

  const CropsFieldBackdrop: React.FC = () => (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Real Bharat imagery: wheat sunset + green field vibe */}
      <div className="absolute inset-0 bg-[url('/images/bg_wheat_sunset_wide.png')] bg-cover bg-center opacity-[0.52] blur-[1.4px] scale-[1.04] saturate-[1.08] contrast-[1.06]" />
      <div className="absolute inset-0 bg-[url('/images/bg_wheat_sunset_portrait.png')] bg-cover bg-center opacity-[0.24] blur-[1.6px] scale-[1.06] mix-blend-multiply" />

      {/* Slight dark overlay for readability, plus warm tint */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/72 to-white/84" />
      <div className="absolute inset-0 opacity-[0.70] bg-[radial-gradient(circle_at_70%_18%,rgba(251,191,36,0.24),transparent_52%),radial-gradient(circle_at_26%_32%,rgba(34,197,94,0.12),transparent_52%),radial-gradient(circle_at_55%_88%,rgba(245,158,11,0.14),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.18)_1px,transparent_1px)] [background-size:26px_26px]" />
    </div>
  );

  const FloatingCrop: React.FC<{ emoji: string; className: string; delay: number }> = ({ emoji, className, delay }) => (
    <motion.div
      aria-hidden
      className={`absolute grid place-items-center rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm ${className}`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={reduce ? undefined : { opacity: 1, y: [0, -10, 0] }}
      transition={reduce ? undefined : { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span className="text-xl">{emoji}</span>
    </motion.div>
  );

  const Clouds: React.FC = () => (
    <motion.svg
      aria-hidden
      viewBox="0 0 1200 260"
      className="absolute -top-8 left-0 right-0 w-full h-40 opacity-[0.65]"
      initial={reduce ? false : { x: -40, opacity: 0 }}
      animate={reduce ? undefined : { x: 40, opacity: 1 }}
      transition={reduce ? undefined : { duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>
      </defs>
      <g fill="url(#cloudGrad)">
        <path d="M140 170c0-28 24-52 58-52 12-30 42-52 78-52 46 0 84 34 86 78 24 5 42 24 42 47 0 28-24 52-58 52H194c-30 0-54-20-54-48z" />
        <path d="M650 190c0-22 18-40 44-40 9-22 31-38 58-38 34 0 62 25 64 57 18 4 31 18 31 35 0 22-18 40-44 40H692c-23 0-42-15-42-38z" />
        <path d="M910 160c0-20 16-36 40-36 8-20 28-34 52-34 30 0 54 22 56 50 16 3 28 16 28 31 0 20-16 36-40 36H950c-21 0-40-13-40-33z" />
      </g>
    </motion.svg>
  );

  const TruckHorizon: React.FC = () => (
    <motion.div
      aria-hidden
      className="absolute bottom-12 left-0 right-0"
      initial={reduce ? false : { x: '-12%', opacity: 0 }}
      animate={reduce ? undefined : { x: '12%', opacity: 1 }}
      transition={reduce ? undefined : { duration: 9.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <div className="mx-auto w-[min(520px,92vw)] h-6 relative">
        <div className="absolute inset-x-0 top-1 h-px bg-[rgba(24,29,23,0.18)]" />
        <div className="absolute left-12 top-0 h-6 w-20 rounded-xl bg-white/55 border border-white/50 backdrop-blur shadow-sm flex items-center justify-center">
          <Truck className="w-4 h-4 text-[var(--saarthi-primary)]" />
          <span className="ml-1 text-[10px] font-extrabold text-[var(--saarthi-on-surface-variant)]">Route</span>
        </div>
      </div>
    </motion.div>
  );

  const HeroPhoneOverlay: React.FC = () => {
    const steps = [
      {
        badge: 'ऑर्डर',
        title: '500 किलो गेहूँ',
        sub: 'दिल्ली से डिमांड',
      },
      {
        badge: 'ट्रांसपोर्ट',
        title: '1 टैप में बुक',
        sub: 'MP → दिल्ली रूट',
      },
      {
        badge: 'मंडी',
        title: 'इंदौर ₹2450',
        sub: 'लाइव भाव',
      },
    ];
    const s = steps[heroUiStep] ?? steps[0];

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={heroUiStep}
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.99 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-2xl border border-white/55 bg-white/80 backdrop-blur px-4 py-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">
                {s.badge}
              </p>
              <p className="mt-1 text-sm font-black text-[var(--saarthi-on-background)]">{s.title}</p>
              <p className="mt-0.5 text-[11px] font-bold text-[var(--saarthi-on-surface-variant)]">{s.sub}</p>
            </div>
            <div className="rounded-full bg-[var(--saarthi-primary)] text-white px-3 py-1.5 text-[10px] font-extrabold shadow-sm">
              लाइव
            </div>
          </div>
          <motion.div
            className="mt-3 h-1.5 rounded-full bg-[rgba(24,29,23,0.10)] overflow-hidden"
            initial={false}
          >
            <motion.div
              className="h-full bg-[var(--saarthi-primary)] rounded-full"
              initial={reduce ? undefined : { width: '0%' }}
              animate={reduce ? undefined : { width: '100%' }}
              transition={reduce ? undefined : { duration: 2.2, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="relative min-h-screen pb-28 md:pb-8 text-[var(--saarthi-on-surface)]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99] focus:p-4 focus:bg-white focus:rounded-xl">
        मुख्य सामग्री पर जाएं
      </a>
      <CropsFieldBackdrop />

      {/* Splash */}
      <AnimatePresence>
        {splashOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-white/65 backdrop-blur-xl"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <motion.div
              className="rounded-3xl border border-white/60 bg-white/85 backdrop-blur shadow-2xl px-6 py-5 flex items-center gap-4"
              initial={reduce ? false : { scale: 0.98, y: 8 }}
              animate={reduce ? undefined : { scale: 1, y: 0 }}
              exit={reduce ? undefined : { scale: 0.98, y: 8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <img src="/images/saarthi_setu_logo.png" alt="सारथी सेतु" className="w-12 h-12 rounded-2xl bg-white ring-1 ring-[var(--saarthi-outline-soft)] p-1" />
              <div>
                <p className="text-lg font-black text-[var(--saarthi-primary)]">सारथी सेतु</p>
                <p className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">किसान-प्रथम प्लेटफॉर्म</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Top bar — Stitch glass nav */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[60] safe-top"
        initial={false}
        animate={scrolled ? 'solid' : 'clear'}
        variants={{
          clear: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.25)' },
          solid: { backdropFilter: 'blur(14px)', backgroundColor: 'rgba(255,255,255,0.86)', borderColor: 'rgba(112,122,108,0.25)' },
        }}
        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
      >
        <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="saarthi-headline text-xl font-extrabold text-[var(--saarthi-primary)] tracking-tight">
              <span className="inline-flex items-center gap-2">
                <img
                  src="/images/saarthi_setu_logo.png"
                  alt="सारथी सेतु"
                  className="w-11 h-11 object-contain rounded-xl bg-white ring-1 ring-[var(--saarthi-outline-soft)] p-1"
                />
                <span className="font-black text-[var(--saarthi-primary)]">सारथी सेतु</span>
              </span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-extrabold">
            <button
              type="button"
              onClick={() => scrollTo(heroRef.current)}
              className="px-3 py-2 rounded-2xl text-[var(--saarthi-primary)] hover:bg-[var(--saarthi-surface-low)] transition-colors"
            >
              <span>{copy.nav.home}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo(howRef.current)}
              className="px-3 py-2 rounded-2xl text-[var(--saarthi-on-surface-variant)] hover:bg-[var(--saarthi-surface-low)] transition-colors"
            >
              <span>{copy.nav.how}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo(mandiRef.current)}
              className="px-3 py-2 rounded-2xl text-[var(--saarthi-on-surface-variant)] hover:bg-[var(--saarthi-surface-low)] transition-colors"
            >
              <span>{copy.nav.mandi}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              {LANG_OPTS.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`min-h-[34px] min-w-[34px] rounded-xl text-[11px] font-extrabold border transition-colors ${
                    lang === code
                      ? 'bg-[var(--saarthi-primary)] text-white border-[var(--saarthi-primary)]'
                      : 'bg-white/90 text-[var(--saarthi-on-surface-variant)] border-[var(--saarthi-outline-soft)] hover:bg-white'
                  }`}
                  aria-label={`भाषा: ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={goOnboarding}
              className="rounded-full bg-[var(--saarthi-primary)] text-white px-4 py-2 font-black text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              {copy.nav.login}
            </button>
          </div>
        </nav>
      </motion.header>

      <main className="pt-[4.5rem] sm:pt-24" id="main-content" role="main">
        {/* User Flow Illustration */}
        <section className="my-8 flex justify-center" aria-label="User flow illustration">
          <UserFlowIllustration />
        </section>
        {/* Avatar / guide (speaks + prompts login) */}
        <div className="fixed bottom-24 right-4 z-[70] flex flex-col items-end gap-2" role="complementary" aria-label="Virtual Assistant">
          <motion.button
            type="button"
            onClick={() => setAvatarOpen((v) => !v)}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            className="w-14 h-14 rounded-3xl overflow-hidden border border-white/60 shadow-xl bg-white"
            aria-label="Saarthi guide"
            title="Saarthi guide"
          >
            <div className="w-full h-full grid place-items-center bg-[var(--saarthi-primary)]">
              <span className="text-white font-black">S</span>
            </div>
          </motion.button>

          <AnimatePresence>
            {avatarOpen ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
                animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-[min(320px,calc(100vw-2rem))] rounded-3xl border border-[var(--saarthi-outline-soft)] bg-white/95 backdrop-blur shadow-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-primary)] shrink-0 grid place-items-center">
                    <span className="text-white font-black">S</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-[var(--saarthi-on-background)]">
                      {lang === 'hi' ? 'नमस्ते!' : 'Namaste!'}
                    </p>
                    <p className="mt-1 text-xs text-[var(--saarthi-on-surface-variant)] leading-relaxed">
                      {lang === 'hi'
                        ? 'मैं आपको स्वस्थ अनाज दूँगा। लॉगिन करो — मैं शुरू करवाता/करवाती हूँ।'
                        : 'I’ll help you get healthier grains. Login and I’ll guide you.'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const msg =
                              lang === 'hi'
                                ? 'नमस्ते। मैं आपको स्वस्थ अनाज दूँगा। लॉगिन करो।'
                                : 'Namaste. Please login.';
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const u = new SpeechSynthesisUtterance(msg);
                              u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
                              window.speechSynthesis.speak(u);
                            }
                          } catch {
                            // ignore
                          }
                        }}
                        className="min-h-[38px] px-3 rounded-2xl bg-[var(--saarthi-surface-low)] border border-[var(--saarthi-outline-soft)] text-xs font-extrabold text-[var(--saarthi-on-surface-variant)]"
                      >
                        {lang === 'hi' ? '🔊 बोलो' : '🔊 Speak'}
                      </button>
                      <button
                        type="button"
                        onClick={goOnboarding}
                        className="min-h-[38px] px-3 rounded-2xl bg-[var(--saarthi-primary)] text-white text-xs font-extrabold shadow-sm"
                      >
                        {t('landing.v2.navJoin')}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarOpen(false)}
                    className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)] hover:opacity-80"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        {/* Hero */}
        <section
          ref={heroRef}
          id="landing-hero"
          className="px-4 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-12 items-center scroll-mt-28"
        >
          <div className="relative order-2 lg:order-1 space-y-6">
            <Clouds />
            <FloatingCrop emoji="🌾" className="w-12 h-12 top-8 -left-1" delay={0.1} />
            <FloatingCrop emoji="🌽" className="w-12 h-12 top-16 left-24" delay={0.7} />
            <FloatingCrop emoji="🍅" className="w-12 h-12 top-24 right-10" delay={1.1} />
            <FloatingCrop emoji="🧅" className="w-12 h-12 top-40 right-28" delay={1.6} />

            <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1.5 border border-white/50 text-xs font-extrabold text-[var(--saarthi-on-surface-variant)] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--saarthi-primary)]" />
                {copy.hero.pill}
              </p>
              <h1 className="mt-4 saarthi-headline text-3xl sm:text-4xl md:text-5xl font-black text-[var(--saarthi-on-background)] leading-tight">
                {copy.hero.headline}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[var(--saarthi-on-surface-variant)] leading-relaxed max-w-xl font-bold">
                {copy.hero.sub}
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div
                whileTap={reduce ? undefined : { scale: 0.98 }}
                animate={reduce ? undefined : { boxShadow: ['0 0 0 0 rgba(34,197,94,0.00)', '0 0 0 12px rgba(34,197,94,0.14)', '0 0 0 0 rgba(34,197,94,0.00)'] }}
                transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl"
              >
                <V2Button variant="primary" className="min-h-[56px] px-8 w-full sm:w-auto" onClick={goOnboarding}>
                  {copy.hero.primary}
                </V2Button>
              </motion.div>
              <V2Button
                variant="secondary"
                className="min-h-[56px] px-8 w-full sm:w-auto"
                onClick={() => scrollTo(howRef.current)}
              >
                {copy.hero.secondary}
              </V2Button>
            </div>

            {/* Live mandi popup (moved to left, after text) */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-xl"
            >
              <div className="rounded-3xl border border-white/60 bg-white/78 backdrop-blur-xl shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-white/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--saarthi-primary)]" />
                    <p className="text-sm font-black text-[var(--saarthi-on-background)]">{copy.hero.mandiTitle}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[var(--saarthi-primary)] text-white">
                    {copy.hero.live}
                  </span>
                </div>
                <div className="p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
                  {[
                    { crop: 'गेहूं', city: 'इंदौर', price: '₹2450' },
                    { crop: 'प्याज', city: 'नासिक', price: '₹1800' },
                    { crop: 'मक्का', city: 'भोपाल', price: '₹2100' },
                  ].map((x) => (
                    <div key={x.crop} className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3">
                      <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">{x.city}</p>
                      <p className="mt-0.5 text-base font-black text-[var(--saarthi-on-background)]">{x.crop}</p>
                      <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">{x.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {trust.map(({ en, hi, Icon }) => (
                <div key={en} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-[var(--saarthi-tertiary)]">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)] leading-tight">
                      {t(lang === 'hi' ? hi : en)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <TruckHorizon />
          </div>

          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.98, y: 10 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[var(--saarthi-outline-soft)] bg-white relative"
            >
              <div className="relative">
                <img
                  src="/images/hero_farmer.png"
                  alt="सारथी सेतु ऐप का उपयोग करते किसान"
                  className="w-full h-[460px] sm:h-[520px] object-cover"
                  loading="eager"
                />
                {/* Keep photo fully visible: no overlay cards on the image */}
              </div>
            </motion.div>

            {/* Info strip moved below image (no photo obstruction) */}
            <div className="mt-4 max-w-md mx-auto">
              <div className="rounded-3xl border border-[var(--saarthi-outline-soft)] bg-white/80 backdrop-blur shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">
                    किसान → खरीदार → ट्रक
                  </p>
                  <p className="mt-1 text-sm font-black text-[var(--saarthi-on-background)] leading-tight">
                    बिना बिचौलिया • सही दाम • तेज़ भुगतान
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-[var(--saarthi-primary)] text-white px-3 py-2 text-[10px] font-extrabold shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <img src="/images/saarthi_setu_logo.png" alt="" className="w-4 h-4 rounded bg-white/90 p-0.5" />
                    सारथी सेतु
                  </span>
                </div>
              </div>
            </div>

            {/* App card on mobile (never on face) */}
            <div className="sm:hidden mt-4">
              <div className="rounded-3xl border border-[var(--saarthi-outline-soft)] bg-white/85 backdrop-blur shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--saarthi-outline-soft)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img src="/images/saarthi_setu_logo.png" alt="" className="w-8 h-8 rounded-xl bg-white ring-1 ring-[var(--saarthi-outline-soft)] p-1" />
                    <p className="text-sm font-black text-[var(--saarthi-on-background)]">सारथी सेतु</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[var(--saarthi-primary)] text-white">लाइव</span>
                </div>
                <div className="p-4">
                  <div className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
                    <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">ऑर्डर</p>
                    <p className="mt-1 text-lg font-black text-[var(--saarthi-on-background)]">500 किलो गेहूं</p>
                    <p className="mt-1 text-sm font-bold text-[var(--saarthi-on-surface-variant)]">दिल्ली से डिमांड</p>
                    <div className="mt-3 h-1.5 rounded-full bg-[rgba(24,29,23,0.08)] overflow-hidden">
                      <div className="h-full w-2/3 bg-[var(--saarthi-primary)] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How it works (India map network flow) */}
        <div ref={howRef as any} id="how-it-works" className="scroll-mt-28">
          <HowItWorks3DDemo onCtaClick={goOnboarding} lang={lang} />
        </div>

        {/* CTA below How It Works */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto py-10 sm:py-12">
          <Card className="p-6 sm:p-8 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black saarthi-headline text-[var(--saarthi-on-background)]">
                  {copy.howCta.title}
                </p>
                <p className="mt-2 text-sm sm:text-base font-bold text-[var(--saarthi-on-surface-variant)]">
                  {copy.howCta.sub}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <V2Button variant="primary" className="min-h-[56px] px-8" onClick={goOnboarding}>
                  {copy.howCta.farmer}
                </V2Button>
                <V2Button variant="secondary" className="min-h-[56px] px-8" onClick={goOnboarding}>
                  {copy.howCta.buyer}
                </V2Button>
                <V2Button variant="secondary" className="min-h-[56px] px-8" onClick={goOnboarding}>
                  {copy.howCta.login}
                </V2Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: USPs */}
        <UspCards />

        {/* Section 4: Mandi Bhav */}
        <MandiDashboard />

        {/* Section 5: Farmer Journey */}
        <FarmerJourney />

        {/* Minimal CTA footer (keep clean) */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto py-14 sm:py-16">
          <Card className="p-6 sm:p-8 bg-[var(--saarthi-primary)] text-white border-0 overflow-hidden relative">
            <div aria-hidden className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-white/15 blur-[1px]" />
            <div aria-hidden className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[1px]" />
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black saarthi-headline">
                  आपकी फसल अब पूरे भारत तक
                </p>
                <p className="mt-2 text-sm text-white/90">
                  किसान, खरीदार और ट्रांसपोर्ट — एक ही प्लेटफॉर्म पर।
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <V2Button variant="secondary" className="min-h-[56px] px-8 bg-white text-[var(--saarthi-primary)]" onClick={goOnboarding}>
                  किसान लॉगिन
                </V2Button>
                <V2Button variant="secondary" className="min-h-[56px] px-8 bg-white/15 text-white border border-white/25" onClick={goOnboarding}>
                  खरीदार लॉगिन
                </V2Button>
                <V2Button variant="secondary" className="min-h-[56px] px-8 bg-white/15 text-white border border-white/25" onClick={goOnboarding}>
                  अभी जुड़ें
                </V2Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="bg-zinc-900 text-zinc-300 py-14 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/saarthi_setu_logo.png" alt="सारथी सेतु" className="w-12 h-12 rounded-2xl bg-white ring-1 ring-zinc-800 p-1" />
                <div>
                  <div className="saarthi-headline text-2xl sm:text-3xl font-black text-green-400">सारथी सेतु</div>
                  <p className="text-xs text-zinc-500 font-bold">किसान-प्रथम एग्री-लॉजिस्टिक्स</p>
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                किसानों को सीधे खरीदारों से जोड़कर बेहतर दाम, ट्रांसपोर्ट बुकिंग और मंडी भाव — सब एक जगह।
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 text-sm">
                <a href={`tel:+${CONTACT.phoneE164}`} className="inline-flex items-center gap-2 font-bold text-green-400 hover:text-green-300">
                  <Phone className="w-4 h-4" /> {CONTACT.phone}
                </a>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 font-bold text-sky-400 hover:text-sky-300">
                  <Mail className="w-4 h-4" /> {CONTACT.email}
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold saarthi-headline mb-4">प्रोडक्ट</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <button type="button" onClick={goOnboarding} className="hover:text-green-400 text-left w-full">
                    लॉगिन
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo(mandiRef.current)} className="hover:text-green-400 text-left w-full">
                    मंडी भाव
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo(howRef.current)} className="hover:text-green-400 text-left w-full">
                    कैसे काम करता है
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold saarthi-headline mb-4">सपोर्ट</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <button type="button" onClick={() => scrollTo(didiRef.current)} className="hover:text-green-400 text-left w-full">
                    मदद
                  </button>
                </li>
                <li>
                  <span className="text-zinc-500">शर्तें</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold saarthi-headline mb-4">ऐप</h5>
              <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                मोबाइल पर ऑर्डर, ट्रांसपोर्ट और मंडी भाव — आसान और तेज़।
              </p>
              <button
                type="button"
                className="w-full bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-xl flex items-center justify-center gap-3 border border-zinc-700 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  ▶
                </span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400">गूगल प्ले</p>
                  <p className="font-bold text-xs text-white">जल्द आ रहा है</p>
                </div>
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-12 pt-6 text-center text-xs text-zinc-600">
            © {new Date().getFullYear()} सारथी सेतु
          </div>
        </footer>
      </main>

      {/* Didi scroll target */}
      <div ref={didiRef} id="didi-anchor" className="h-px w-full scroll-mt-32" aria-hidden />

      {/* Mobile bottom bar — Stitch */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[55] flex justify-around items-center px-2 pb-5 pt-2 bg-white/92 backdrop-blur-xl border-t border-[var(--saarthi-outline-soft)] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button type="button" onClick={() => scrollTo(heroRef.current)} className="flex flex-col items-center py-1 text-[var(--saarthi-primary)] min-w-[4rem]">
          <span className="text-lg font-black">⌂</span>
          <span className="text-[9px] font-bold uppercase mt-0.5">होम</span>
        </button>
        <button type="button" onClick={() => scrollTo(howRef.current)} className="flex flex-col items-center py-1 text-zinc-500 min-w-[4rem]">
          <span className="text-lg font-black">⇄</span>
          <span className="text-[9px] font-bold uppercase mt-0.5">कैसे</span>
        </button>
        <button type="button" onClick={() => scrollTo(mandiRef.current)} className="flex flex-col items-center py-1 text-zinc-500 min-w-[4rem]">
          <span className="text-lg font-black">₹</span>
          <span className="text-[9px] font-bold uppercase mt-0.5">मंडी</span>
        </button>
        <button type="button" onClick={goOnboarding} className="flex flex-col items-center py-1 text-zinc-500 min-w-[4rem]">
          <span className="text-lg font-black">⟶</span>
          <span className="text-[9px] font-bold uppercase mt-0.5">लॉगिन</span>
        </button>
      </nav>
    </div>
  );
};
