import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../v2/ui/Card';

export const PlatformHome: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="saarthi-headline text-2xl sm:text-3xl font-extrabold">Logistics AI Assistant Platform</h1>
        <p className="text-sm sm:text-base text-[var(--saarthi-on-surface-variant)] leading-relaxed">
          Saarthi is the wrapper UI. The center of this demo is <span className="font-bold">infra, reliability, deployment, and monitoring</span>:
          an open-source LLM deployed on Kubernetes, observed in Grafana, and exposed through a reliability-focused gateway.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Assistant', body: 'Chat + scenarios (routes, delays, bottlenecks, summaries).', to: '/platform/assistant' },
          { title: 'Kubernetes', body: 'Deploy Ollama + gateway with persistence and probes.', to: '/platform/kubernetes' },
          { title: 'Monitoring', body: 'Grafana dashboards for cluster and gateway metrics.', to: '/platform/monitoring' },
          { title: 'Reliability', body: 'SLOs, fallbacks, timeouts, and rollout safety.', to: '/platform/reliability' },
        ].map((x) => (
          <Link key={x.title} to={x.to} className="block">
            <Card className="h-full p-4 hover:shadow-md transition-shadow">
              <p className="font-extrabold text-[var(--saarthi-primary)]">{x.title}</p>
              <p className="mt-1 text-sm text-[var(--saarthi-on-surface-variant)]">{x.body}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4">
        <p className="font-bold">What you’ll demo (DrDroid assignment)</p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--saarthi-on-surface-variant)]">
          <li>- Open-source LLM (Ollama) running in Kubernetes</li>
          <li>- Grafana monitoring Kubernetes health + gateway metrics</li>
          <li>- A UI chatbot that talks to the LLM and answers “Which model are you?”</li>
          <li>- Reliability story: graceful degradation when the model is slow/down</li>
        </ul>
      </Card>
    </div>
  );
};

