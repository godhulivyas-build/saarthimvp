import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SarthiUserRole, V2AuthSession } from '../types';

const STORAGE_KEY = 'sarthi.v2.session';

const emptySession = (): V2AuthSession => ({
  version: 1,
  phone: '',
  name: '',
  preferredLang: 'hi',
  persona: null,
  addressLabel: '',
  lat: null,
  lng: null,
  otpVerified: false,
  onboardingComplete: false,
  authMode: null,
});

function loadSession(): V2AuthSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw) as V2AuthSession;
    if (parsed?.version !== 1) return emptySession();
    return { ...emptySession(), ...parsed };
  } catch {
    return emptySession();
  }
}

function saveSession(s: V2AuthSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

type V2SessionContextValue = {
  session: V2AuthSession;
  setSession: React.Dispatch<React.SetStateAction<V2AuthSession>>;
  updateSession: (patch: Partial<V2AuthSession>) => void;
  clearSession: () => void;
  completeOnboarding: (input: { persona: SarthiUserRole; name: string; phone: string; authMode: 'real' | 'dev-fallback' }) => void;
};

const V2SessionContext = createContext<V2SessionContextValue | null>(null);

export const V2SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<V2AuthSession>(() =>
    typeof window !== 'undefined' ? loadSession() : emptySession()
  );

  const persist = useCallback((next: V2AuthSession) => {
    setSession(next);
    saveSession(next);
  }, []);

  const updateSession = useCallback(
    (patch: Partial<V2AuthSession>) => {
      setSession((prev) => {
        const next = { ...prev, ...patch };
        saveSession(next);
        return next;
      });
    },
    []
  );

  const clearSession = useCallback(() => {
    const next = emptySession();
    setSession(next);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const completeOnboarding = useCallback(
    ({ persona, name, phone, authMode }: { persona: SarthiUserRole; name: string; phone: string; authMode: 'real' | 'dev-fallback' }) => {
      persist({
        ...emptySession(),
        phone,
        name,
        persona,
        otpVerified: true,
        onboardingComplete: true,
        authMode,
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      session,
      setSession: (up: React.SetStateAction<V2AuthSession>) => {
        setSession((prev) => {
          const next = typeof up === 'function' ? (up as (p: V2AuthSession) => V2AuthSession)(prev) : up;
          saveSession(next);
          return next;
        });
      },
      updateSession,
      clearSession,
      completeOnboarding,
    }),
    [session, updateSession, clearSession, completeOnboarding]
  );

  return <V2SessionContext.Provider value={value}>{children}</V2SessionContext.Provider>;
};

export const useV2Session = (): V2SessionContextValue => {
  const ctx = useContext(V2SessionContext);
  if (!ctx) throw new Error('useV2Session must be used within V2SessionProvider');
  return ctx;
};
