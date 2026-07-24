import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { SellFlow } from './SellFlow';
import { BuyFlow } from './BuyFlow';
import { TransportFlow } from './TransportFlow';

type Mode = 'sell' | 'buy' | 'transport';

export const DiscoverView: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [mode, setMode] = useState<Mode>('sell');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-['Lexend'] min-h-screen pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-16 bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-emerald-900 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
          {tt('Ask Sarthi', 'सारथी से पूछें')}
        </h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 bg-emerald-100/60 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setMode('sell')}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              mode === 'sell' ? 'bg-emerald-700 text-white shadow' : 'text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {tt('Sell', 'बेचना')}
          </button>
          <button
            onClick={() => setMode('buy')}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              mode === 'buy' ? 'bg-emerald-700 text-white shadow' : 'text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {tt('Buy', 'खरीदना')}
          </button>
          <button
            onClick={() => setMode('transport')}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              mode === 'transport' ? 'bg-emerald-700 text-white shadow' : 'text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {tt('Transport', 'ट्रांसपोर्ट')}
          </button>
        </div>

        {mode === 'sell' ? <SellFlow /> : mode === 'buy' ? <BuyFlow /> : <TransportFlow />}
      </main>
    </div>
  );
};
