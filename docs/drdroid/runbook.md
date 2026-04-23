## Local runbook (end-to-end)

This runbook is the step-by-step “do exactly this” path to get a recordable demo:

1) **Ollama** running inside Kubernetes (with persistence)\n
2) **Prometheus + Grafana** monitoring cluster health\n
3) **AI Gateway** mediating the UI ↔ LLM calls\n
4) **Saarthi UI** as the wrapper for the platform demo\n

### 0) Prereqs

Complete `docs/drdroid/local-setup.md`.

### 1) Deploy LLM + gateway + ingress

Apply manifests under `k8s/` (namespace first, then storage, then services).

### 2) Install monitoring

Install kube-prometheus-stack (Prometheus + Grafana) and validate cluster dashboards.

Suggested commands (local):

- Add repo, then install into `monitoring` namespace using `k8s/monitoring-values.yaml`
- Port-forward Grafana and log in (admin / admin)

### 3) Validate the demo

- Call gateway `/meta` to show model identity\n
- Call gateway `/chat` with a few prompts\n
- Open Grafana and show CPU/memory + restarts + request latency\n

### 4) Record

Follow `docs/drdroid/video-script.md`.

