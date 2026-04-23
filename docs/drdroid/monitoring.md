## Monitoring (Prometheus + Grafana)

### What you need to show in the video

Cluster health (baseline):
- Node CPU / memory
- Pod CPU / memory
- Pod restarts
- Namespace drill-down (focus on `drdroid-llm`)

App health (LLM path):
- AI gateway request rate, error rate
- p95 latency for `/chat`
- Fallback rate (Ollama vs commercial vs degraded)

### Local install (Helm)

Use kube-prometheus-stack with the provided values:

- `k8s/monitoring-values.yaml`

Recommended shape:
- Namespace: `monitoring`
- Release name: `kps`

### Grafana access (local)

For recording, port-forward Grafana and show dashboards updating during chat requests.

