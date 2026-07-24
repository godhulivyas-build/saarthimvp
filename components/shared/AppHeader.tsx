import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowUpRight } from 'lucide-react';
import { useAppState } from '../../state/AppState';
import { useV2Session } from '../../state/v2Session';
import { useI18n } from '../../i18n/I18nContext';
import { NavBar, type NavItem } from '../ui/tubelight-navbar';
import { PersonaSwitcher } from '../ui/PersonaSwitcher';
import { LanguageDropdown } from '../ui/LanguageDropdown';

type Props = {
  navItems?: NavItem[];
};

/**
 * The one persistent header — same on the landing page, every persona
 * dashboard, and onboarding. Glassmorphism, sticky, always visible.
 */
export const AppHeader: React.FC<Props> = ({ navItems = [] }) => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { session, clearSession } = useV2Session();
  const { lang } = useI18n();
  const isAuthenticated = session.onboardingComplete && session.persona;

  const handleLogout = () => {
    logout();
    clearSession();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-emerald-100/60 dark:border-emerald-900/60 shadow-sm">
      <div className="flex justify-between items-center px-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isAuthenticated ? '/app' : '/')}>
            <img src="/logo.png" alt="Sarthi Logo" className="w-9 h-9 rounded-lg shadow-sm bg-white p-1" />
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">Sarthi</span>
          </div>
          {navItems.length > 0 && (
            <div className="hidden md:flex ml-5">
              <NavBar items={navItems} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PersonaSwitcher />
          <LanguageDropdown />
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-primary hover:bg-emerald-800 text-white px-4 py-1.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
            >
              {lang === 'hi' ? 'जुड़ें' : 'Join'}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
