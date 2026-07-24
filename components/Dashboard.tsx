import React from 'react';
import { useAppState } from '../state/AppState';
import { BuyerDashboard } from './BuyerDashboard';
import { TransporterDashboard } from './TransporterDashboard';
import { FarmerDashboard } from './FarmerDashboard';

export const Dashboard: React.FC = () => {
  const { userRole } = useAppState();
  
  if (userRole === 'buyer') {
    return <BuyerDashboard />;
  }
  
  if (userRole === 'logistics_partner') {
    return <TransporterDashboard />;
  }
  
  // Default to farmer view
  return <FarmerDashboard />;
};
