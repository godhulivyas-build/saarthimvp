## Kubernetes manifests (local-first)

This directory contains the Kubernetes manifests for the DrDroid assignment demo.

### Apply order

1. `k8s/namespace.yaml`
2. `k8s/ollama.yaml`
3. `k8s/ollama-model-pull-job.yaml`
4. `k8s/gateway.yaml`
4. `k8s/ingress.yaml` (optional for local; port-forward is fine)

### Model pull (post-deploy)

After the Ollama pod is running, you can pull a CPU-friendly model either:

- **Automatically**: apply `k8s/ollama-model-pull-job.yaml` (recommended)\n
- **Manually**: exec into the pod and run `ollama pull ...`

- `llama3.2:1b`

This keeps the demo fast and predictable on CPU.

### AI gateway image (local)

`k8s/gateway.yaml` references `drdroid/ai-gateway:local`.\n
For local Kubernetes, build it with Docker and ensure your cluster can see the image (Docker Desktop Kubernetes shares the Docker engine).

