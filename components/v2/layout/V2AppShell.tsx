import React from 'react';
import { SaathiDidi } from '../../SaathiDidi';
import { LanguageGate } from '../i18n/LanguageGate';

/** Full-height V2 canvas: warm background, optional top chrome from children. */
export const V2AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[var(--saarthi-bg)] text-[var(--saarthi-on-surface)] antialiased">
    <LanguageGate />
    {children}
    <SaathiDidi />
  </div>
);
