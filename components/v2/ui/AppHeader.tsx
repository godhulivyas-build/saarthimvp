import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { SarthiLogo } from '../../SarthiLogo';

type LangCode = 'hi' | 'en' | 'kn' | 'te' | 'ta';

const LANG_OPTS: { code: LangCode; label: string }[] = [
  { code: 'hi', label: 'हिं' },
  { code: 'en', label: 'EN' },
  { code: 'kn', label: 'ಕ' },
  { code: 'ta', label: 'த' },
  { code: 'te', label: 'తె' },
];

type Props = {
  title: string;
  onLogout: () => void;
  /** Optional small logo path */
  logoSrc?: string;
};

export const AppHeader: React.FC<Props> = ({ title, onLogout, logoSrc }) => {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 sarthi-glass-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {logoSrc ? (
          <img src={logoSrc} alt="" className="w-8 h-8 rounded-lg shrink-0 ring-1 ring-[var(--sarthi-outline-soft)]" />
        ) : (
          <SarthiLogo size={32} className="shrink-0 rounded-lg ring-1 ring-[var(--sarthi-outline-soft)]" />
        )}
        <span className="font-extrabold text-sm sm:text-base truncate sarthi-headline text-[var(--sarthi-on-background)]">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {LANG_OPTS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`min-h-[36px] min-w-[36px] rounded-xl text-[11px] font-extrabold border transition-colors ${
              lang === code
                ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)] shadow-sm'
                : 'bg-white/80 text-[var(--sarthi-on-surface-variant)] border-[var(--sarthi-outline-soft)] hover:border-[var(--sarthi-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="text-red-600 font-bold text-xs sm:text-sm px-2 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
        >
          {t('profile.logout')}
        </button>
      </div>
    </header>
  );
};
