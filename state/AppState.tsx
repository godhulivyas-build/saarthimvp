import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { SarthiDashboardView, SarthiScreen, SarthiUserRole, UserRole } from '../types';
import { translations, type Lang, type TranslationKey } from '../i18n/translations';
import { tV2, type V2Key } from '../i18n/v2';

const normalizeLang = (lang: Lang): Lang => {
  // Pilot supports hi/en plus selected regional languages.
  if (lang === 'hi' || lang === 'en' || lang === 'kn' || lang === 'te' || lang === 'ta') return lang;
  return 'hi';
};

export type AppState = {
  userRole: SarthiUserRole | null;
  lang: Lang;
  langChosen: boolean;
  currentScreen: SarthiScreen;
  currentDashboardView: SarthiDashboardView | null;
};

export type AppAction =
  | { type: 'SET_ROLE'; role: SarthiUserRole | null }
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SET_LANG_CHOSEN'; chosen: boolean }
  | { type: 'SET_SCREEN'; screen: SarthiScreen }
  | { type: 'SET_DASHBOARD_VIEW'; view: SarthiDashboardView | null }
  | { type: 'LOGOUT' }
  | { type: 'SYNC_ROLE_ENUM_TO_STRING' };

const LANG_CHOSEN_KEY = 'sarthi.v3.langChosen';
const LANG_KEY = 'sarthi.v3.lang';

const readLangChosen = (): boolean => {
  try {
    return localStorage.getItem(LANG_CHOSEN_KEY) === '1';
  } catch {
    return false;
  }
};

const writeLangChosen = (v: boolean) => {
  try {
    localStorage.setItem(LANG_CHOSEN_KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
};

const readLang = (): Lang => {
  try {
    const val = localStorage.getItem(LANG_KEY);
    if (val === 'hi' || val === 'en' || val === 'kn' || val === 'te' || val === 'ta') return val as Lang;
    return 'hi';
  } catch {
    return 'hi';
  }
};

const writeLang = (lang: Lang) => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // ignore
  }
};

const initialState: AppState = {
  userRole: null,
  lang: readLang(),
  langChosen: readLangChosen(),
  currentScreen: 'landing',
  currentDashboardView: null,
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        userRole: action.role,
        currentDashboardView: action.role
          ? ({ role: action.role, view: 'home' } as SarthiDashboardView)
          : null,
      };
    case 'SET_LANG':
      return { ...state, lang: normalizeLang(action.lang) };
    case 'SET_LANG_CHOSEN':
      return { ...state, langChosen: action.chosen };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };
    case 'SET_DASHBOARD_VIEW':
      return { ...state, currentDashboardView: action.view };
    case 'LOGOUT':
      return { ...state, userRole: null, currentScreen: 'landing', currentDashboardView: null };
    case 'SYNC_ROLE_ENUM_TO_STRING': {
      const mapped = state.userRole ?? null;
      return { ...state, userRole: mapped };
    }
    default:
      return state;
  }
};

type AppStateContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  t: (key: TranslationKey) => string;
  tV2: (key: V2Key) => string;
  setLang: (lang: Lang) => void;
  markLangChosen: () => void;
  setUserRole: (role: SarthiUserRole | null) => void;
  setCurrentScreen: (screen: SarthiScreen) => void;
  setCurrentDashboardView: (view: SarthiDashboardView | null) => void;
  logout: () => void;
  setUserRoleFromEnum: (role: UserRole) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const t = useCallback(
    (key: TranslationKey) => {
      const row = translations[state.lang][key];
      return row ?? translations.en[key] ?? key;
    },
    [state.lang]
  );

  const tV2cb = useCallback((key: V2Key) => tV2(state.lang, key), [state.lang]);

  const setLang = useCallback((lang: Lang) => {
    const normalized = normalizeLang(lang);
    dispatch({ type: 'SET_LANG', lang: normalized });
    writeLang(normalized);
    dispatch({ type: 'SET_LANG_CHOSEN', chosen: true });
    writeLangChosen(true);
  }, []);

  const markLangChosen = useCallback(() => {
    dispatch({ type: 'SET_LANG_CHOSEN', chosen: true });
    writeLangChosen(true);
  }, []);
  const setUserRole = useCallback((role: SarthiUserRole | null) => dispatch({ type: 'SET_ROLE', role }), []);
  const setCurrentScreen = useCallback((screen: SarthiScreen) => dispatch({ type: 'SET_SCREEN', screen }), []);
  const setCurrentDashboardView = useCallback(
    (view: SarthiDashboardView | null) => dispatch({ type: 'SET_DASHBOARD_VIEW', view }),
    []
  );
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const setUserRoleFromEnum = useCallback((role: UserRole) => {
    let mapped: SarthiUserRole = 'buyer';
    if (role === UserRole.FARMER) mapped = 'farmer';
    else if (role === UserRole.BUYER) mapped = 'buyer';
    else if (role === UserRole.LOGISTICS_PARTNER || role === UserRole.TRANSPORTER) mapped = 'logistics_partner';
    else if (role === UserRole.COLD_STORAGE_OWNER) mapped = 'cold_storage_owner';
    dispatch({ type: 'SET_ROLE', role: mapped });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      t,
      tV2: tV2cb,
      setLang,
      markLangChosen,
      setUserRole,
      setUserRoleFromEnum,
      setCurrentScreen,
      setCurrentDashboardView,
      logout,
    }),
    [state, t, tV2cb, setLang, markLangChosen, setUserRole, setUserRoleFromEnum, setCurrentScreen, setCurrentDashboardView, logout]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};

export const sarthiRoleToUserRole = (role: SarthiUserRole): UserRole => {
  if (role === 'farmer') return UserRole.FARMER;
  if (role === 'buyer') return UserRole.BUYER;
  if (role === 'logistics_partner') return UserRole.LOGISTICS_PARTNER;
  return UserRole.COLD_STORAGE_OWNER;
};
