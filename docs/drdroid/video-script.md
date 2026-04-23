## Video script: “How to deploy an Open Source LLM reliably?”

### Target length
- 6–10 minutes (core)
- +2–4 minutes (bonus comparison segment)

### Shot list (what to record)

1) **Hook (10–20s)**\n
- “We’ll deploy an open-source LLM on Kubernetes, monitor it in Grafana, and expose it through a reliability-first gateway.”

2) **Architecture (30–45s)**\n
- Show simple diagram:\n
  UI → AI Gateway → Ollama\n
  Prometheus → Grafana\n

3) **Kubernetes deploy (2–3 min)**\n
- Apply namespace + Ollama\n
- Show PVC and probes\n
- Run model pull Job\n
- Confirm pod Ready

4) **Monitoring (1–2 min)**\n
- Install kube-prometheus-stack\n
- Port-forward Grafana\n
- Show node/pod CPU + memory\n
- Show pod restarts (should be stable)

5) **Gateway (1–2 min)**\n
- Show `/meta` response (model identity + disclaimer)\n
- Show `/metrics` endpoint exists\n

6) **UI chatbot demo (1–2 min)**\n
- Open `/platform/assistant`\n
- Run 2–3 scenarios\n
- Point out requestId + latencyMs\n

7) **Reliability moment (45–90s)**\n
- Simulate model failure/slowdown (stop pod / scale to 0)\n
- Run same prompt\n
- Show degraded response returned quickly\n
- Show Grafana: error rate or fallback counter spikes\n

8) **Wrap (15–20s)**\n
- Summarize: K8s deploy + Grafana + reliable gateway + UI proof

### Bonus segment (cost/speed/quality on 10 prompts)
- Run 10 prompts from `docs/drdroid/prompts.md`\n
- Compare OSS (Ollama) vs commercial (Gemini)\n
- Show a simple rubric and totals\n

