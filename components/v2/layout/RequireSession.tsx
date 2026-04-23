import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useV2Session } from '../../../state/v2Session';
import { useAppState } from '../../../state/AppState';

export const RequireSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useV2Session();
  const { setUserRole, setLang, state } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.onboardingComplete || !session.persona) {
      navigate('/onboarding', { replace: true });
    }
  }, [session.onboardingComplete, session.persona, navigate]);

  useEffect(() => {
    if (session.persona && session.persona !== state.userRole) {
      setUserRole(session.persona);
    }
    if (session.preferredLang && session.preferredLang !== state.lang) {
      setLang(session.preferredLang);
    }
  }, [session.persona, session.preferredLang, state.userRole, state.lang, setUserRole, setLang]);

  if (!session.onboardingComplete || !session.persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--saarthi-bg)] text-[var(--saarthi-on-surface)]">
        <p className="text-sm font-medium">…</p>
      </div>
    );
  }

  return <>{children}</>;
};
