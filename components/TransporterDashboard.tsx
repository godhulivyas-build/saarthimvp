import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { PersonaShell } from './shared/PersonaShell';
import { TransportFlow } from './discover/TransportFlow';

export const TransporterDashboard: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';

  return (
    <PersonaShell
      icon="local_shipping"
      title={isHi ? 'नमस्ते, ड्राइवर जी!' : 'Welcome, Driver!'}
      subtitle={
        isHi
          ? 'पिकअप और ड्रॉप ज़िला चुनें — आस-पास के लोड और भाव पाएं।'
          : 'Pick pickup and drop districts — find nearby loads and pricing.'
      }
    >
      <TransportFlow />
    </PersonaShell>
  );
};
