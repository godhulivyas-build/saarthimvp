import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { PersonaShell } from './shared/PersonaShell';
import { BuyFlow } from './discover/BuyFlow';

export const BuyerDashboard: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';

  return (
    <PersonaShell
      icon="storefront"
      title={isHi ? 'नमस्ते, खरीदार जी!' : 'Welcome, Buyer!'}
      subtitle={
        isHi
          ? 'फसल और ज़िला चुनें — आस-पास के किसानों से सीधे ताज़ा उपज पाएं।'
          : 'Pick a crop and district — find fresh produce directly from nearby farmers.'
      }
    >
      <BuyFlow />
    </PersonaShell>
  );
};
