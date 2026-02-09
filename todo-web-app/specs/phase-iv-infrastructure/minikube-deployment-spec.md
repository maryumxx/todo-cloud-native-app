# Phase IV: Todo Chatbot Minikube Deployment Specification

**Version:** 1.0.0
**Date:** 2026-02-01
**Status:** Ready for Deployment

---

## 1. Executive Summary

This specification defines the deployment of the Todo Chatbot application (frontend + backend) on a local Minikube cluster using Helm charts. The deployment is designed to be spec-driven, repeatable, and suitable for AI-assisted DevOps workflows.

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      MINIKUBE CLUSTER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    NAMESPACE: todo-app                     │  │
│  │                                                            │  │
│  │  ┌─────────────────┐         ┌─────────────────────────┐  │  │
│  │  │   FRONTEND      │         │      BACKEND            │  │  │
│  │  │   Deployment    │         │      Deployment         │  │  │
│  │  │   (2 replicas)  │         │      (2 replicas)       │  │  │
│  │  │                 │         │                         │  │  │
│  │  │  Port: 3000     │────────▶│  Port: 8000             │  │  │
│  │  │  (Next.js)      │  HTTP   │  (FastAPI/Uvicorn)      │  │  │
│  │  └────────┬────────┘         └───────────┬─────────────┘  │  │
│  │           │                              │                 │  │
│  │  ┌────────▼────────┐         ┌───────────▼─────────────┐  │  │
│  │  │  Frontend SVC   │         │     Backend SVC         │  │  │
│  │  │  NodePort:30080 │         │     ClusterIP:8000      │  │  │
│  │  │  (External)     │         │     (Internal)          │  │  │
│  │  └─────────────────┘         └─────────────────────────┘  │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   localhost:30080   │
                    │   (User Access)     │
                    └─────────────────────┘
```

---

## 2. Deployment Components

### 2.1 Frontend Service

| Property | Value |
|----------|-------|
| Image | `todo-frontend:1.0.0` |
| Replicas | 2 (min) - 5 (max with HPA) |
| Container Port | 3000 |
| Service Type | NodePort |
| Service Port | 80 |
| NodePort | 30080 |
| Health Check | `/api/health` |

### 2.2 Backend Service

| Property | Value |
|----------|-------|
| Image | `todo-backend:1.0.0` |
| Replicas | 2 (min) - 10 (max with HPA) |
| Container Port | 8000 |
| Service Type | ClusterIP |
| Service Port | 8000 |
| Liveness Probe | `/health` |
| Readiness Probe | `/ready` |

---

## 3. Resource Allocation

### 3.1 Frontend Resources

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

### 3.2 Backend Resources

```yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 512Mi
```

### 3.3 Minikube Optimized Resources (Local Development)

For local Minikube with limited resources, use reduced allocations:

```yaml
# Frontend (Minikube)
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi

# Backend (Minikube)
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

---

## 4. Port Mappings

| Service | Container Port | Service Port | External Port |
|---------|---------------|--------------|---------------|
| Frontend | 3000 | 80 | 30080 (NodePort) |
| Backend | 8000 | 8000 | N/A (ClusterIP) |

---

## 5. Environment Variables

### 5.1 Frontend ConfigMap

```yaml
NEXT_PUBLIC_API_URL: "http://todo-app-backend-svc:8000"
```

### 5.2 Backend ConfigMap

```yaml
HOST: "0.0.0.0"
PORT: "8000"
DEBUG: "false"
```

### 5.3 Backend Secrets (Required)

```yaml
DATABASE_URL: <base64-encoded-connection-string>
SECRET_KEY: <base64-encoded-jwt-secret>
OPENAI_API_KEY: <base64-encoded-api-key>
```

---

## 6. Security Configurations

### 6.1 Pod Security Context

Both frontend and backend pods run with:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: false
  capabilities:
    drop:
      - ALL
```

### 6.2 Network Policies

- Frontend pods can communicate with backend pods
- Backend pods accept traffic only from frontend and system namespaces
- Egress is allowed for external API calls (OpenAI)

---

## 7. Acceptance Criteria

- [ ] Minikube cluster running with adequate resources
- [ ] Docker images loaded into Minikube's Docker daemon
- [ ] Helm chart deploys without errors
- [ ] All pods reach Running state
- [ ] Health endpoints respond with 200 OK
- [ ] Frontend accessible at http://localhost:30080
- [ ] Frontend can communicate with backend API
- [ ] HPA scales pods based on CPU utilization

---

## 8. Non-Goals

- Production-grade TLS/SSL configuration
- External database deployment (using SQLite for local dev)
- Ingress controller configuration
- Persistent volume claims
- Multi-node cluster setup

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Minikube resource exhaustion | High | Use optimized values file |
| Image pull failures | Medium | Load images directly into Minikube |
| Secret misconfiguration | High | Use environment variables or sealed secrets |
| Network policy blocks traffic | Medium | Test with policies disabled first |

