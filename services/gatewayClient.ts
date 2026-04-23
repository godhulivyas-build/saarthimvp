export type GatewayProvider = 'ollama' | 'commercial' | 'degraded';

export type GatewayMeta = {
  requestId: string;
  providers: { primary: string; commercial: string };
  ollama: { baseUrl: string; defaultModel: string };
  reliability: { timeoutsMs: number; note: string };
};

export type ChatScenario = 'route' | 'delay' | 'bottleneck' | 'load' | 'support' | 'summary' | 'meta';

export type GatewayChatResponse = {
  requestId: string;
  provider: GatewayProvider;
  model: string;
  latencyMs: number;
  answer: string;
  error?: string;
};

const DEFAULT_BASE = (import.meta as any).env?.VITE_GATEWAY_URL || '';

function baseUrl(): string {
  return DEFAULT_BASE || '';
}

export async function fetchGatewayMeta(): Promise<GatewayMeta> {
  const res = await fetch(`${baseUrl()}/meta`);
  if (!res.ok) throw new Error(`meta_http_${res.status}`);
  return (await res.json()) as GatewayMeta;
}

export async function sendGatewayChat(prompt: string, scenario?: ChatScenario): Promise<GatewayChatResponse> {
  const res = await fetch(`${baseUrl()}/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, scenario }),
  });
  if (!res.ok) throw new Error(`chat_http_${res.status}`);
  return (await res.json()) as GatewayChatResponse;
}

