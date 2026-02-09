# Phase IV: Todo Chatbot Kubernetes Deployment Specification

**Version:** 1.0.0
**Date:** 2026-02-01
**Status:** Ready for Deployment

---

## Executive Summary

This specification defines the Kubernetes deployment architecture for the Todo Chatbot application on a local Minikube cluster using Helm charts. The deployment includes both frontend (Next.js) and backend (FastAPI) services with proper resource management, health checks, and security configurations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Minikube Cluster                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Namespace: todo-app                     │  │
│  │                                                            │  │
│  │  ┌──────────────────┐      ┌──────────────────────────┐   │  │
│  │  │  Frontend Pod    │      │     Backend Pod          │   │  │
│  │  │  ┌────────────┐  │      │  ┌────────────────────┐  │   │  │
│  │  │  │ Next.js    │  │      │  │ FastAPI + Uvicorn  │  │   │  │
│  │  │  │ Port: 3000 │  │      │  │ Port: 8000         │  │   │  │
│  │  │  └────────────┘  │      │  └────────────────────┘  │   │  │
│  │  └────────┬─────────┘      └──────────┬───────────────┘   │  │
│  │           │                           │                    │  │
│  │  ┌────────▼─────────┐      ┌──────────▼───────────────┐   │  │
│  │  │ frontend-svc     │      │ backend-svc              │   │  │
│  │  │ NodePort: 30080  │─────▶│ ClusterIP: 8000          │   │  │
│  │  │ Port: 80         │      │                          │   │  │
│  │  └──────────────────┘      └──────────────────────────┘   │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │ ConfigMaps  │  │  Secrets    │  │ HPA (optional)  │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ NodePort :30080
                              ▼
                    ┌─────────────────┐
                    │   User Browser  │
                    │ http://<ip>:30080│
                    └─────────────────┘
```

---

## Component Specifications

### 1. Frontend Service

| Property | Value |
|----------|-------|
| **Image** | `todo-frontend:latest` |
| **Container Port** | 3000 |
| **Service Type** | NodePort |
| **Service Port** | 80 |
| **NodePort** | 30080 |
| **Replicas (Dev)** | 1 |
| **Replicas (Prod)** | 2-5 |

**Health Checks:**
- Liveness: `GET /api/health` (initial: 30s, period: 10s)
- Readiness: `GET /api/health` (initial: 5s, period: 5s)

**Resources (Minikube):**
```yaml
requests:
  cpu: 50m
  memory: 64Mi
limits:
  cpu: 200m
  memory: 128Mi
```

### 2. Backend Service

| Property | Value |
|----------|-------|
| **Image** | `todo-backend:latest` |
| **Container Port** | 8000 |
| **Service Type** | ClusterIP |
| **Service Port** | 8000 |
| **Replicas (Dev)** | 1 |
| **Replicas (Prod)** | 2-10 |

**Health Checks:**
- Liveness: `GET /health` (initial: 30s, period: 10s)
- Readiness: `GET /api/ready` (initial: 10s, period: 5s)

**Resources (Minikube):**
```yaml
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 500m
  memory: 256Mi
```

**Environment Variables:**
| Variable | Source | Description |
|----------|--------|-------------|
| `HOST` | ConfigMap | Server bind address (0.0.0.0) |
| `PORT` | ConfigMap | Server port (8000) |
| `DEBUG` | ConfigMap | Debug mode flag |
| `DATABASE_URL` | Secret | Database connection string |
| `SECRET_KEY` | Secret | JWT signing key |
| `OPENAI_API_KEY` | Secret | OpenAI API key for chatbot |

---

## Helm Chart Structure

```
charts/todo-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default production values
├── values-minikube.yaml    # Minikube-optimized values
└── templates/
    ├── _helpers.tpl        # Template helpers
    ├── backend/
    │   ├── configmap.yaml  # Backend configuration
    │   ├── deployment.yaml # Backend deployment
    │   ├── secret.yaml     # Backend secrets
    │   └── service.yaml    # Backend service
    └── frontend/
        ├── configmap.yaml  # Frontend configuration
        ├── deployment.yaml # Frontend deployment
        └── service.yaml    # Frontend service
```

---

## Port Mappings

| Service | Container Port | Service Port | External Port | Access Method |
|---------|---------------|--------------|---------------|---------------|
| Frontend | 3000 | 80 | 30080 | NodePort |
| Backend | 8000 | 8000 | - | ClusterIP (internal) |

**Internal Communication:**
- Frontend → Backend: `http://todo-app-backend-svc:8000`

**External Access:**
- Browser → Frontend: `http://<minikube-ip>:30080`

---

## Security Configuration

### Container Security Context
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

### Secret Management
- Secrets stored in Kubernetes Secrets (base64 encoded)
- Never commit actual secret values to version control
- Use `kubectl create secret` for sensitive data

---

## Deployment Workflow

### Prerequisites
1. Minikube running with 4 CPUs, 4GB RAM minimum
2. Docker images built: `todo-frontend`, `todo-backend`
3. Helm 3.x installed
4. kubectl configured for Minikube

### Deployment Steps
1. Start Minikube cluster
2. Load Docker images into Minikube
3. Create `todo-app` namespace
4. Create backend secrets (manually recommended)
5. Deploy with Helm using minikube values
6. Verify deployment health
7. Access application via NodePort

---

## Configuration Options

### values-minikube.yaml (Development)
- Single replica per service
- HPA disabled
- Network policies disabled
- Resource limits optimized for local machine
- Debug mode enabled for backend

### values.yaml (Production)
- Multiple replicas with HPA
- Network policies enabled
- Higher resource limits
- Debug mode disabled

---

## Monitoring & Observability

### Health Endpoints
| Endpoint | Service | Purpose |
|----------|---------|---------|
| `/health` | Backend | Liveness check |
| `/api/ready` | Backend | Readiness check (includes DB) |
| `/api/health` | Frontend | Next.js health check |

### Logging
```bash
# View all logs
kubectl logs -l app.kubernetes.io/name=todo-app -n todo-app

# View specific component
kubectl logs -l app.kubernetes.io/component=backend -n todo-app -f
```

---

## Scaling Configuration

### Horizontal Pod Autoscaler (when enabled)

**Frontend:**
- Min: 2, Max: 5 replicas
- Target CPU: 70%

**Backend:**
- Min: 2, Max: 10 replicas
- Target CPU: 60%

---

## Acceptance Criteria

- [ ] Minikube cluster starts successfully
- [ ] Both images load into Minikube
- [ ] Namespace created: `todo-app`
- [ ] All pods reach Running state
- [ ] Services have valid endpoints
- [ ] Frontend accessible via NodePort 30080
- [ ] Backend health check returns 200
- [ ] Frontend can communicate with backend
- [ ] Todo CRUD operations work
- [ ] Chatbot responds (if OPENAI_API_KEY configured)

---

## Related Documents

- [Minikube Deployment Plan](./minikube-deployment-plan.md) - Step-by-step CLI commands
- [Helm Values](../../charts/todo-app/values-minikube.yaml) - Minikube configuration
- [Backend API Spec](../api-spec.yaml) - API documentation

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | AI-Assisted | Initial specification |
