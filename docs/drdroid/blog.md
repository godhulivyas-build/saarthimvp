## How to deploy an Open Source LLM reliably?

This post walks through an end-to-end, local-first setup that you can later move to cloud:

- **Open-source LLM**: Ollama running inside Kubernetes
- **Reliability boundary**: an AI gateway that enforces timeouts and returns degraded responses instead of hanging
- **Monitoring**: Prometheus + Grafana for cluster and application signals
- **UI**: a chatbot wrapper that proves the full path works

### 1) Reliability is the product

When you ship LLMs into operational workflows (dispatch, customer support, delay triage), reliability matters more than model cleverness:

- **Hanging requests** erode trust faster than “I don’t know”.
- **Slow responses** can cascade into missed dispatch windows.\n
- **Silent failures** create support load and incident churn.

In this demo, “reliability” means:
- A hard timeout on model calls
- A stable API contract to the UI
- Metrics you can alert on (latency, error rate, fallbacks)

### 2) Deploying Ollama on Kubernetes (the right minimum)

Core Kubernetes features used:

- **Namespace isolation**: `drdroid-llm`
- **Persistent storage**: model cache via PVC, so restarts don’t re-pull
- **Health checks**: readiness/liveness so traffic only flows to healthy pods
- **Resource limits**: avoid noisy-neighbor problems and OOM surprise

Manifests live in `k8s/`:
- `k8s/namespace.yaml`
- `k8s/ollama.yaml`
- `k8s/ollama-model-pull-job.yaml`

Model choice:
- `llama3.2:1b` (CPU-friendly for a local demo)

### 3) The AI Gateway (why it exists)

The UI should not talk directly to the model runtime.

The gateway is where you put reliability controls:
- **Timeouts** (fail fast)
- **Degraded responses** (still useful)
- Optional: **commercial fallback** (Gemini/OpenAI/Claude) for bonus comparison
- **Metrics endpoint** for Prometheus (`/metrics`)

Gateway endpoints:
- `/meta` model identity + disclaimers (“latest information” is training data, not live browsing)
- `/chat` scenario prompts (route/delay/bottleneck/load/support/summary)
- `/metrics` for Grafana dashboards

### 4) Monitoring with Grafana (what to watch)

Kubernetes health:
- Node/pod CPU + memory
- Pod restarts
- Namespace drill-down: `drdroid-llm`

Gateway health (golden signals):
- Request rate
- Error rate
- Latency (p95)
- Fallback rate (degraded responses)

The goal is to be able to say:\n
“When the model gets slow or down, we can see it, alert on it, and still return a safe, bounded response.”

### 5) UI chatbot demo

Saarthi is a wrapper UI. The platform demo lives under:
- `/platform` (Product)
- `/platform/assistant` (Chatbot + scenarios)\n
- `/platform/kubernetes` (deployment overview)
- `/platform/monitoring` (Grafana story)\n
- `/platform/reliability` (SLOs and failure modes)

The assistant view displays reliability signals per response:
- requestId
- provider (ollama/degraded)
- model
- latencyMs

### 6) Troubleshooting (common failure modes)

- **Pod stuck pulling image**: check Docker Desktop registry access, image name, and `imagePullPolicy`.
- **Ollama slow**: reduce model size, increase memory limit, ensure model pull finished.
- **OOMKills**: bump Ollama memory; watch restarts in Grafana.\n
- **High latency**: confirm gateway timeout; add caching for repeated prompts if needed.

### 7) Bonus: OSS vs Commercial comparison

Use `docs/drdroid/prompts.md` to run 10 prompts and compare:
- speed (latency)
- cost (estimate)
- quality (rubric)

