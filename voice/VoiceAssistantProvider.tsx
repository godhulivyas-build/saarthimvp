import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { landingVoice, voiceForView } from './voiceContent';
import type { Lang } from '../i18n/translations';

type VoiceAssistantContextValue = {
  speaking: boolean;
  listening: boolean;
  processing: boolean;
  toggle: () => void;
  say: (text: string) => void;
  dictateOnce: (opts: { lang?: Lang; onText: (t: string) => void; onError?: (m: string) => void }) => void;
};

const VoiceAssistantContext = createContext<VoiceAssistantContextValue | null>(null);

const langToLocale = (lang: Lang): string => {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'kn') return 'kn-IN';
  if (lang === 'te') return 'te-IN';
  return 'en-IN';
};

const speak = (text: string, lang: Lang) => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langToLocale(lang);
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
};

const getRecognizer = (): (new () => any) | null => {
  const W = window as unknown as {
    SpeechRecognition?: new () => any;
    webkitSpeechRecognition?: new () => any;
  };
  return W.SpeechRecognition || W.webkitSpeechRecognition || null;
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type Intent =
  | 'NAV_HOME'
  | 'NAV_BOOK'
  | 'NAV_REQUESTS'
  | 'NAV_JOBS'
  | 'NAV_TRIPS'
  | 'NAV_BROWSE'
  | 'NAV_ORDERS'
  | 'NAV_PRICES'
  | 'NAV_NEARBY_BUYERS'
  | 'NAV_PAYMENT'
  | 'NAV_TRACK'
  | 'NAV_COLD'
  | 'NAV_WEATHER'
  | 'NAV_ALERTS'
  | 'NAV_WALLET'
  | 'NAV_EARNINGS'
  | 'NAV_STORAGE'
  | 'HELP'
  | 'UNKNOWN';

const parseIntent = (raw: string): Intent => {
  const t = normalize(raw);
  if (!t) return 'UNKNOWN';

  if (
    (t.includes('gaadi') || t.includes('गाड़ी')) &&
    (t.includes('book') || t.includes('buk') || t.includes('booking') || t.includes('बुक') || t.includes('बुकिंग'))
  ) {
    return 'NAV_BOOK';
  }
  if (t.includes('kaam') || t.includes('काम') || t.includes('jobs') || t.includes('job')) return 'NAV_JOBS';
  if ((t.includes('mera') || t.includes('meri') || t.includes('मेरा') || t.includes('मेरे')) && (t.includes('order') || t.includes('ऑर्डर'))) {
    return 'NAV_ORDERS';
  }
  if (t.includes('weather') || t.includes('मौसम') || t.includes('baarish') || t.includes('बारिश')) return 'NAV_WEATHER';
  if (t.includes('alert') || t.includes('alerts') || t.includes('सूचना') || t.includes('सूचनाएं') || t.includes('scheme') || t.includes('योजना')) {
    return 'NAV_ALERTS';
  }
  if (
    (t.includes('fasal') || t.includes('फसल') || t.includes('produce') || t.includes('crops') || t.includes('crop')) &&
    (t.includes('dikhao') || t.includes('show') || t.includes('browse') || t.includes('देखो'))
  ) {
    return 'NAV_BROWSE';
  }
  if (t.includes('request') || t.includes('रिक्वेस्ट') || t.includes('requests')) return 'NAV_REQUESTS';
  if (t.includes('trip') || t.includes('trips') || t.includes('ट्रिप')) return 'NAV_TRIPS';
  if (t.includes('home') || t.includes('होम')) return 'NAV_HOME';
  if (t.includes('mandi') || t.includes('मंडी') || (t.includes('bhav') || t.includes('भाव'))) return 'NAV_PRICES';
  if ((t.includes('buyer') || t.includes('खरीदार')) && (t.includes('dikhao') || t.includes('दिख') || t.includes('show'))) {
    return 'NAV_NEARBY_BUYERS';
  }
  if (t.includes('payment') || t.includes('भुगतान') || t.includes('pay')) return 'NAV_PAYMENT';
  if (t.includes('wallet') || t.includes('वॉलेट') || t.includes('balance') || t.includes('बैलेंस')) return 'NAV_WALLET';
  if (t.includes('earning') || t.includes('earnings') || t.includes('कमाई')) return 'NAV_EARNINGS';
  if (t.includes('track') || t.includes('ट्रैक') || t.includes('shipment')) return 'NAV_TRACK';
  if (t.includes('cold') || t.includes('कोल्ड') || t.includes('storage') || t.includes('स्टोरेज')) return 'NAV_STORAGE';
  if (t.includes('madad') || t.includes('मदद') || t.includes('help') || t.includes('sahayata') || t.includes('सहायता'))
    return 'HELP';

  return 'UNKNOWN';
};

const unknownText = (lang: Lang): string => {
  if (lang === 'en')
    return 'Sorry, I did not understand. Try: home, book vehicle, mandi prices, weather, alerts, wallet.';
  return 'माफ़ कीजिए, मैं समझ नहीं पाया। बोलें: होम, गाड़ी बुक करो, मंडी भाव, मौसम, सूचनाएं, वॉलेट।';
};

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, setCurrentDashboardView, setCurrentScreen } = useAppState();
  const navigate = useNavigate();
  const recognitionRef = useRef<any | null>(null);

  const [speakingState, setSpeakingState] = useState(false);
  const [listeningState, setListeningState] = useState(false);
  const [processingState, setProcessingState] = useState(false);

  const text = useMemo(() => {
    const lang = state.lang;
    if (state.currentScreen === 'landing') return landingVoice[lang] || landingVoice.hi!;
    if (!state.userRole || !state.currentDashboardView) return landingVoice[lang] || landingVoice.hi!;
    return voiceForView(state.userRole, state.currentDashboardView.view, lang) || landingVoice[lang] || landingVoice.hi!;
  }, [state.currentScreen, state.userRole, state.currentDashboardView, state.lang]);

  const applyIntent = (intent: Intent) => {
    const role = state.userRole;
    if (!role) {
      if (intent === 'HELP') return;
      if (intent !== 'UNKNOWN') navigate('/onboarding');
      return;
    }
    if (state.currentScreen !== 'dashboard') {
      setCurrentScreen('dashboard');
      navigate('/app');
    }
    if (intent === 'NAV_HOME') return setCurrentDashboardView({ role, view: 'home' } as any);
    if (intent === 'NAV_BOOK') {
      if (role === 'farmer') return setCurrentDashboardView({ role, view: 'book_vehicle' });
      if (role === 'buyer') return setCurrentDashboardView({ role, view: 'home' });
      return setCurrentDashboardView({ role, view: 'jobs' });
    }
    if (intent === 'NAV_REQUESTS' && role === 'farmer') return setCurrentDashboardView({ role, view: 'my_requests' });
    if (intent === 'NAV_JOBS' && role === 'logistics_partner') return setCurrentDashboardView({ role, view: 'jobs' });
    if (intent === 'NAV_TRIPS' && role === 'logistics_partner') return setCurrentDashboardView({ role, view: 'my_trips' });
    if (intent === 'NAV_BROWSE' && role === 'buyer') return setCurrentDashboardView({ role, view: 'browse' });
    if (intent === 'NAV_ORDERS' && role === 'buyer') return setCurrentDashboardView({ role, view: 'orders' });
    if (intent === 'NAV_PRICES' && role === 'farmer') return setCurrentDashboardView({ role, view: 'prices' });
    if (intent === 'NAV_WEATHER' && role === 'farmer') return setCurrentDashboardView({ role, view: 'weather' });
    if (intent === 'NAV_ALERTS' && role === 'farmer') return setCurrentDashboardView({ role, view: 'alerts' });
    if (intent === 'NAV_NEARBY_BUYERS' && role === 'farmer') return setCurrentDashboardView({ role, view: 'nearby_buyers' });
    if (intent === 'NAV_PAYMENT' && (role === 'farmer' || role === 'buyer')) {
      return setCurrentDashboardView({ role, view: 'payments' } as any);
    }
    if (intent === 'NAV_WALLET' && (role === 'farmer' || role === 'buyer' || role === 'logistics_partner')) {
      return setCurrentDashboardView({ role, view: 'wallet' } as any);
    }
    if (intent === 'NAV_EARNINGS' && role === 'logistics_partner') return setCurrentDashboardView({ role, view: 'earnings' } as any);
    if (intent === 'NAV_TRACK' && role === 'farmer') return setCurrentDashboardView({ role, view: 'track' });
    if (intent === 'NAV_STORAGE' && role === 'cold_storage_owner') return setCurrentDashboardView({ role, view: 'slots' });
    if (intent === 'NAV_STORAGE' && role === 'farmer') return setCurrentDashboardView({ role, view: 'cold_nearby' } as any);
    if (intent === 'HELP') return setCurrentDashboardView({ role, view: 'home' } as any);
  };

  const say = (out: string) => speak(out, state.lang);

  const dictateOnce = (opts: { lang?: Lang; onText: (t: string) => void; onError?: (m: string) => void }) => {
    const lang = opts.lang ?? state.lang;
    const SR = getRecognizer();
    if (!SR) {
      opts.onError?.(lang === 'en' ? 'Voice is not supported on this device.' : 'इस डिवाइस में वॉयस सपोर्ट नहीं है।');
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = langToLocale(lang);
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListeningState(true);
    rec.onerror = () => {
      setListeningState(false);
      opts.onError?.(lang === 'en' ? 'No voice heard. Try again.' : 'आवाज़ नहीं मिली। फिर से कोशिश करें।');
    };
    rec.onend = () => setListeningState(false);
    rec.onresult = (ev: any) => {
      const transcript = ev?.results?.[0]?.[0]?.transcript ?? '';
      const clean = transcript?.trim();
      if (!clean) {
        opts.onError?.(lang === 'en' ? 'No text recognized.' : 'कुछ समझ नहीं आया।');
        return;
      }
      opts.onText(clean);
    };

    try {
      rec.start();
    } catch {
      opts.onError?.(lang === 'en' ? 'Could not start dictation.' : 'डिक्टेशन शुरू नहीं हुआ।');
    }
  };

  const toggle = () => {
    const lang = state.lang;

    if (listeningState && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setListeningState(false);
      return;
    }

    setSpeakingState(true);
    speak(text, lang);
    window.setTimeout(() => setSpeakingState(false), 1200);

    const SR = getRecognizer();
    if (!SR) {
      speak(lang === 'en' ? 'Voice commands are not supported on this device.' : 'इस फोन में वॉइस कमांड सपोर्ट नहीं है।', lang);
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = langToLocale(lang);
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListeningState(true);
    rec.onerror = () => {
      setListeningState(false);
      speak(lang === 'en' ? 'No voice heard. Please try again.' : 'आवाज़ नहीं मिली। फिर से कोशिश करें।', lang);
    };
    rec.onend = () => setListeningState(false);
    rec.onresult = (ev: any) => {
      const transcript = ev?.results?.[0]?.[0]?.transcript ?? '';
      setProcessingState(true);
      const intent = parseIntent(transcript);
      if (intent === 'UNKNOWN') {
        speak(unknownText(lang), lang);
      } else {
        speak(lang === 'en' ? 'Okay.' : 'ठीक है।', lang);
        applyIntent(intent);
      }
      window.setTimeout(() => setProcessingState(false), 700);
    };

    window.setTimeout(() => {
      try {
        rec.start();
      } catch {
        // ignore
      }
    }, 900);
  };

  const value = useMemo(
    () => ({
      speaking: speakingState,
      listening: listeningState,
      processing: processingState,
      toggle,
      say,
      dictateOnce,
    }),
    [speakingState, listeningState, processingState, state.lang]
  );

  return <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>;
};

export const useVoiceAssistant = (): VoiceAssistantContextValue => {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  return ctx;
};

