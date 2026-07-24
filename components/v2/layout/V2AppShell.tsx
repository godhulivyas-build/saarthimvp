import React from 'react';
import { SarthiDidi } from '../../SarthiDidi';
import { LanguageGate } from '../i18n/LanguageGate';

/** Full-height V2 canvas: warm background, optional top chrome from children. */
export const V2AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[var(--sarthi-bg)] text-[var(--sarthi-on-surface)] antialiased">
    <LanguageGate />
    {children}
    <SarthiDidi />
  </div>
);
