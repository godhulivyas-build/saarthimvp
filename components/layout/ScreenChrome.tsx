import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { SaarthiLogo } from '../SaarthiLogo';

type ScreenChromeProps = {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
};

const langOptions = [
  { code: 'hi' as const, label: 'हिं' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kn' as const, label: 'ಕ' },
  { code: 'ta' as const, label: 'த' },
  { code: 'te' as const, label: 'తె' },
];

export const ScreenChrome: React.FC<ScreenChromeProps> = ({ children, onBack, title }) => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/80 to-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-2 py-3 flex items-center gap-2 shadow-sm safe-top">
        <div className="shrink-0 flex items-center gap-1">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-green-800 font-bold text-base active:bg-green-100"
              aria-label={t('back')}
            >
              ←
            </button>
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <SaarthiLogo size={28} className="rounded" />
              <span className="font-extrabold text-green-800 text-sm leading-none">
                Sarthi Setu<br />
                <span className="text-[10px] font-bold text-gray-500">सारथी सेतु</span>
              </span>
            </div>
          )}
        </div>
        {title ? (
          <h1 className="flex-1 text-center text-sm sm:text-base font-bold text-gray-900 truncate px-1">{title}</h1>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-1 shrink-0 justify-end">
          {langOptions.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold border ${lang === code ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
};
