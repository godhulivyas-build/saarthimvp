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
    // Sync session → AppState on mount / session change only.
    // Do NOT include state.lang / state.userRole in deps — that would
    // revert user-driven changes (e.g. picking a different language from
    // the dashboard LanguageSelector) back to the session value.
    if (session.persona) setUserRole(session.persona);
    if (session.preferredLang) setLang(session.preferredLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.persona, session.preferredLang]);

  if (!session.onboardingComplete || !session.persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--sarthi-bg)] text-[var(--sarthi-on-surface)]">
        <p className="text-sm font-medium">…</p>
      </div>
    );
  }

  return <>{children}</>;
};
