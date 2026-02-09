# Phase IV Implementation Plan: Cloud-Native Deployment

**Document Type:** Implementation Plan
**Phase:** IV — Infrastructure & Deployment
**Version:** 1.0.0
**Date:** 2026-01-30
**Status:** Draft
**Governed By:** [Phase IV Constitution](./../../.specify/memory/constitution.md)
**Implements:** [Phase IV Specification](./spec.md)

---

## 1. Executive Summary

This plan defines the implementation approach for deploying the Todo AI Chatbot system as a cloud-native application on Kubernetes. The plan is organized into six sequential implementation tracks, each building upon the previous.

**Implementation Duration:** 6 tracks, sequential execution
**Target Environment:** Minikube (local Kubernetes cluster)
**Deployment Method:** Helm Charts

---

## 2. Implementation Tracks Overview

| Track | Name | Dependencies | Deliverables |
|-------|------|--------------|--------------|
| 1 | Environment Setup | None | Minikube cluster, tools installed |
| 2 | Containerization | Track 1 | Dockerfiles, built images |
| 3 | Kubernetes Manifests | Track 2 | Raw K8s YAML resources |
| 4 | Helm Chart Development | Track 3 | Packaged Helm chart |
| 5 | Deployment & Validation | Track 4 | Running deployment, tests passed |
| 6 | AI Tools Integration | Track 5 | AI DevOps tools validated |

---

## 3. Track 1: Environment Setup

### 3.1 Objectives

Establish the local development environment with all required tooling for cloud-native deployment.

### 3.2 Prerequisites

- Windows/macOS/Linux workstation with virtualization support
- Administrative/sudo access for tool installation
- Minimum 8GB RAM, 4 CPU cores available
- 20GB free disk space

### 3.3 Tools to Install

| Tool | Version | Purpose |
|------|---------|---------|
| Docker Desktop | >= 24.0 | Container runtime |
| Minikube | >= 1.32 | Local Kubernetes cluster |
| kubectl | >= 1.28 | Kubernetes CLI |
| Helm | >= 3.14 | Package management |
| kubectl-ai | latest | AI-assisted kubectl |
| kagent | latest | Kubernetes AI agent |

### 3.4 Minikube Configuration

**Cluster Specification:**
- Driver: Docker (preferred) or Hyper-V/VirtualBox
- CPUs: 4
- Memory: 8192MB
- Disk: 20GB
- Kubernetes version: 1.28+
- Addons: metrics-server, ingress, dashboard (optional)

### 3.5 Verification Criteria

- [ ] `docker --version` returns >= 24.0
- [ ] `minikube status` shows Running
- [ ] `kubectl cluster-info` shows cluster accessible
- [ ] `helm version` returns >= 3.14
- [ ] `minikube addons list` shows metrics-server enabled

### 3.6 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Insufficient resources | Document minimum requirements; provide reduced-resource config |
| Virtualization conflicts | Provide driver alternatives (Docker, VirtualBox, Hyper-V) |
| Network proxy issues | Document proxy configuration for Minikube |

---

## 4. Track 2: Containerization

### 4.1 Objectives

Create production-ready Docker images for frontend and backend services following constitution standards.

### 4.2 Frontend Containerization

#### 4.2.1 Analysis

**Application Type:** Next.js 14 (React framework)
**Build Output:** Static assets + Node.js server (for SSR/API routes)
**Port:** 3000
**Dependencies:** Node.js 18+ LTS

#### 4.2.2 Dockerfile Strategy

**Multi-Stage Build Design:**

```
Stage 1: deps
├── Base: node:18-alpine
├── Purpose: Install dependencies
├── Cache: package.json, package-lock.json first
└── Output: node_modules

Stage 2: builder
├── Base: node:18-alpine
├── Purpose: Build Next.js application
├── Input: Source code + node_modules from deps
└── Output: .next build artifacts

Stage 3: runner (production)
├── Base: node:18-alpine
├── Purpose: Runtime only
├── Content: Built assets, production node_modules
├── User: nextjs (non-root, UID 1001)
└── Port: 3000
```

#### 4.2.3 Configuration Externalization

| Configuration | Method | Default |
|---------------|--------|---------|
| `NEXT_PUBLIC_API_URL` | Environment variable | `http://todo-backend-svc:8000` |
| `NODE_ENV` | Environment variable | `production` |
| `PORT` | Environment variable | `3000` |

#### 4.2.4 Health Endpoint

The frontend requires a health endpoint for Kubernetes probes. Next.js API route:

**Path:** `/api/health`
**Response:** `{ "status": "healthy", "timestamp": "<ISO8601>" }`

### 4.3 Backend Containerization

#### 4.3.1 Analysis

**Application Type:** FastAPI (Python ASGI)
**Entry Point:** `uvicorn src.main:app`
**Port:** 8000
**Dependencies:** Python 3.11+, requirements.txt

#### 4.3.2 Dockerfile Strategy

**Multi-Stage Build Design:**

```
Stage 1: builder
├── Base: python:3.11-slim
├── Purpose: Install dependencies
├── Cache: requirements.txt first
└── Output: Installed packages in virtual environment

Stage 2: runner (production)
├── Base: python:3.11-slim
├── Purpose: Runtime only
├── Content: Virtual environment + application code
├── User: appuser (non-root, UID 1001)
└── Port: 8000
```

#### 4.3.3 Configuration Externalization

| Configuration | Method | Default |
|---------------|--------|---------|
| `DATABASE_URL` | Environment variable | Required |
| `SECRET_KEY` | Environment variable (Secret) | Required |
| `OPENAI_API_KEY` | Environment variable (Secret) | Optional |
| `HOST` | Environment variable | `0.0.0.0` |
| `PORT` | Environment variable | `8000` |
| `DEBUG` | Environment variable | `false` |

#### 4.3.4 Health Endpoints

**Existing endpoints in `main.py`:**
- `/health` — Returns `{ "status": "healthy", "timestamp": "<ISO8601>" }`

**Required addition for readiness:**
- `/ready` — Returns 200 when database connection is verified

### 4.4 .dockerignore Files

**Frontend (.dockerignore):**
```
node_modules
.next
.git
*.md
.env*
Dockerfile*
docker-compose*
```

**Backend (.dockerignore):**
```
__pycache__
*.pyc
.git
*.md
.env*
Dockerfile*
docker-compose*
*.db
venv
.venv
tests
```

### 4.5 Image Build Commands

**Build within Minikube's Docker daemon:**
```
eval $(minikube docker-env)
```

**Tag Format:** `<service>:<version>`
- `todo-frontend:1.0.0`
- `todo-backend:1.0.0`

### 4.6 Verification Criteria

- [ ] Frontend image builds without errors
- [ ] Backend image builds without errors
- [ ] Frontend image size < 500MB
- [ ] Backend image size < 300MB
- [ ] Containers run as non-root (`docker run --rm <image> id`)
- [ ] Health endpoints respond correctly when container runs standalone
- [ ] No secrets or .env files in image (`docker history`)

### 4.7 AI Tool Integration Point

**Gordon (Docker AI Agent) Analysis:**
- Analyze Dockerfiles for optimization opportunities
- Check for security best practices
- Suggest layer optimization

---

## 5. Track 3: Kubernetes Manifests

### 5.1 Objectives

Create raw Kubernetes resource definitions that will later be templatized into Helm charts.

### 5.2 Namespace Definition

**Resource:** `namespace.yaml`

**Specification:**
- Name: `todo-app`
- Labels: Standard Kubernetes labels
- Resource quotas applied

### 5.3 Frontend Resources

#### 5.3.1 Deployment

**Resource:** `frontend-deployment.yaml`

| Field | Value |
|-------|-------|
| Replicas | 2 |
| Image | `todo-frontend:1.0.0` |
| Port | 3000 |
| CPU Request | 100m |
| CPU Limit | 500m |
| Memory Request | 128Mi |
| Memory Limit | 256Mi |
| Liveness Probe | HTTP GET `/api/health`, port 3000 |
| Readiness Probe | HTTP GET `/api/health`, port 3000 |
| Security Context | runAsNonRoot: true, runAsUser: 1001 |

#### 5.3.2 Service

**Resource:** `frontend-service.yaml`

| Field | Value |
|-------|-------|
| Name | `todo-frontend-svc` |
| Type | NodePort |
| Port | 80 |
| Target Port | 3000 |
| NodePort | 30080 |

#### 5.3.3 HorizontalPodAutoscaler

**Resource:** `frontend-hpa.yaml`

| Field | Value |
|-------|-------|
| Min Replicas | 2 |
| Max Replicas | 5 |
| Target CPU | 70% |

#### 5.3.4 PodDisruptionBudget

**Resource:** `frontend-pdb.yaml`

| Field | Value |
|-------|-------|
| Min Available | 1 |

### 5.4 Backend Resources

#### 5.4.1 Deployment

**Resource:** `backend-deployment.yaml`

| Field | Value |
|-------|-------|
| Replicas | 2 |
| Image | `todo-backend:1.0.0` |
| Port | 8000 |
| CPU Request | 250m |
| CPU Limit | 1000m |
| Memory Request | 256Mi |
| Memory Limit | 512Mi |
| Liveness Probe | HTTP GET `/health`, port 8000 |
| Readiness Probe | HTTP GET `/ready`, port 8000 |
| Security Context | runAsNonRoot: true, runAsUser: 1001 |
| Env From | ConfigMap: `backend-config`, Secret: `backend-secrets` |

#### 5.4.2 Service

**Resource:** `backend-service.yaml`

| Field | Value |
|-------|-------|
| Name | `todo-backend-svc` |
| Type | ClusterIP |
| Port | 8000 |
| Target Port | 8000 |

#### 5.4.3 HorizontalPodAutoscaler

**Resource:** `backend-hpa.yaml`

| Field | Value |
|-------|-------|
| Min Replicas | 2 |
| Max Replicas | 10 |
| Target CPU | 60% |

#### 5.4.4 PodDisruptionBudget

**Resource:** `backend-pdb.yaml`

| Field | Value |
|-------|-------|
| Min Available | 1 |

### 5.5 Configuration Resources

#### 5.5.1 Frontend ConfigMap

**Resource:** `frontend-configmap.yaml`

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `http://todo-backend-svc:8000` |

#### 5.5.2 Backend ConfigMap

**Resource:** `backend-configmap.yaml`

| Key | Value |
|-----|-------|
| `HOST` | `0.0.0.0` |
| `PORT` | `8000` |
| `DEBUG` | `false` |

#### 5.5.3 Backend Secret

**Resource:** `backend-secret.yaml`

| Key | Source |
|-----|--------|
| `DATABASE_URL` | User-provided |
| `SECRET_KEY` | User-provided |
| `OPENAI_API_KEY` | User-provided (optional) |

### 5.6 Network Policies

#### 5.6.1 Default Deny

**Resource:** `networkpolicy-default-deny.yaml`

Deny all ingress traffic to namespace by default.

#### 5.6.2 Allow Frontend Ingress

**Resource:** `networkpolicy-frontend.yaml`

Allow traffic to frontend pods from any source (external access).

#### 5.6.3 Allow Backend from Frontend

**Resource:** `networkpolicy-backend.yaml`

Allow traffic to backend pods only from frontend pods.

### 5.7 Resource Quotas

**Resource:** `resourcequota.yaml`

| Quota | Value |
|-------|-------|
| requests.cpu | 4 |
| requests.memory | 4Gi |
| limits.cpu | 8 |
| limits.memory | 8Gi |
| pods | 20 |

### 5.8 Limit Ranges

**Resource:** `limitrange.yaml`

| Type | Min CPU | Max CPU | Default CPU | Min Memory | Max Memory | Default Memory |
|------|---------|---------|-------------|------------|------------|----------------|
| Container | 50m | 2 | 100m | 64Mi | 1Gi | 128Mi |

### 5.9 Verification Criteria

- [ ] All manifests pass `kubectl apply --dry-run=client`
- [ ] Labels follow Kubernetes recommended labels
- [ ] Resource requests and limits defined for all containers
- [ ] Health probes defined for all deployments
- [ ] Security contexts enforce non-root execution

---

## 6. Track 4: Helm Chart Development

### 6.1 Objectives

Package Kubernetes manifests into a reusable, configurable Helm chart.

### 6.2 Chart Structure

```
charts/
└── todo-app/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-dev.yaml
    ├── .helmignore
    ├── templates/
    │   ├── _helpers.tpl
    │   ├── namespace.yaml
    │   ├── resourcequota.yaml
    │   ├── limitrange.yaml
    │   ├── frontend/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── configmap.yaml
    │   │   ├── hpa.yaml
    │   │   └── pdb.yaml
    │   ├── backend/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── configmap.yaml
    │   │   ├── secret.yaml
    │   │   ├── hpa.yaml
    │   │   └── pdb.yaml
    │   └── networking/
    │       └── networkpolicy.yaml
    └── tests/
        └── test-connection.yaml
```

### 6.3 Chart.yaml Definition

| Field | Value |
|-------|-------|
| apiVersion | v2 |
| name | todo-app |
| description | Todo AI Chatbot cloud-native deployment |
| type | application |
| version | 1.0.0 |
| appVersion | 1.0.0 |

### 6.4 Values Schema Design

```yaml
# Global settings
global:
  namespace: todo-app
  imagePullPolicy: IfNotPresent

# Frontend configuration
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: "1.0.0"
  service:
    type: NodePort
    port: 80
    targetPort: 3000
    nodePort: 30080
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
  config:
    apiUrl: "http://todo-backend-svc:8000"

# Backend configuration
backend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-backend
    tag: "1.0.0"
  service:
    type: ClusterIP
    port: 8000
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 512Mi
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 60
  config:
    host: "0.0.0.0"
    port: "8000"
    debug: "false"
  secrets:
    databaseUrl: ""  # Required: set via --set or values file
    secretKey: ""    # Required: set via --set or values file
    openaiApiKey: "" # Optional

# Network policies
networkPolicy:
  enabled: true

# Resource quotas
resourceQuota:
  enabled: true
```

### 6.5 Template Helpers (_helpers.tpl)

Define reusable template functions:

| Helper | Purpose |
|--------|---------|
| `todo-app.name` | Chart name |
| `todo-app.fullname` | Release-qualified name |
| `todo-app.labels` | Standard Kubernetes labels |
| `todo-app.selectorLabels` | Selector labels for services |

### 6.6 Verification Criteria

- [ ] `helm lint charts/todo-app` passes
- [ ] `helm template todo-app charts/todo-app` generates valid YAML
- [ ] All values have sensible defaults
- [ ] Secrets can be provided via `--set` flags
- [ ] Chart installs in fresh namespace

---

## 7. Track 5: Deployment & Validation

### 7.1 Objectives

Deploy the Helm chart to Minikube and validate all acceptance criteria.

### 7.2 Pre-Deployment Checklist

- [ ] Minikube running with metrics-server addon
- [ ] Docker images built and available in Minikube
- [ ] Backend secrets prepared (DATABASE_URL, SECRET_KEY)
- [ ] Helm chart linted successfully

### 7.3 Deployment Sequence

**Step 1: Create namespace and install chart**
```
helm install todo-app charts/todo-app \
  --namespace todo-app \
  --create-namespace \
  --set backend.secrets.databaseUrl="<value>" \
  --set backend.secrets.secretKey="<value>"
```

**Step 2: Verify pod status**
```
kubectl get pods -n todo-app -w
```

**Step 3: Verify services**
```
kubectl get svc -n todo-app
```

**Step 4: Access frontend**
```
minikube service todo-frontend-svc -n todo-app
```

### 7.4 Validation Test Cases

#### 7.4.1 Pod Health Tests

| Test | Command | Expected |
|------|---------|----------|
| Frontend pods running | `kubectl get pods -l app.kubernetes.io/component=frontend -n todo-app` | 2/2 Running |
| Backend pods running | `kubectl get pods -l app.kubernetes.io/component=backend -n todo-app` | 2/2 Running |
| Liveness probes passing | `kubectl describe pod <pod> -n todo-app` | Liveness: Success |
| Readiness probes passing | `kubectl describe pod <pod> -n todo-app` | Readiness: Success |

#### 7.4.2 Service Communication Tests

| Test | Command | Expected |
|------|---------|----------|
| Frontend externally accessible | `curl $(minikube service todo-frontend-svc -n todo-app --url)` | 200 OK |
| Backend internal access | `kubectl exec -it <frontend-pod> -- curl http://todo-backend-svc:8000/health` | 200 OK |
| Backend not externally exposed | `kubectl get svc todo-backend-svc -n todo-app -o jsonpath='{.spec.type}'` | ClusterIP |

#### 7.4.3 Scaling Tests

| Test | Command | Expected |
|------|---------|----------|
| HPA exists | `kubectl get hpa -n todo-app` | frontend-hpa, backend-hpa |
| Manual scale | `kubectl scale deployment todo-backend --replicas=3 -n todo-app` | 3 replicas running |
| Scale back | `kubectl scale deployment todo-backend --replicas=2 -n todo-app` | 2 replicas running |

#### 7.4.4 Reliability Tests

| Test | Command | Expected |
|------|---------|----------|
| PDB exists | `kubectl get pdb -n todo-app` | frontend-pdb, backend-pdb |
| Pod deletion recovery | `kubectl delete pod <pod> -n todo-app` | New pod created automatically |

#### 7.4.5 Helm Operation Tests

| Test | Command | Expected |
|------|---------|----------|
| Upgrade | `helm upgrade todo-app charts/todo-app -n todo-app` | Release updated |
| Rollback | `helm rollback todo-app 1 -n todo-app` | Reverted to revision 1 |
| Values override | `helm upgrade --set frontend.replicaCount=3` | 3 frontend replicas |

### 7.5 Verification Criteria

- [ ] All pods reach Running state within 5 minutes
- [ ] All health probes pass continuously for 10 minutes
- [ ] Frontend accessible via NodePort
- [ ] Frontend-to-backend communication works
- [ ] Manual scaling succeeds
- [ ] Pod deletion triggers automatic recovery
- [ ] Helm upgrade/rollback operations work

---

## 8. Track 6: AI Tools Integration

### 8.1 Objectives

Validate integration with AI-assisted DevOps tools as specified in the constitution.

### 8.2 Docker AI Agent (Gordon) Integration

#### 8.2.1 Validation Tasks

| Task | Method | Expected Outcome |
|------|--------|------------------|
| Dockerfile analysis | `docker ai "analyze frontend/Dockerfile"` | Optimization suggestions |
| Security review | `docker ai "check security of backend/Dockerfile"` | Security recommendations |
| Build troubleshooting | Use Gordon when build fails | Root cause identification |

### 8.3 kubectl-ai Integration

#### 8.3.1 Validation Tasks

| Task | Method | Expected Outcome |
|------|--------|------------------|
| Cluster status query | `kubectl ai "show pod status in todo-app namespace"` | Pod status table |
| Troubleshooting | `kubectl ai "why is pod X not ready"` | Diagnostic information |
| Resource explanation | `kubectl ai "explain HPA for backend"` | HPA configuration details |

### 8.4 kagent Integration

#### 8.4.1 Validation Tasks

| Task | Method | Expected Outcome |
|------|--------|------------------|
| Deployment health | `kagent describe deployment todo-backend -n todo-app` | Health analysis |
| Resource analysis | `kagent analyze -n todo-app` | Resource utilization insights |
| Anomaly detection | Generate load, observe kagent alerts | Anomaly identification |

### 8.5 Verification Criteria

- [ ] Gordon successfully analyzes Dockerfiles
- [ ] kubectl-ai responds to natural language queries
- [ ] kagent describes deployment health
- [ ] AI tool outputs are logged for audit

---

## 9. Implementation Decision Log

### 9.1 Decision: Next.js Standalone Build

**Context:** Next.js applications can be built in different modes.

**Decision:** Use Next.js standalone output mode for smaller container images.

**Rationale:**
- Standalone mode bundles only required dependencies
- Reduces image size significantly
- Enables running without full node_modules

**Configuration:** Add to `next.config.js`:
```javascript
output: 'standalone'
```

### 9.2 Decision: SQLite for Local Development

**Context:** Backend uses SQLAlchemy with configurable database.

**Decision:** For Phase IV (Minikube local), use SQLite with mounted volume or in-memory.

**Rationale:**
- Simplifies local deployment (no external database)
- Database deployment is out of scope for Phase IV
- Production will use PostgreSQL (future phase)

**Alternative Considered:** Deploy PostgreSQL in Minikube
**Rejected Because:** Database deployment is explicitly out of scope

### 9.3 Decision: NodePort over Ingress

**Context:** Frontend needs external access.

**Decision:** Use NodePort service type instead of Ingress.

**Rationale:**
- Simpler for local Minikube deployment
- No ingress controller dependency
- Ingress can be added later for production

📋 **Architectural decision detected:** NodePort vs Ingress for external access
Document reasoning and tradeoffs? Run `/sp.adr nodeport-vs-ingress`

### 9.4 Decision: Single Helm Chart

**Context:** Could use separate charts for frontend/backend or unified chart.

**Decision:** Single unified Helm chart with component toggles.

**Rationale:**
- Simpler deployment (one helm install)
- Shared values for cross-cutting concerns
- Components can be individually disabled if needed

📋 **Architectural decision detected:** Unified vs split Helm charts
Document reasoning and tradeoffs? Run `/sp.adr unified-helm-chart`

---

## 10. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Minikube resource exhaustion | Medium | High | Document minimum requirements; provide reduced-resource values |
| Image pull failures in Minikube | Medium | Medium | Use `eval $(minikube docker-env)` to build locally |
| Backend health probe failures (DB) | High | High | Add `/ready` endpoint with graceful handling |
| Network policy blocking legitimate traffic | Medium | Medium | Test incrementally; maintain fallback without policies |
| HPA not scaling (metrics unavailable) | Low | Medium | Verify metrics-server addon; provide manual scaling fallback |

---

## 11. Glossary

| Term | Definition |
|------|------------|
| HPA | Horizontal Pod Autoscaler |
| PDB | Pod Disruption Budget |
| NodePort | Kubernetes service type exposing on node's IP |
| ClusterIP | Kubernetes service type for internal access only |
| ConfigMap | Kubernetes resource for non-sensitive configuration |
| Secret | Kubernetes resource for sensitive data |

---

## 12. Related Documents

| Document | Path |
|----------|------|
| Phase IV Constitution | `.specify/memory/constitution.md` |
| Phase IV Specification | `specs/phase-iv-infrastructure/spec.md` |
| Phase IV Tasks | `specs/phase-iv-infrastructure/tasks.md` (TBD) |

---

## Appendix A: File Inventory

### New Files to Create

| Path | Type | Track |
|------|------|-------|
| `frontend/Dockerfile` | Dockerfile | 2 |
| `frontend/.dockerignore` | Config | 2 |
| `frontend/app/api/health/route.ts` | Code | 2 |
| `backend/Dockerfile` | Dockerfile | 2 |
| `backend/.dockerignore` | Config | 2 |
| `backend/src/api/ready.py` | Code | 2 |
| `k8s/namespace.yaml` | K8s Manifest | 3 |
| `k8s/frontend/*.yaml` | K8s Manifests | 3 |
| `k8s/backend/*.yaml` | K8s Manifests | 3 |
| `k8s/networking/*.yaml` | K8s Manifests | 3 |
| `charts/todo-app/Chart.yaml` | Helm | 4 |
| `charts/todo-app/values.yaml` | Helm | 4 |
| `charts/todo-app/templates/**` | Helm | 4 |
| `docs/deployment-runbook.md` | Documentation | 5 |
| `docs/helm-values.md` | Documentation | 5 |
| `docs/troubleshooting.md` | Documentation | 5 |

### Files to Modify

| Path | Change | Track |
|------|--------|-------|
| `frontend/next.config.js` | Add standalone output | 2 |
| `backend/src/main.py` | Import ready endpoint | 2 |

---

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-30 | AI Architect | Initial plan |

---

**END OF PLAN**
