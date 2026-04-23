import React from 'react';

export const KubernetesPage: React.FC = () => {
  return (
    <div className="space-y-3">
      <h2 className="saarthi-headline text-xl sm:text-2xl font-extrabold">Kubernetes deployment</h2>
      <p className="text-sm text-[var(--saarthi-on-surface-variant)]">
        This demo deploys an open-source LLM (Ollama) and an AI Gateway to a local Kubernetes cluster.
      </p>
      <ul className="text-sm text-[var(--saarthi-on-surface-variant)] space-y-1">
        <li>- Namespace: <span className="font-bold">drdroid-llm</span></li>
        <li>- Ollama: PVC for model cache, liveness/readiness probes, resource limits</li>
        <li>- Model pull: a one-shot Job pulls <span className="font-bold">llama3.2:1b</span></li>
        <li>- Gateway: stable API boundary + /metrics for Prometheus</li>
      </ul>
      <p className="text-xs text-[var(--saarthi-on-surface-variant)]">
        See <span className="font-bold">k8s/</span> and <span className="font-bold">docs/drdroid/runbook.md</span> for apply order.
      </p>
    </div>
  );
};

