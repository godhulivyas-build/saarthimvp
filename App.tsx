import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { OnboardingWizard } from './components/v2/onboarding/OnboardingWizard';
import { RequireSession } from './components/v2/layout/RequireSession';
import { V2AppShell } from './components/v2/layout/V2AppShell';
import { useAppState } from './state/AppState';
import { PlatformShell } from './components/drdroid/PlatformShell';
import { PlatformHome } from './components/drdroid/PlatformHome';
import { AssistantPage } from './components/drdroid/AssistantPage';
import { KubernetesPage } from './components/drdroid/KubernetesPage';
import { MonitoringPage } from './components/drdroid/MonitoringPage';
import { ReliabilityPage } from './components/drdroid/ReliabilityPage';
import { AgriPlatformPage } from './components/platform/AgriPlatformPage';

const DashboardRouteSync: React.FC = () => {
  const { setCurrentScreen } = useAppState();
  useEffect(() => {
    setCurrentScreen('dashboard');
  }, [setCurrentScreen]);
  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <V2AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/platform"
          element={
            <PlatformShell>
              <PlatformHome />
            </PlatformShell>
          }
        />
        <Route
          path="/platform/assistant"
          element={
            <PlatformShell>
              <AssistantPage />
            </PlatformShell>
          }
        />
        <Route
          path="/platform/kubernetes"
          element={
            <PlatformShell>
              <KubernetesPage />
            </PlatformShell>
          }
        />
        <Route
          path="/platform/monitoring"
          element={
            <PlatformShell>
              <MonitoringPage />
            </PlatformShell>
          }
        />
        <Route
          path="/platform/reliability"
          element={
            <PlatformShell>
              <ReliabilityPage />
            </PlatformShell>
          }
        />
        <Route path="/platform/agritech" element={<AgriPlatformPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route
          path="/app"
          element={
            <RequireSession>
              <DashboardRouteSync />
            </RequireSession>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </V2AppShell>
  );
};

export default App;
