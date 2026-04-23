import React from 'react';
import { Card } from '../v2/ui/Card';

export const ReliabilityPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="saarthi-headline text-xl sm:text-2xl font-extrabold">Why reliability matters</h2>
        <p className="text-sm text-[var(--saarthi-on-surface-variant)]">
          In logistics, reliability is the product: users don’t forgive silent failures, long hangs, or inconsistent answers—especially during dispatch and delays.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="font-bold">SLOs (example)</p>
          <ul className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)] space-y-1">
            <li>- Availability: 99.9% for gateway</li>
            <li>- Latency: p95 &lt; 2s for cached / lightweight responses</li>
            <li>- Degraded mode: always return something useful within timeout</li>
          </ul>
        </Card>

        <Card className="p-4">
          <p className="font-bold">Failure modes</p>
          <ul className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)] space-y-1">
            <li>- Model down / slow</li>
            <li>- OOMKills due to undersized memory</li>
            <li>- Cold-start + model pull delays</li>
            <li>- Rollout issues (bad config, bad image)</li>
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <p className="font-bold">Mitigations demonstrated in this repo</p>
        <ul className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)] space-y-1">
          <li>- Readiness/liveness probes gate traffic</li>
          <li>- Timeouts in gateway prevent UI hanging</li>
          <li>- Degraded fallback response preserves user trust</li>
          <li>- Metrics (/metrics) support Grafana dashboards and alerting</li>
        </ul>
      </Card>
    </div>
  );
};

