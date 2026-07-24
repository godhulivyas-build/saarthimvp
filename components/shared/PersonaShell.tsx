import React from 'react';
import { AppHeader } from './AppHeader';

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
};

/** One consistent, simple shell for every persona dashboard — header + one job, no clutter. */
export const PersonaShell: React.FC<Props> = ({ title, subtitle, icon, children }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-['Lexend'] min-h-screen">
      <AppHeader />

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-emerald-700 dark:text-emerald-300 text-[30px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-950 dark:text-emerald-50">{title}</h1>
            <p className="text-sm text-emerald-800/70 dark:text-emerald-200/70 font-medium">{subtitle}</p>
          </div>
        </section>

        {children}
      </main>
    </div>
  );
};
