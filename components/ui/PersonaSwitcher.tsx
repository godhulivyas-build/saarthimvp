import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Store, Truck, ChevronDown } from 'lucide-react';
import { useAppState } from '../../state/AppState';
import { useV2Session } from '../../state/v2Session';
import { useTr } from '../../i18n/useTr';
import type { SarthiUserRole } from '../../types';

const PERSONAS: { role: SarthiUserRole; icon: typeof Sprout; en: string; hi: string; kn: string; te: string; ta: string }[] = [
  { role: 'farmer', icon: Sprout, en: 'Farmer', hi: 'किसान', kn: 'ರೈತ', te: 'రైతు', ta: 'விவசாயி' },
  { role: 'buyer', icon: Store, en: 'Buyer', hi: 'खरीदार', kn: 'ಖರೀದಿದಾರ', te: 'కొనుగోలుదారు', ta: 'வாங்குபவர்' },
  { role: 'logistics_partner', icon: Truck, en: 'Transporter', hi: 'ट्रांसपोर्टर', kn: 'ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟರ್', te: 'రవాణాదారు', ta: 'போக்குவரத்தாளர்' },
];

/**
 * Persistent-nav persona control. Signed-in users see their current role and
 * can switch between real personas instantly. Anonymous visitors see a
 * "choose your role" prompt that starts onboarding for that role.
 */
export const PersonaSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { state, setUserRole } = useAppState();
  const { session, updateSession } = useV2Session();
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isAuthenticated = session.onboardingComplete && session.persona;
  const current = PERSONAS.find((p) => p.role === state.userRole) ?? PERSONAS[0];
  const CurrentIcon = current.icon;

  const handleSelect = (role: SarthiUserRole) => {
    setOpen(false);
    if (isAuthenticated) {
      setUserRole(role);
      updateSession({ persona: role });
      navigate('/app');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
      >
        {isAuthenticated ? (
          <>
            <CurrentIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{tr(current.en, current.hi, current.kn, current.te, current.ta)}</span>
          </>
        ) : (
          <span>{tr('Choose role', 'भूमिका चुनें', 'ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ', 'పాత్రను ఎంచుకోండి', 'பாத்திரத்தைத் தேர்ந்தெடுக்கவும்')}</span>
        )}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900 overflow-hidden z-50">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isCurrent = isAuthenticated && p.role === state.userRole;
            return (
              <button
                key={p.role}
                onClick={() => handleSelect(p.role)}
                className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tr(p.en, p.hi, p.kn, p.te, p.ta)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
