import React from 'react';
import { Link } from 'react-router-dom';
import { SarthiLogo } from '../SarthiLogo';

type Props = {
  title: string;
  children: React.ReactNode;
};

const items = [
  { id: 'map', label: 'India Crop Map' },
  { id: 'network', label: 'Ecosystem Network' },
  { id: 'optimization', label: 'No Empty Truck' },
  { id: 'women', label: 'Women Literacy Pilot' },
  { id: 'diagnosis', label: 'Crop AI Diagnosis' },
  { id: 'iot', label: 'Soil + IoT Monitoring' },
  { id: 'trace', label: 'Traceability' },
  { id: 'manufacturing', label: 'Local Manufacturing' },
] as const;

export const AgriPlatformShell: React.FC<Props> = ({ title, children }) => {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--sarthi-outline-soft)] bg-[var(--sarthi-glass)] backdrop-blur-md safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <SarthiLogo size={32} className="rounded-xl ring-1 ring-[var(--sarthi-outline-soft)]" />
              <div className="min-w-0">
                <div className="sarthi-headline font-extrabold text-[var(--sarthi-primary)] leading-tight truncate">Sarthi</div>
                <div className="text-[11px] font-semibold text-[var(--sarthi-on-surface-variant)] truncate">{title}</div>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 flex-wrap justify-end">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => scrollToId(it.id)}
                className="px-3 py-2 rounded-xl text-xs font-extrabold text-[var(--sarthi-on-surface-variant)] hover:bg-[var(--sarthi-surface-low)]"
              >
                {it.label}
              </button>
            ))}
          </nav>

          <Link
            to="/onboarding"
            className="rounded-full bg-[var(--sarthi-primary)] text-white px-4 py-2 font-extrabold text-xs shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Open App
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">{children}</main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[55] bg-white/95 backdrop-blur-xl border-t border-[var(--sarthi-outline-soft)] px-2 py-2 safe-area-pb">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => scrollToId(it.id)}
              className="shrink-0 px-3 py-2 rounded-xl text-[11px] font-extrabold border border-[var(--sarthi-outline-soft)] bg-[var(--sarthi-surface)]"
            >
              {it.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

