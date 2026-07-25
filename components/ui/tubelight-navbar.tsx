import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  activeName?: string;
  onNavigate?: (item: NavItem) => void;
}

/**
 * "Tubelight" pill nav — active tab gets a glowing lamp indicator on top.
 * Adapted for a same-page anchor nav (no next/link, no client directive needed in Vite).
 */
export function NavBar({ items, className, activeName, onNavigate }: NavBarProps) {
  const navigate = useNavigate();
  const [internalActive, setInternalActive] = useState(items[0]?.name);
  const activeTab = activeName ?? internalActive;

  return (
    <div className={cx('flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900 backdrop-blur-lg py-1 px-1 rounded-full shadow-sm', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;

        return (
          <a
            key={item.name}
            href={item.url}
            onClick={(e) => {
              if (!item.url.startsWith('#')) {
                e.preventDefault();
                navigate(item.url);
              }
              setInternalActive(item.name);
              onNavigate?.(item);
            }}
            className={cx(
              'relative cursor-pointer text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors',
              'text-emerald-900/70 dark:text-emerald-200/70 hover:text-emerald-700 dark:hover:text-emerald-300',
              isActive && 'text-emerald-900 dark:text-emerald-50'
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden">
              <Icon size={18} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="tubelight-lamp"
                className="absolute inset-0 w-full bg-emerald-500/10 rounded-full -z-10"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-t-full">
                  <div className="absolute w-12 h-6 bg-emerald-500/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-emerald-500/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-emerald-500/20 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </a>
        );
      })}
    </div>
  );
}
