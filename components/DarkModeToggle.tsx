import React, { useEffect, useState } from 'react';

/**
 * Simple dark‑mode toggle. Stores the user's preference in localStorage
 * under the key "saarthiTheme". The app root element receives a
 * `data-theme="dark"` attribute when dark mode is active.
 */
const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    // Initialise from localStorage or from prefers‑color‑scheme media query
    const stored = localStorage.getItem('saarthiTheme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('saarthiTheme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('saarthiTheme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-glass)] px-3 py-1 text-sm"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '🌞' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;
