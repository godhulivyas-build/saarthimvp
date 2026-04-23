import React from 'react';
import { Card } from '../../v2/ui/Card';
import { useI18n } from '../../../i18n/I18nContext';
import { Truck, Users, Warehouse, HandCoins, Sprout, LineChart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type Node = {
  key: string;
  Icon: React.FC<any>;
  x: number;
  y: number;
};

export const SaarthiEcosystemVisual: React.FC = () => {
  const { lang } = useI18n();
  const reduce = useReducedMotion();

  // NOTE: Text is localized using simple per-lang mapping for now.
  // Later we can move these into i18n keys if you want full dictionary control.
  const text = (k: string): string => {
    const hi: Record<string, string> = {
      title: 'Saarthi इकोसिस्टम',
      sub: 'किसान, खरीदार, लॉजिस्टिक्स, स्टोरेज और सपोर्ट—एक फ्लो में',
      center: 'SAARTHI',
      farmer: 'किसान',
      buyers: 'खरीदार',
      logistics: 'लॉजिस्टिक्स',
      storage: 'कोल्ड स्टोरेज',
      finance: 'फाइनेंस/योजना',
      insights: 'इंसाइट्स',
    };
    const en: Record<string, string> = {
      title: 'Saarthi ecosystem',
      sub: 'Farmer, buyers, logistics, storage and support—connected in one flow',
      center: 'SAARTHI',
      farmer: 'Farmer',
      buyers: 'Buyers',
      logistics: 'Logistics',
      storage: 'Cold storage',
      finance: 'Finance/schemes',
      insights: 'Insights',
    };
    const ta: Record<string, string> = {
      title: 'Saarthi சூழமைப்பு',
      sub: 'விவசாயி, வாங்குபவர், லாஜிஸ்டிக்ஸ், சேமிப்பு—ஒரே ஓட்டத்தில்',
      center: 'SAARTHI',
      farmer: 'விவசாயி',
      buyers: 'வாங்குபவர்',
      logistics: 'லாஜிஸ்டிக்ஸ்',
      storage: 'குளிர்சாதன சேமிப்பு',
      finance: 'நிதி/திட்டங்கள்',
      insights: 'இன்சைட்ஸ்',
    };
    const kn: Record<string, string> = {
      title: 'Saarthi ಪರಿಸರ ವ್ಯವಸ್ಥೆ',
      sub: 'ರೈತ, ಖರೀದಿದಾರ, ಲಾಜಿಸ್ಟಿಕ್ಸ್, ಸಂಗ್ರಹ—ಒಂದೇ ಫ್ಲೋ',
      center: 'SAARTHI',
      farmer: 'ರೈತ',
      buyers: 'ಖರೀದಿದಾರರು',
      logistics: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್',
      storage: 'ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್',
      finance: 'ಫೈನಾನ್ಸ್/ಯೋಜನೆ',
      insights: 'ಇನ್ಸೈಟ್ಸ್',
    };
    const te: Record<string, string> = {
      title: 'Saarthi ఎకోసిస్టమ్',
      sub: 'రైతు, కొనుగోలుదారు, లాజిస్టిక్స్, స్టోరేజ్—ఒకే ఫ్లోలో',
      center: 'SAARTHI',
      farmer: 'రైతు',
      buyers: 'కొనుగోలుదారులు',
      logistics: 'లాజిస్టిక్స్',
      storage: 'కోల్డ్ స్టోరేజ్',
      finance: 'ఫైనాన్స్/పథకాలు',
      insights: 'ఇన్సైట్స్',
    };
    const dict = lang === 'hi' ? hi : lang === 'ta' ? ta : lang === 'kn' ? kn : lang === 'te' ? te : en;
    return dict[k] ?? en[k] ?? k;
  };

  const nodes: Node[] = [
    { key: 'farmer', Icon: Sprout, x: 90, y: 90 },
    { key: 'buyers', Icon: Users, x: 430, y: 90 },
    { key: 'logistics', Icon: Truck, x: 455, y: 220 },
    { key: 'storage', Icon: Warehouse, x: 260, y: 285 },
    { key: 'finance', Icon: HandCoins, x: 65, y: 220 },
    { key: 'insights', Icon: LineChart, x: 260, y: 35 },
  ];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
      className="w-full"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-extrabold saarthi-headline text-[var(--saarthi-on-background)]">{text('title')}</p>
          <p className="mt-1 text-sm text-[var(--saarthi-on-surface-variant)]">{text('sub')}</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl overflow-hidden border border-[var(--saarthi-outline-soft)] bg-white">
        <div className="p-4 sm:p-5">
          <svg viewBox="0 0 520 320" className="w-full h-auto">
          <defs>
            <radialGradient id="sa_g" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="rgba(13, 99, 27, 0.22)" />
              <stop offset="100%" stopColor="rgba(13, 99, 27, 0.04)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="520" height="320" rx="24" fill="url(#sa_g)" />

          {nodes.map((n, idx) => (
            <g key={n.key}>
              <line x1="260" y1="160" x2={n.x} y2={n.y} stroke="rgba(64,73,61,0.35)" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx={n.x} cy={n.y} r="26" fill="white" stroke="rgba(112,122,108,0.25)" strokeWidth="2" />
              <foreignObject x={n.x - 16} y={n.y - 16} width="32" height="32">
                <div className="w-8 h-8 rounded-xl bg-[var(--saarthi-surface-low)] flex items-center justify-center">
                  <n.Icon className="w-4.5 h-4.5 text-[var(--saarthi-primary)]" />
                </div>
              </foreignObject>
              <text x={n.x} y={n.y + 45} textAnchor="middle" fontSize="11" fontWeight="800" fill="#181d17">
                {text(n.key)}
              </text>
            </g>
          ))}

          <circle cx="260" cy="160" r="46" fill="#0d631b" opacity="0.95" />
          <circle cx="260" cy="160" r="56" fill="none" stroke="rgba(13,99,27,0.35)" strokeWidth="10" />
          <text x="260" y="166" textAnchor="middle" fontSize="15" fontWeight="900" fill="white">
            {text('center')}
          </text>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

