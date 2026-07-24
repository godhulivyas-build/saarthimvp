import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Lang } from '../i18n/translations';

const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useI18n();

  const options: { code: Lang; label: string }[] = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  return (
    <div className="flex items-center gap-1 bg-emerald-50/50 dark:bg-slate-800/50 p-1 rounded-full border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
      {options.map((opt) => {
        const isActive = lang === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLang(opt.code)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 ${
              isActive 
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-sm scale-105' 
                : 'text-emerald-600/70 dark:text-emerald-400/70 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
            aria-label={`Select ${opt.label}`}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
