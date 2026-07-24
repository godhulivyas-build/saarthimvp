import React, { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import type { Lang } from '../../i18n/translations';

const OPTIONS: { code: Lang; label: string }[] = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
];

/** Compact globe-icon language switcher for the persistent nav bar. */
export const LanguageDropdown: React.FC = () => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/40 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900 overflow-hidden z-50">
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLang(opt.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                lang === opt.code
                  ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
