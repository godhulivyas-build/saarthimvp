import React from 'react';
import { Card } from '../v2/ui/Card';
import { V2Button } from '../v2/ui/V2Button';
import type { ChatScenario, GatewayChatResponse, GatewayMeta } from '../../services/gatewayClient';
import { fetchGatewayMeta, sendGatewayChat } from '../../services/gatewayClient';

const scenarios: { id: ChatScenario; title: string; seed: string }[] = [
  { id: 'meta', title: 'Model identity', seed: 'Which model are you? What are your limits?' },
  { id: 'route', title: 'Best route', seed: 'Best route from origin A to destination B with a heavy vehicle. Explain constraints.' },
  { id: 'delay', title: 'Predict delays', seed: 'Predict delivery delays for a 220km trip. What signals matter most?' },
  { id: 'bottleneck', title: 'Explain bottlenecks', seed: 'Explain the likely transport bottlenecks in last-mile dispatch.' },
  { id: 'load', title: 'Load optimization', seed: 'Suggest load optimization for mixed shipments across 3 drops.' },
  { id: 'summary', title: 'Summarize shipment issues', seed: 'Summarize the issues in this shipment log: late pickup, route deviation, temperature excursion.' },
  { id: 'support', title: 'Support response', seed: 'Generate a short support response to a customer asking why the shipment is late.' },
];

export const AssistantPage: React.FC = () => {
  const [meta, setMeta] = React.useState<GatewayMeta | null>(null);
  const [metaErr, setMetaErr] = React.useState<string>('');
  const [scenario, setScenario] = React.useState<ChatScenario>('meta');
  const [prompt, setPrompt] = React.useState<string>(scenarios[0].seed);
  const [loading, setLoading] = React.useState(false);
  const [resp, setResp] = React.useState<GatewayChatResponse | null>(null);

  React.useEffect(() => {
    fetchGatewayMeta()
      .then((m) => {
        setMeta(m);
        setMetaErr('');
      })
      .catch((e) => setMetaErr(String((e as Error)?.message || e)));
  }, []);

  const run = async () => {
    setLoading(true);
    setResp(null);
    try {
      const r = await sendGatewayChat(prompt, scenario);
      setResp(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="saarthi-headline text-xl sm:text-2xl font-extrabold">AI Chatbot (via Gateway)</h2>
        <p className="text-sm text-[var(--saarthi-on-surface-variant)]">
          This page is designed for infra demos: request IDs, latency, fallbacks, and a stable API boundary between UI and the LLM.
        </p>
      </div>

      <Card className="p-4 space-y-2">
        <p className="font-bold">Gateway meta</p>
        {meta ? (
          <div className="text-xs text-[var(--saarthi-on-surface-variant)] space-y-1">
            <div>
              <span className="font-bold">Primary</span>: {meta.providers.primary} ({meta.ollama.defaultModel})
            </div>
            <div>
              <span className="font-bold">Timeout</span>: {meta.reliability.timeoutsMs}ms
            </div>
            <div className="opacity-80">{meta.reliability.note}</div>
          </div>
        ) : (
          <p className="text-xs text-red-600">{metaErr || 'Loading...'}</p>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-1">
          <p className="font-bold mb-2">Scenarios</p>
          <div className="space-y-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScenario(s.id);
                  setPrompt(s.seed);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl border text-sm font-bold ${
                  scenario === s.id ? 'bg-[var(--saarthi-primary)] text-white border-[var(--saarthi-primary)]' : 'bg-white border-[var(--saarthi-outline-soft)]'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2 space-y-3">
          <div>
            <p className="font-bold mb-1">Prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[140px] rounded-xl border border-[var(--saarthi-outline-soft)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <V2Button variant="primary" bilingual={{ primary: loading ? 'Running…' : 'Run', secondary: 'Demo' }} onClick={run} disabled={loading} />
            <span className="text-xs text-[var(--saarthi-on-surface-variant)]">Scenario: {scenario}</span>
          </div>

          <div>
            <p className="font-bold mb-1">Response</p>
            {resp ? (
              <div className="rounded-xl border border-[var(--saarthi-outline-soft)] bg-white p-3 text-sm space-y-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--saarthi-on-surface-variant)]">
                  <span>
                    <span className="font-bold">requestId</span>: {resp.requestId}
                  </span>
                  <span>
                    <span className="font-bold">provider</span>: {resp.provider}
                  </span>
                  <span>
                    <span className="font-bold">model</span>: {resp.model}
                  </span>
                  <span>
                    <span className="font-bold">latency</span>: {resp.latencyMs}ms
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{resp.answer}</pre>
                {resp.error ? <p className="text-xs text-red-600">error: {resp.error}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--saarthi-on-surface-variant)]">No response yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

