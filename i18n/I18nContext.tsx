import { useAppState } from '../state/AppState';
import type { Lang, TranslationKey } from './translations';
import type { V2Key } from './v2';

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  tV2: (key: V2Key) => string;
};

export const useI18n = (): I18nContextValue => {
  const { state, setLang, t, tV2 } = useAppState();
  return { lang: state.lang, setLang, t, tV2 };
};
