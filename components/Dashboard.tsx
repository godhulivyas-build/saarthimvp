import React from 'react';
import { useAppState } from '../state/AppState';
import { useV2Session } from '../state/v2Session';
import { BuyerDashboard } from './BuyerDashboard';
import { TransporterDashboard } from './TransporterDashboard';
import { FarmerDashboard } from './FarmerDashboard';

export const Dashboard: React.FC = () => {
  const { state } = useAppState();
  const { session } = useV2Session();
  // Prefer AppState (updated in-session), fall back to session.persona for page-refresh case
  const userRole = state.userRole ?? session.persona;

  if (userRole === 'buyer') {
    return <BuyerDashboard />;
  }

  if (userRole === 'logistics_partner') {
    return <TransporterDashboard />;
  }

  return <FarmerDashboard />;
};
