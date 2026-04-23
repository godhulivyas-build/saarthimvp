import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Lang } from '../i18n/translations';

/**
 * Simple language selector dropdown. It reads the current language from the
 * i18n context and calls `setLang` to switch. The selection is persisted by the
 * context (AppState stores it in localStorage).
 */
const LanguageSelector: React.FC = () => {
  const { lang, setLang, t } = useI18n();

  const options: { code: Lang; label: string }[] = [
    { code: 'hi', label: 'हिं' },
    { code: 'en', label: 'EN' },
    { code: 'kn', label: 'ಕ' },
    { code: 'te', label: 'తె' },
    { code: 'ta', label: 'த' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value as Lang);
  };

  return (
    <select
      value={lang}
      onChange={handleChange}
      className="rounded-full border border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-glass)] px-2 py-1 text-sm"
      aria-label={t('landing.v2.langChoose') ?? 'Language'}
    >
      {options.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
