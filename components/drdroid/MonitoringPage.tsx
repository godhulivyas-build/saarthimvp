import React from 'react';

export const MonitoringPage: React.FC = () => {
  return (
    <div className="space-y-3">
      <h2 className="saarthi-headline text-xl sm:text-2xl font-extrabold">Grafana monitoring</h2>
      <p className="text-sm text-[var(--saarthi-on-surface-variant)]">
        Grafana shows Kubernetes health metrics (CPU, memory, restarts) and gateway request metrics (latency/errors).
      </p>
      <ul className="text-sm text-[var(--saarthi-on-surface-variant)] space-y-1">
        <li>- Cluster health: node + pod CPU/memory, restarts</li>
        <li>- Golden signals for AI path: RPS, error rate, p95 latency</li>
        <li>- Reliability proof: fallback rate when Ollama is unavailable</li>
      </ul>
      <p className="text-xs text-[var(--saarthi-on-surface-variant)]">Install notes: `docs/drdroid/monitoring.md`</p>
    </div>
  );
};

