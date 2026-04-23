import express from 'express';
import client from 'prom-client';
import { z } from 'zod';

const PORT = Number(process.env.PORT || 8080);
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';
const COMMERCIAL_PROVIDER = process.env.COMMERCIAL_PROVIDER || 'none'; // gemini|openai|anthropic|none
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 15_000);
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

const app = express();
app.use(express.json({ limit: '1mb' }));

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpRequestsTotal = new client.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total HTTP requests to the AI gateway',
  labelNames: ['route', 'method', 'status'] as const,
  registers: [registry],
});

const chatLatencyMs = new client.Histogram({
  name: 'gateway_chat_latency_ms',
  help: 'Latency for /chat requests',
  labelNames: ['provider', 'status'] as const,
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 15000, 30000],
  registers: [registry],
});

const fallbackTotal = new client.Counter({
  name: 'gateway_fallback_total',
  help: 'Count of degraded/fallback responses served',
  labelNames: ['reason'] as const,
  registers: [registry],
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  // @ts-expect-error allow attaching signal in callers when needed
  (promise as any).abortController = ac;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      ac.signal.addEventListener('abort', () => reject(new Error('timeout')));
    }),
  ]).finally(() => clearTimeout(t));
}

const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(8000),
  scenario: z
    .enum(['route', 'delay', 'bottleneck', 'load', 'support', 'summary', 'meta'])
    .optional(),
  model: z.string().min(1).max(200).optional(),
});

function requestId(): string {
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/meta', async (_req, res) => {
  const rid = requestId();
  res.json({
    requestId: rid,
    providers: {
      primary: 'ollama',
      commercial: COMMERCIAL_PROVIDER,
    },
    ollama: {
      baseUrl: OLLAMA_BASE_URL,
      defaultModel: DEFAULT_MODEL,
    },
    reliability: {
      timeoutsMs: REQUEST_TIMEOUT_MS,
      note:
        "Open-source models don't have live internet by default. 'Latest info' means the model's training data, not real-time browsing.",
    },
  });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
});

app.post('/chat', async (req, res) => {
  const rid = requestId();
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    httpRequestsTotal.inc({ route: '/chat', method: 'POST', status: '400' });
    res.status(400).json({ requestId: rid, error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const { prompt, scenario, model } = parsed.data;
  const chosenModel = model || DEFAULT_MODEL;

  const start = Date.now();
  try {
    const p = fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: chosenModel,
        prompt: scenario ? `Scenario: ${scenario}\n\n${prompt}` : prompt,
        stream: false,
      }),
    });

    const r = await withTimeout(p as any, REQUEST_TIMEOUT_MS);
    const ok = (r as Response).ok;
    const status = (r as Response).status;

    if (!ok) {
      throw new Error(`ollama_http_${status}`);
    }

    const data = (await (r as Response).json()) as { response?: string; model?: string; created_at?: string };
    const text = (data.response || '').trim();

    httpRequestsTotal.inc({ route: '/chat', method: 'POST', status: '200' });
    chatLatencyMs.observe({ provider: 'ollama', status: 'ok' }, Date.now() - start);

    res.json({
      requestId: rid,
      provider: 'ollama',
      model: data.model || chosenModel,
      latencyMs: Date.now() - start,
      answer: text,
    });
  } catch (e) {
    httpRequestsTotal.inc({ route: '/chat', method: 'POST', status: '200' });
    chatLatencyMs.observe({ provider: 'ollama', status: 'error' }, Date.now() - start);
    fallbackTotal.inc({ reason: 'ollama_unavailable' });

    res.json({
      requestId: rid,
      provider: 'degraded',
      model: chosenModel,
      latencyMs: Date.now() - start,
      answer:
        "LLM is temporarily unavailable. Degraded mode: I can still suggest a checklist—share origin, destination, load type/weight, time window, and constraints (road closures, vehicle limits).",
      error: String((e as Error)?.message || e),
    });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AI gateway listening on :${PORT}`);
});

