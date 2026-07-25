import { useI18n } from './I18nContext';

export type Tr = (en: string, hi: string, kn: string, te: string, ta: string) => string;

/** Shared 5-language (en/hi/kn/te/ta) inline-string translator for one-off UI copy not in translations.ts. */
export function useTr(): Tr {
  const { lang } = useI18n();
  return (en, hi, kn, te, ta) => {
    if (lang === 'hi') return hi;
    if (lang === 'kn') return kn;
    if (lang === 'te') return te;
    if (lang === 'ta') return ta;
    return en;
  };
}
