import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { PersonaShell } from './shared/PersonaShell';
import { SellFlow } from './discover/SellFlow';

export const FarmerDashboard: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';

  return (
    <PersonaShell
      icon="agriculture"
      title={isHi ? 'नमस्ते, किसान भाई!' : 'Welcome, Farmer!'}
      subtitle={
        isHi
          ? 'बताएं आपके पास क्या है — सबसे अच्छा भाव, खरीदार और ट्रांसपोर्ट पाएं।'
          : 'Tell us what you have — get the best price, a buyer, and transport.'
      }
    >
      <SellFlow />
    </PersonaShell>
  );
};
