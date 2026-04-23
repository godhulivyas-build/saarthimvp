## Local setup (Windows + Docker Desktop Kubernetes)

This project is designed to be demoed **locally first** so you can iterate quickly and record the assignment video.

### Required tools

- **Docker Desktop** (with Kubernetes enabled)
- **kubectl**
- **Helm**

### Verify installs (PowerShell)

Run these and ensure they print versions (no “not recognized” errors):

```powershell
docker version
kubectl version --client
helm version
```

Then confirm the Docker Desktop Kubernetes cluster is reachable:

```powershell
kubectl config current-context
kubectl get nodes -o wide
```

### CPU-friendly model choice (recommended)

For a predictable local demo on CPU, use:

- **Ollama model**: `llama3.2:1b`

It’s small enough to pull/run on CPU while still answering the “which model are you?” style prompts.

