import React from 'react';
import { SarthiLogo } from '../../SarthiLogo';
import { useAppState } from '../../../state/AppState';
import { useI18n } from '../../../i18n/I18nContext';

export const LanguageGate: React.FC = () => {
  const { state, setLang } = useAppState();
  const { lang } = useI18n();

  // Ask language at beginning of a session (even if previously chosen).
  // This keeps the experience consistent for demos/screenshares.
  const sessionKey = 'sarthi.langGate.dismissed';
  const dismissed = (() => {
    try {
      return sessionStorage.getItem(sessionKey) === '1';
    } catch {
      return false;
    }
  })();

  if (state.langChosen && dismissed) return null;

  const choose = (l: any) => {
    setLang(l);
    try {
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-[var(--sarthi-outline-soft)] shadow-2xl">
        <div className="flex items-center gap-3">
          <SarthiLogo size={40} className="rounded-2xl" />
          <div>
            <p className="sarthi-headline text-xl font-black text-[var(--sarthi-primary)]">Sarthi</p>
            <p className="text-xs font-semibold text-[var(--sarthi-on-surface-variant)]">Choose language first</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--sarthi-on-surface-variant)]">
          We will show the full site in the language you choose. You can change it later from the top bar.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => choose('hi')}
            className={`min-h-[56px] rounded-2xl font-extrabold border-2 transition-colors ${
              lang === 'hi'
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]'
                : 'bg-white text-[var(--sarthi-on-background)] border-[var(--sarthi-outline-soft)]'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => choose('en')}
            className={`min-h-[56px] rounded-2xl font-extrabold border-2 transition-colors ${
              lang === 'en'
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]'
                : 'bg-white text-[var(--sarthi-on-background)] border-[var(--sarthi-outline-soft)]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => choose('kn')}
            className={`min-h-[56px] rounded-2xl font-extrabold border-2 transition-colors ${
              lang === 'kn'
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]'
                : 'bg-white text-[var(--sarthi-on-background)] border-[var(--sarthi-outline-soft)]'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            type="button"
            onClick={() => choose('ta')}
            className={`min-h-[56px] rounded-2xl font-extrabold border-2 transition-colors ${
              lang === 'ta'
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]'
                : 'bg-white text-[var(--sarthi-on-background)] border-[var(--sarthi-outline-soft)]'
            }`}
          >
            தமிழ்
          </button>
          <button
            type="button"
            onClick={() => choose('te')}
            className={`min-h-[56px] rounded-2xl font-extrabold border-2 transition-colors ${
              lang === 'te'
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]'
                : 'bg-white text-[var(--sarthi-on-background)] border-[var(--sarthi-outline-soft)]'
            }`}
          >
            తెలుగు
          </button>
        </div>

        <p className="mt-4 text-xs text-[var(--sarthi-on-surface-variant)] opacity-80">
          Voice support works best in Chrome on Android.
        </p>
      </div>
    </div>
  );
};

