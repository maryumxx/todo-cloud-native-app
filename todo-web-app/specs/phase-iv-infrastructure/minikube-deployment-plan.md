# Phase IV: Minikube Deployment Plan

**Version:** 1.0.0
**Date:** 2026-02-01
**Estimated Steps:** 12

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Docker Desktop installed and running
- [ ] Minikube installed (`minikube version`)
- [ ] Helm installed (`helm version`)
- [ ] kubectl installed (`kubectl version --client`)
- [ ] Docker images built: `todo-frontend`, `todo-backend`

---

## Step-by-Step Deployment Plan

### Step 1: Start Minikube Cluster

```bash
# Start Minikube with recommended resources for this application
minikube start --cpus=4 --memory=4096 --driver=docker

# Verify cluster is running
minikube status
```

**Expected Output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

### Step 2: Enable Minikube Addons

```bash
# Enable metrics server for HPA (optional for local dev)
minikube addons enable metrics-server

# Enable ingress controller (optional)
minikube addons enable ingress

# Verify addons
minikube addons list | grep enabled
```

---

### Step 3: Load Docker Images into Minikube

Since you have local Docker images, load them into Minikube's Docker daemon:

```bash
# Option A: Load images directly (recommended)
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Option B: Use Minikube's Docker daemon (alternative)
# eval $(minikube docker-env)  # On Linux/Mac
# minikube docker-env | Invoke-Expression  # On Windows PowerShell

# Verify images are loaded
minikube image ls | grep todo
```

**Expected Output:**
```
docker.io/library/todo-frontend:latest
docker.io/library/todo-backend:latest
```

---

### Step 4: Create Namespace

```bash
# Create the todo-app namespace
kubectl create namespace todo-app

# Verify namespace
kubectl get namespaces | grep todo
```

---

### Step 5: Create Backend Secrets

Create secrets for the backend service:

```bash
# Create secret with required values (replace with your actual values)
kubectl create secret generic todo-app-backend-secrets \
  --namespace=todo-app \
  --from-literal=DATABASE_URL="sqlite:///./todo.db" \
  --from-literal=SECRET_KEY="your-jwt-secret-key-here" \
  --from-literal=OPENAI_API_KEY="your-openai-api-key-here"

# Verify secret was created
kubectl get secrets -n todo-app
```

**Alternative: Create secret from file**
```bash
# Create a .env file first, then:
kubectl create secret generic todo-app-backend-secrets \
  --namespace=todo-app \
  --from-env-file=.env
```

---

### Step 6: Deploy with Helm

```bash
# Navigate to the project root
cd C:\Users\Maryam\OneDrive\Desktop\todo-app\todo-web-app

# Install the Helm chart with Minikube-optimized values
helm install todo-app ./charts/todo-app \
  -f ./charts/todo-app/values-minikube.yaml \
  --namespace todo-app

# Or upgrade if already installed
helm upgrade --install todo-app ./charts/todo-app \
  -f ./charts/todo-app/values-minikube.yaml \
  --namespace todo-app
```

**Expected Output:**
```
NAME: todo-app
LAST DEPLOYED: Sat Feb  1 2026
NAMESPACE: todo-app
STATUS: deployed
REVISION: 1
```

---

### Step 7: Verify Deployment Status

```bash
# Watch pods come up (Ctrl+C to exit)
kubectl get pods -n todo-app -w

# Check all resources
kubectl get all -n todo-app

# Check deployment status
kubectl rollout status deployment/todo-app-backend -n todo-app
kubectl rollout status deployment/todo-app-frontend -n todo-app
```

**Expected Output:**
```
NAME                                    READY   STATUS    RESTARTS   AGE
pod/todo-app-backend-xxx                1/1     Running   0          60s
pod/todo-app-frontend-xxx               1/1     Running   0          60s

NAME                           TYPE        CLUSTER-IP      PORT(S)
service/todo-app-backend-svc   ClusterIP   10.96.x.x       8000/TCP
service/todo-app-frontend-svc  NodePort    10.96.x.x       80:30080/TCP
```

---

### Step 8: Access the Application

```bash
# Get the Minikube IP
minikube ip

# Access via NodePort (combine IP with port 30080)
# Example: http://192.168.49.2:30080

# Or use minikube service command (opens browser automatically)
minikube service todo-app-frontend-svc -n todo-app

# Alternative: Port forward for direct localhost access
kubectl port-forward svc/todo-app-frontend-svc 3000:80 -n todo-app
# Then access: http://localhost:3000
```

---

### Step 9: Verify Health Endpoints

```bash
# Test backend health (via port-forward)
kubectl port-forward svc/todo-app-backend-svc 8000:8000 -n todo-app &

# Test health endpoint
curl http://todo-backend-svc:8000/health

# Test ready endpoint
curl http://todo-backend-svc:8000/ready

# Kill the port-forward
pkill -f "port-forward"
```

**Expected Output:**
```json
{"status": "healthy", "timestamp": "2026-02-01T..."}
```

---

### Step 10: View Logs (Troubleshooting)

```bash
# View backend logs
kubectl logs -l app.kubernetes.io/component=backend -n todo-app -f

# View frontend logs
kubectl logs -l app.kubernetes.io/component=frontend -n todo-app -f

# View logs for a specific pod
kubectl logs <pod-name> -n todo-app

# View previous container logs (if crashed)
kubectl logs <pod-name> -n todo-app --previous
```

---

### Step 11: Debugging Commands

```bash
# Describe pod for events and status
kubectl describe pod -l app.kubernetes.io/component=backend -n todo-app

# Execute into a running container
kubectl exec -it <pod-name> -n todo-app -- /bin/sh

# Check service endpoints
kubectl get endpoints -n todo-app

# Check events in namespace
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Test internal DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n todo-app -- \
  nslookup todo-app-backend-svc
```

---

### Step 12: Cleanup (When Done)

```bash
# Uninstall Helm release
helm uninstall todo-app -n todo-app

# Delete namespace (removes all resources)
kubectl delete namespace todo-app

# Stop Minikube (preserves state)
minikube stop

# Delete Minikube cluster (complete cleanup)
minikube delete
```

---

## Quick Reference Commands

### One-Liner Full Deployment

```bash
# Complete deployment in one command sequence
minikube start --cpus=4 --memory=4096 && \
minikube image load todo-frontend:latest && \
minikube image load todo-backend:latest && \
kubectl create namespace todo-app && \
kubectl create secret generic todo-app-backend-secrets \
  --namespace=todo-app \
  --from-literal=DATABASE_URL="sqlite:///./todo.db" \
  --from-literal=SECRET_KEY="dev-secret-key" \
  --from-literal=OPENAI_API_KEY="" && \
helm upgrade --install todo-app ./charts/todo-app \
  -f ./charts/todo-app/values-minikube.yaml \
  --namespace todo-app && \
kubectl get pods -n todo-app -w
```

### Windows PowerShell Version

```powershell
# PowerShell deployment sequence
minikube start --cpus=4 --memory=4096
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
kubectl create namespace todo-app
kubectl create secret generic todo-app-backend-secrets `
  --namespace=todo-app `
  --from-literal=DATABASE_URL="sqlite:///./todo.db" `
  --from-literal=SECRET_KEY="dev-secret-key" `
  --from-literal=OPENAI_API_KEY=""
helm upgrade --install todo-app ./charts/todo-app `
  -f ./charts/todo-app/values-minikube.yaml `
  --namespace todo-app
kubectl get pods -n todo-app -w
```

---

## AI-Assisted Commands (kubectl-ai / kagent)

If you have kubectl-ai or kagent installed:

### Using kubectl-ai

```bash
# Generate deployment manifest
kubectl-ai "create a deployment for todo-backend with image todo-backend:latest, 2 replicas, port 8000"

# Scale deployment
kubectl-ai "scale todo-app-backend deployment to 3 replicas in todo-app namespace"

# Troubleshoot issues
kubectl-ai "why are pods in todo-app namespace not running"
```

### Using kagent

```bash
# Deploy application
kagent deploy --name todo-app --namespace todo-app --chart ./charts/todo-app

# Check status
kagent status todo-app -n todo-app

# Auto-remediate issues
kagent diagnose -n todo-app
```

---

## Troubleshooting Guide

### Issue: Pods stuck in ImagePullBackOff

**Cause:** Images not available in Minikube

**Solution:**
```bash
# Verify images are loaded
minikube image ls | grep todo

# Reload images if missing
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Ensure imagePullPolicy is Never in values
# Check: imagePullPolicy: Never
```

### Issue: Pods stuck in CrashLoopBackOff

**Cause:** Application error or missing dependencies

**Solution:**
```bash
# Check logs for error details
kubectl logs <pod-name> -n todo-app --previous

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port already in use
```

### Issue: Service not accessible

**Cause:** Network or service misconfiguration

**Solution:**
```bash
# Verify service has endpoints
kubectl get endpoints -n todo-app

# Check if pods have correct labels
kubectl get pods -n todo-app --show-labels

# Verify NodePort is allocated
kubectl get svc -n todo-app -o wide
```

### Issue: Frontend can't reach backend

**Cause:** DNS or network policy issue

**Solution:**
```bash
# Test DNS resolution from frontend pod
kubectl exec -it <frontend-pod> -n todo-app -- wget -qO- http://todo-app-backend-svc:8000/health

# Disable network policies temporarily
# In values-minikube.yaml: networkPolicy.enabled: false
```

### Issue: Minikube runs out of resources

**Cause:** Resource limits too high

**Solution:**
```bash
# Use optimized Minikube values
helm upgrade todo-app ./charts/todo-app -f ./charts/todo-app/values-minikube.yaml -n todo-app

# Or increase Minikube resources
minikube stop
minikube config set cpus 6
minikube config set memory 8192
minikube start
```

---

## Resource Optimization Recommendations

### For Development (Default Minikube values)

| Resource | Frontend | Backend |
|----------|----------|---------|
| CPU Request | 50m | 100m |
| CPU Limit | 200m | 500m |
| Memory Request | 64Mi | 128Mi |
| Memory Limit | 128Mi | 256Mi |
| Replicas | 1 | 1 |

### For Testing (Increased capacity)

| Resource | Frontend | Backend |
|----------|----------|---------|
| CPU Request | 100m | 250m |
| CPU Limit | 500m | 1000m |
| Memory Request | 128Mi | 256Mi |
| Memory Limit | 256Mi | 512Mi |
| Replicas | 2 | 2 |

### Enable HPA for Load Testing

```bash
# Patch to enable HPA
helm upgrade todo-app ./charts/todo-app \
  -f ./charts/todo-app/values-minikube.yaml \
  --set frontend.autoscaling.enabled=true \
  --set backend.autoscaling.enabled=true \
  --namespace todo-app
```

---

## Validation Checklist

After deployment, verify:

- [ ] All pods are Running: `kubectl get pods -n todo-app`
- [ ] Services have endpoints: `kubectl get endpoints -n todo-app`
- [ ] Backend health check passes: `curl $(minikube ip):30080/api/health` (via frontend proxy) or port-forward
- [ ] Frontend loads in browser: `minikube service todo-app-frontend-svc -n todo-app`
- [ ] Can create/read todos via UI
- [ ] Chatbot functionality works (if OPENAI_API_KEY is set)

