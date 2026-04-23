import React from 'react';
import { Card } from '../../v2/ui/Card';
import { useI18n } from '../../../i18n/I18nContext';
import { Droplets, TrendingUp, Truck, MessageCircle, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type Step = {
  key: string;
  Icon: React.FC<any>;
};

export const SaarthiWorkflowVisual: React.FC<{ highlightStep?: number }> = ({ highlightStep = 1 }) => {
  const { lang } = useI18n();
  const reduce = useReducedMotion();

  const text = (k: string): string => {
    const hi: Record<string, string> = {
      title: 'Saarthi कैसे काम करता है',
      s1t: 'दाम + नमी जोखिम',
      s1d: 'बेहतर निर्णय, कम कटौती',
      s2t: 'बुकिंग (मैप/माइक)',
      s2d: 'पिकअप → ड्रॉप आसान',
      s3t: 'ट्रक + रिटर्न लोड',
      s3d: 'फर्टिलाइज़र/बैकहॉल बचत',
      s4t: 'WhatsApp अपडेट',
      s4d: 'कन्फर्मेशन + स्टेटस',
      s5t: 'खरीदार कनेक्ट',
      s5d: 'रिक्वेस्ट/कॉल/WhatsApp',
    };
    const en: Record<string, string> = {
      title: 'How Saarthi works',
      s1t: 'Price + moisture risk',
      s1d: 'Better decisions, fewer deductions',
      s2t: 'Booking (map/mic)',
      s2d: 'Pickup → drop in minutes',
      s3t: 'Truck + return load',
      s3d: 'Backhaul savings (fertilizer)',
      s4t: 'WhatsApp updates',
      s4d: 'Confirmations + status',
      s5t: 'Buyer connect',
      s5d: 'Requests / call / WhatsApp',
    };
    const ta: Record<string, string> = {
      title: 'Saarthi எப்படி வேலை செய்கிறது',
      s1t: 'விலை + ஈரப்பத ஆபத்து',
      s1d: 'சிறந்த முடிவுகள், குறைந்த கழிவுகள்',
      s2t: 'புக்கிங் (மேப்/மைக்)',
      s2d: 'பிக்கப் → டிராப் எளிது',
      s3t: 'ட்ரக் + ரிட்டர்ன் லோடு',
      s3d: 'பேக்க்ஹால் சேமிப்பு',
      s4t: 'WhatsApp அப்டேட்ஸ்',
      s4d: 'கன்ஃபர்மை + ஸ்டேட்டஸ்',
      s5t: 'வாங்குபவர் இணைப்பு',
      s5d: 'ரிக்வெஸ்ட்/கால்/WhatsApp',
    };
    const kn: Record<string, string> = {
      title: 'Saarthi ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
      s1t: 'ಬೆಲೆ + ತೇವ ರಿಸ್ಕ್',
      s1d: 'ಉತ್ತಮ ನಿರ್ಧಾರ, ಕಡಿಮೆ ಕಡಿತ',
      s2t: 'ಬುಕಿಂಗ್ (ಮ್ಯಾಪ್/ಮೈಕ್)',
      s2d: 'ಪಿಕಪ್ → ಡ್ರಾಪ್ ಸುಲಭ',
      s3t: 'ಟ್ರಕ್ + ರಿಟರ್ನ್ ಲೋಡ್',
      s3d: 'ಬ್ಯಾಕ್‌ಹಾಲ್ ಸೇವಿಂಗ್',
      s4t: 'WhatsApp ಅಪ್ಡೇಟ್ಸ್',
      s4d: 'ಕನ್ಫರ್ಮ್ + ಸ್ಟೇಟಸ್',
      s5t: 'ಖರೀದಿದಾರ ಸಂಪರ್ಕ',
      s5d: 'ರಿಕ್ವೆಸ್ಟ್/ಕಾಲ್/WhatsApp',
    };
    const te: Record<string, string> = {
      title: 'Saarthi ఎలా పని చేస్తుంది',
      s1t: 'ధర + తేమ రిస్క్',
      s1d: 'మంచి నిర్ణయం, తక్కువ కట్',
      s2t: 'బుకింగ్ (మ్యాప్/మైక్)',
      s2d: 'పికప్ → డ్రాప్ ఈజీ',
      s3t: 'ట్రక్ + రిటర్న్ లోడ్',
      s3d: 'బ్యాక్‌హాల్ సేవింగ్స్',
      s4t: 'WhatsApp అప్డేట్స్',
      s4d: 'కన్ఫర్మ్ + స్టేటస్',
      s5t: 'బయ్యర్ కనెక్ట్',
      s5d: 'రిక్వెస్ట్/కాల్/WhatsApp',
    };
    const dict = lang === 'hi' ? hi : lang === 'ta' ? ta : lang === 'kn' ? kn : lang === 'te' ? te : en;
    return dict[k] ?? en[k] ?? k;
  };

  const steps: Step[] = [
    { key: 's1', Icon: TrendingUp },
    { key: 's2', Icon: Truck },
    { key: 's3', Icon: Droplets },
    { key: 's4', Icon: MessageCircle },
    { key: 's5', Icon: Users },
  ];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full"
    >
      <p className="font-extrabold saarthi-headline text-[var(--saarthi-on-background)]">{text('title')}</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((s, idx) => {
          const n = idx + 1;
          const active = n === highlightStep;
          return (
            <motion.button
              key={s.key}
              type="button"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
              animate={
                reduce
                  ? undefined
                  : active
                    ? { y: -3, boxShadow: '0 10px 24px rgba(13,99,27,0.14)' }
                    : { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' }
              }
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`text-left rounded-3xl border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--saarthi-primary)]/30 ${
                active
                  ? 'bg-white border-[var(--saarthi-primary)]'
                  : 'bg-[var(--saarthi-surface-low)] border-[var(--saarthi-outline-soft)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <motion.div
                  animate={reduce ? undefined : active ? { scale: 1.04 } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-10 h-10 rounded-2xl bg-[var(--saarthi-primary)]/10 border border-[var(--saarthi-outline-soft)] flex items-center justify-center"
                >
                  <s.Icon className="w-5 h-5 text-[var(--saarthi-primary)]" />
                </motion.div>
                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-white border border-[var(--saarthi-outline-soft)] text-[var(--saarthi-on-surface-variant)]">
                  {n}
                </span>
              </div>
              <p className="mt-3 text-xs font-extrabold text-[var(--saarthi-on-background)]">{text(`${s.key}t`)}</p>
              <p className="mt-1 text-[10px] text-[var(--saarthi-on-surface-variant)]">{text(`${s.key}d`)}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

