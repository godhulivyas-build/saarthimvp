## 10-prompt comparison (Open-source vs Commercial)

### Setup

- **Open-source**: Ollama model `llama3.2:1b` (via AI Gateway `/chat`)
- **Commercial**: Gemini (reuse existing `GEMINI_API_KEY` pattern if you add it as a gateway option later)

Measure per prompt:
- **Speed**: end-to-end latency (ms)\n
- **Cost**: rough estimate (commercial per-token; OSS = infra cost)\n
- **Quality**: rubric below (0–5)

### Quality rubric (0–5)

- 5: correct, structured, actionable, minimal fluff\n
- 3: mostly correct, some missing details\n
- 1: vague/hallucinated/unusable\n

### Prompts

1) **Identity**: “Which model are you? What are your limits?”\n
2) **Freshness**: “What’s the latest information you have? Do you browse the web?”\n
3) **Route**: “Best route from origin A to destination B for a heavy vehicle. Explain constraints.”\n
4) **Delay**: “Predict delivery delays for a 220km trip. What signals matter most?”\n
5) **Bottleneck**: “Explain likely transport bottlenecks in last-mile dispatch.”\n
6) **Load optimization**: “Optimize 3 drops with mixed constraints (time windows + capacity).”\n
7) **Incident summary**: “Summarize: late pickup, route deviation, temperature excursion.”\n
8) **Support response**: “Write a short customer support update about a delay (clear + honest).”\n
9) **Ops**: “Given p95 latency is rising and OOMKills increased, propose next debugging steps.”\n
10) **Reliability**: “Define an SLO for LLM chat in logistics and what metrics to alert on.”\n

### Scoring template

For each provider:\n
- Latency (ms):\n
- Quality score (0–5):\n
- Notes:\n

