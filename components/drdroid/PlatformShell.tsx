import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Card } from '../v2/ui/Card';
import { SarthiLogo } from '../SarthiLogo';

const tabs = [
  { to: '/platform', label: 'Product' },
  { to: '/platform/assistant', label: 'Assistant' },
  { to: '/platform/kubernetes', label: 'Kubernetes' },
  { to: '/platform/monitoring', label: 'Monitoring' },
  { to: '/platform/reliability', label: 'Reliability' },
] as const;

export const PlatformShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--sarthi-bg)] text-[var(--sarthi-on-surface)]">
      <header className="sticky top-0 z-50 border-b border-[var(--sarthi-outline-soft)] bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold sarthi-headline text-[var(--sarthi-primary)]">
            <SarthiLogo size={32} className="rounded-xl ring-1 ring-[var(--sarthi-outline-soft)]" />
            <span>DrDroid LLM Infra Demo</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-[var(--sarthi-primary)] text-white' : 'text-[var(--sarthi-on-surface-variant)] hover:bg-[var(--sarthi-surface-low)]'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Card className="p-4 sm:p-6">{children}</Card>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[var(--sarthi-outline-soft)]">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-1 p-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `text-center text-[10px] font-extrabold px-2 py-2 rounded-xl ${
                  isActive ? 'bg-[var(--sarthi-primary)] text-white' : 'text-[var(--sarthi-on-surface-variant)]'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

