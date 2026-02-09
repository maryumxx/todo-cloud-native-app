# Phase V: Advanced Cloud Deployment - Implementation Plan

**Document Version:** 1.0.0
**Date:** 2026-02-03
**Status:** Draft
**Spec Reference:** [spec.md](./spec.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Implementation Phases](#2-implementation-phases)
3. [Phase 1: Foundation & Infrastructure](#3-phase-1-foundation--infrastructure)
4. [Phase 2: Event-Driven Core](#4-phase-2-event-driven-core)
5. [Phase 3: Microservices Decomposition](#5-phase-3-microservices-decomposition)
6. [Phase 4: Advanced Features](#6-phase-4-advanced-features)
7. [Phase 5: Production Readiness](#7-phase-5-production-readiness)
8. [Risk Analysis & Mitigation](#8-risk-analysis--mitigation)
9. [Dependencies & Prerequisites](#9-dependencies--prerequisites)
10. [Definition of Done](#10-definition-of-done)

---

## 1. Executive Summary

### 1.1 Scope

This plan transforms the existing Todo Chatbot system from a monolithic architecture into a production-grade, event-driven microservices platform. The implementation is divided into 5 phases spanning approximately 8-10 weeks.

### 1.2 Current State

| Component | Status | Location |
|-----------|--------|----------|
| Task Model (Advanced) | **Implemented** | `backend/src/models/task.py` |
| FastAPI Backend | Implemented | `backend/src/` |
| Next.js Frontend | Implemented | `frontend/` |
| Helm Charts (Basic) | Implemented | `charts/todo-app/` |
| Kubernetes Manifests | Implemented | `k8s/` |
| Chatbot Service | Implemented | `chatbot/backend/` |

### 1.3 Target State

| Component | Status | Target |
|-----------|--------|--------|
| Apache Kafka | To Build | Strimzi on Minikube |
| Dapr Integration | To Build | Sidecars for all services |
| Recurring Task Service | To Build | New microservice |
| Notification Service | To Build | New microservice |
| Audit Service | To Build | New microservice |
| WebSocket Real-Time | To Build | Task API enhancement |
| Search/Filter API | To Build | Task API enhancement |
| CI/CD Pipeline | To Build | GitHub Actions |

### 1.4 Implementation Timeline

```
Week 1-2:  Phase 1 - Foundation & Infrastructure
Week 3-4:  Phase 2 - Event-Driven Core
Week 5-6:  Phase 3 - Microservices Decomposition
Week 7-8:  Phase 4 - Advanced Features
Week 9-10: Phase 5 - Production Readiness
```

---

## 2. Implementation Phases

### 2.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION ROADMAP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Foundation          PHASE 2: Events           PHASE 3: Services  │
│  ┌─────────────────┐         ┌─────────────────┐       ┌─────────────────┐ │
│  │ • Dapr Setup    │         │ • Kafka Deploy  │       │ • Recurring Svc │ │
│  │ • Redis Deploy  │   ───►  │ • Event Schemas │  ───► │ • Notify Svc    │ │
│  │ • DB Migration  │         │ • Pub/Sub       │       │ • Audit Svc     │ │
│  │ • Helm Updates  │         │ • Task Events   │       │ • Service Mesh  │ │
│  └─────────────────┘         └─────────────────┘       └─────────────────┘ │
│         │                           │                          │            │
│         │                           │                          │            │
│         ▼                           ▼                          ▼            │
│  PHASE 4: Features           PHASE 5: Production                            │
│  ┌─────────────────┐         ┌─────────────────┐                            │
│  │ • WebSocket     │         │ • CI/CD         │                            │
│  │ • Search/Filter │   ───►  │ • Observability │                            │
│  │ • Reminders     │         │ • Security      │                            │
│  │ • RRULE Parser  │         │ • Cloud Deploy  │                            │
│  └─────────────────┘         └─────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Graph

```
                    ┌──────────────────┐
                    │   Phase 1        │
                    │   Foundation     │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │   Phase 2        │          │   Phase 3        │
    │   Events Core    │◄────────►│   Microservices  │
    └────────┬─────────┘          └────────┬─────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                  ┌──────────────────┐
                  │   Phase 4        │
                  │   Features       │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Phase 5        │
                  │   Production     │
                  └──────────────────┘
```

---

## 2.5 Kubernetes Fundamentals (Docker Desktop)

Before diving into the advanced Phase V deployment, this section covers basic Kubernetes deployment for local development using Docker Desktop Kubernetes.

### 2.5.1 Kubernetes Deployment Architecture

#### Why Deployments Instead of Docker Run?

| Docker Run | Kubernetes Deployment |
|------------|----------------------|
| Single container on one machine | Multiple pods across nodes |
| Manual restart on failure | Self-healing - auto-restart on crash |
| Manual scaling | Declarative scaling via `replicas` |
| Imperative commands | Declarative YAML manifests |
| No built-in load balancing | Built-in load balancing via Services |
| Manual networking | Automatic DNS-based service discovery |

**Key Benefits:**
- **Self-healing**: If a pod crashes, Kubernetes automatically creates a new one
- **Declarative**: You describe the desired state, Kubernetes maintains it
- **Rolling updates**: Zero-downtime deployments
- **Resource management**: CPU/memory limits and requests

#### Difference Between ClusterIP and NodePort

```
┌─────────────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                               │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  ClusterIP Service (backend-service:8000)                   │   │
│   │  - Internal only, NOT accessible from browser               │   │
│   │  - Used for pod-to-pod communication                        │   │
│   │  - Frontend calls: http://backend-service:8000              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       │
│   │   Backend   │       │   Backend   │       │   Backend   │       │
│   │    Pod 1    │       │    Pod 2    │       │    Pod N    │       │
│   └─────────────┘       └─────────────┘       └─────────────┘       │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  NodePort Service (frontend-service:30007)                  │   │
│   │  - Externally accessible on port 30007                      │   │
│   │  - Browser accesses: http://localhost:30007                 │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       │
│   │  Frontend   │       │  Frontend   │       │  Frontend   │       │
│   │    Pod 1    │       │    Pod 2    │       │    Pod N    │       │
│   └─────────────┘       └─────────────┘       └─────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
        ▲
        │ http://localhost:30007
        │
   ┌─────────┐
   │ Browser │
   └─────────┘
```

| Service Type | Access | Use Case |
|--------------|--------|----------|
| **ClusterIP** | Internal only | Backend APIs, databases, internal services |
| **NodePort** | External via port 30000-32767 | Development, exposing services locally |
| **LoadBalancer** | External via cloud LB | Production cloud deployments |
| **Ingress** | External via HTTP routing | Production with path/host routing |

#### How Pods Communicate via Services

Kubernetes provides automatic DNS-based service discovery:

```
# Within the cluster, services are discoverable by name:
http://backend-service:8000          # Short name (same namespace)
http://backend-service.default:8000  # With namespace
http://backend-service.default.svc.cluster.local:8000  # Full FQDN
```

**Traffic Flow:**
1. Frontend pod makes request to `http://backend-service:8000`
2. Kubernetes DNS resolves `backend-service` to the ClusterIP
3. Service load-balances request to one of the backend pods
4. Backend pod processes request and returns response

#### Why imagePullPolicy: IfNotPresent?

```yaml
imagePullPolicy: IfNotPresent  # Use local image if available
```

| Policy | Behavior | Use Case |
|--------|----------|----------|
| `Always` | Always pull from registry | Production with remote registry |
| `IfNotPresent` | Use local, pull only if missing | **Local development** |
| `Never` | Never pull, fail if not local | Air-gapped environments |

For Docker Desktop Kubernetes with locally-built images, `IfNotPresent` is essential because your images exist locally but not in any remote registry.

---

### 2.5.2 Simple Kubernetes Manifests

The simple manifests are located in `k8s/simple/`:

```
k8s/simple/
├── backend-deployment.yaml   # FastAPI backend (1 replica, port 8000)
├── backend-service.yaml      # ClusterIP service (internal)
├── frontend-deployment.yaml  # Next.js frontend (1 replica, port 3000)
└── frontend-service.yaml     # NodePort service (external, port 30007)
```

---

### 2.5.3 Deployment Steps

**Prerequisites:**
- Docker Desktop with Kubernetes enabled
- Docker images built locally:
  - `todo-backend:latest`
  - `todo-frontend:latest`

**Step 1: Verify Kubernetes is running**
```bash
kubectl cluster-info
kubectl get nodes
```

**Step 2: Deploy the backend**
```bash
kubectl apply -f k8s/simple/backend-deployment.yaml
kubectl apply -f k8s/simple/backend-service.yaml
```

**Step 3: Deploy the frontend**
```bash
kubectl apply -f k8s/simple/frontend-deployment.yaml
kubectl apply -f k8s/simple/frontend-service.yaml
```

**Or deploy all at once:**
```bash
kubectl apply -f k8s/simple/
```

---

### 2.5.4 Verification

**Check pod status:**
```bash
kubectl get pods
# Expected output:
# NAME                                   READY   STATUS    RESTARTS   AGE
# backend-deployment-xxxxx-xxxxx         1/1     Running   0          1m
# frontend-deployment-xxxxx-xxxxx        1/1     Running   0          1m
```

**Check service status:**
```bash
kubectl get svc
# Expected output:
# NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# backend-service    ClusterIP   10.96.xxx.xxx   <none>        8000/TCP         1m
# frontend-service   NodePort    10.96.xxx.xxx   <none>        3000:30007/TCP   1m
```

**Check pod logs:**
```bash
kubectl logs -l app=todo-backend
kubectl logs -l app=todo-frontend
```

**Describe resources for troubleshooting:**
```bash
kubectl describe pod -l app=todo-backend
kubectl describe svc backend-service
```

---

### 2.5.5 Access the Application

The frontend is exposed via NodePort at port **30007**.

**Access URL:**
```
http://localhost:30007
```

**How it works:**
1. Browser requests `http://localhost:30007`
2. Docker Desktop routes to the Kubernetes NodePort service
3. Service forwards to a frontend pod on port 3000
4. Frontend makes API calls to `http://backend-service:8000`
5. Backend processes and returns data

---

### 2.5.6 Cleanup

**Delete all resources:**
```bash
kubectl delete -f k8s/simple/
```

**Or delete individually:**
```bash
kubectl delete deployment backend-deployment frontend-deployment
kubectl delete service backend-service frontend-service
```

---

## 3. Phase 1: Foundation & Infrastructure

**Duration:** Week 1-2
**Goal:** Establish infrastructure foundation for event-driven microservices

### 3.1 Tasks

#### 3.1.1 Dapr Installation & Configuration

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P1-01 | Install Dapr CLI locally | P0 | 0.5h |
| P1-02 | Initialize Dapr on Minikube cluster | P0 | 1h |
| P1-03 | Create Dapr component: `secrets-kubernetes` | P0 | 1h |
| P1-04 | Create Dapr component: `statestore-redis` | P0 | 2h |
| P1-05 | Verify Dapr dashboard access | P1 | 0.5h |

**Deliverables:**
```
k8s/dapr/
├── components/
│   ├── secrets-kubernetes.yaml
│   └── statestore-redis.yaml
└── configuration/
    └── dapr-config.yaml
```

**Acceptance Criteria:**
- [ ] `dapr status -k` shows all components healthy
- [ ] Dapr dashboard accessible via port-forward
- [ ] State store operations working (save/get/delete)

---

#### 3.1.2 Redis Deployment

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P1-06 | Add Redis Helm chart dependency | P0 | 0.5h |
| P1-07 | Configure Redis values for Minikube | P0 | 1h |
| P1-08 | Create Redis secret for password | P0 | 0.5h |
| P1-09 | Verify Redis connectivity from pods | P0 | 1h |
| P1-10 | Add Redis to Helm umbrella chart | P1 | 1h |

**Deliverables:**
```
charts/todo-app/
├── Chart.yaml (updated with Redis dependency)
├── values.yaml (Redis config added)
└── templates/
    └── redis/
        └── secret.yaml
```

**Acceptance Criteria:**
- [ ] Redis pods running in `todo-app` namespace
- [ ] Redis password stored in Kubernetes secret
- [ ] Connection test successful from backend pod

---

#### 3.1.3 Database Migration for Advanced Task Fields

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P1-11 | Generate Alembic migration for new Task fields | P0 | 1h |
| P1-12 | Add indexes for `due_at`, `remind_at`, `priority` | P0 | 0.5h |
| P1-13 | Add GIN index for `tags` JSONB column | P1 | 0.5h |
| P1-14 | Add full-text search index | P1 | 1h |
| P1-15 | Test migration on Neon staging branch | P0 | 1h |
| P1-16 | Apply migration to Neon main branch | P0 | 0.5h |

**Deliverables:**
```
backend/alembic/versions/
└── 20260203_advanced_task_fields.py
```

**Migration Script:**
```python
def upgrade():
    # Add new columns (already in model, ensure in DB)
    op.add_column('tasks', sa.Column('due_at', sa.DateTime(timezone=True)))
    op.add_column('tasks', sa.Column('remind_at', sa.DateTime(timezone=True)))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), default=False))
    op.add_column('tasks', sa.Column('recurrence_rule', sa.String(255)))
    op.add_column('tasks', sa.Column('priority', sa.String(20), default='medium'))
    op.add_column('tasks', sa.Column('tags', sa.JSON(), default=[]))

    # Add indexes
    op.create_index('idx_tasks_due_at', 'tasks', ['due_at'])
    op.create_index('idx_tasks_remind_at', 'tasks', ['remind_at'])
    op.create_index('idx_tasks_priority', 'tasks', ['priority'])
    op.execute('CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags)')
```

**Acceptance Criteria:**
- [ ] Migration applies without errors
- [ ] Existing tasks retain all data
- [ ] New fields have correct defaults
- [ ] Indexes created successfully

---

#### 3.1.4 Helm Chart Updates

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P1-17 | Add Dapr annotations to backend deployment | P0 | 1h |
| P1-18 | Add Dapr annotations to frontend deployment | P1 | 0.5h |
| P1-19 | Create values-phase5.yaml for new config | P0 | 1h |
| P1-20 | Update Chart.yaml version to 2.0.0 | P0 | 0.5h |
| P1-21 | Add Dapr components to templates | P0 | 2h |

**Deliverables:**
```yaml
# charts/todo-app/templates/backend/deployment.yaml (updated)
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "task-api"
  dapr.io/app-port: "8000"
  dapr.io/config: "todo-app-config"
  dapr.io/log-level: "info"
```

**Acceptance Criteria:**
- [ ] Dapr sidecar injected into backend pod
- [ ] Backend can communicate via Dapr sidecar
- [ ] Helm upgrade succeeds without errors

---

### 3.2 Phase 1 Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Dapr Status | `dapr status -k` | All components running |
| Redis | `kubectl exec -it redis-master-0 -- redis-cli ping` | PONG |
| Backend Sidecar | `kubectl get pods -l app=task-api -o jsonpath='{.items[0].spec.containers[*].name}'` | `task-api daprd` |
| DB Migration | `alembic current` | Latest revision |

---

## 4. Phase 2: Event-Driven Core

**Duration:** Week 3-4
**Goal:** Deploy Kafka and implement event publishing for core operations

### 4.1 Tasks

#### 4.1.1 Kafka Deployment (Strimzi)

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P2-01 | Install Strimzi operator in `kafka` namespace | P0 | 1h |
| P2-02 | Create Kafka cluster manifest (3 brokers) | P0 | 2h |
| P2-03 | Create Kafka topics via KafkaTopic CRDs | P0 | 1h |
| P2-04 | Deploy Kafka UI for debugging | P1 | 1h |
| P2-05 | Create Dapr pubsub-kafka component | P0 | 1h |
| P2-06 | Test publish/subscribe flow | P0 | 2h |

**Deliverables:**
```
k8s/kafka/
├── namespace.yaml
├── kafka-cluster.yaml
├── kafka-topics.yaml
└── kafka-ui.yaml

k8s/dapr/components/
└── pubsub-kafka.yaml
```

**Kafka Topics:**
```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: task-events
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 6
  replicas: 1  # 3 for production
  config:
    retention.ms: 604800000  # 7 days
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: reminder-events
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 86400000  # 1 day
---
# Additional topics: notification-events, audit-events, chat-events, dlq-events
```

**Acceptance Criteria:**
- [ ] Kafka cluster healthy (`kubectl get kafka`)
- [ ] All 6 topics created
- [ ] Dapr pubsub component shows as initialized
- [ ] Test message published and consumed

---

#### 4.1.2 CloudEvents Schema Implementation

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P2-07 | Create CloudEvents base schema | P0 | 1h |
| P2-08 | Create TaskCreated event schema | P0 | 0.5h |
| P2-09 | Create TaskUpdated event schema | P0 | 0.5h |
| P2-10 | Create TaskCompleted event schema | P0 | 0.5h |
| P2-11 | Create TaskDeleted event schema | P0 | 0.5h |
| P2-12 | Create ReminderScheduled event schema | P0 | 0.5h |
| P2-13 | Create ReminderTriggered event schema | P0 | 0.5h |

**Deliverables:**
```
backend/src/events/
├── __init__.py
├── base.py           # CloudEvents envelope
├── task_events.py    # Task event schemas
└── reminder_events.py # Reminder event schemas
```

**Implementation:**
```python
# backend/src/events/base.py
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Any

class CloudEvent(BaseModel):
    specversion: str = "1.0"
    type: str
    source: str
    id: str = Field(default_factory=lambda: f"evt-{uuid4()}")
    time: datetime = Field(default_factory=datetime.utcnow)
    datacontenttype: str = "application/json"
    data: Any

# backend/src/events/task_events.py
class TaskCreatedData(BaseModel):
    task_id: str
    user_id: str
    title: str
    description: str | None
    priority: str
    tags: list[str]
    due_at: datetime | None
    remind_at: datetime | None
    is_recurring: bool
    recurrence_rule: str | None
    created_at: datetime

class TaskCreatedEvent(CloudEvent):
    type: str = "task.created"
    source: str = "/services/task-api"
    data: TaskCreatedData
```

**Acceptance Criteria:**
- [ ] All event schemas validated with Pydantic
- [ ] Events serialize to valid JSON
- [ ] CloudEvents envelope consistent across all types

---

#### 4.1.3 Event Publisher Service

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P2-14 | Create EventPublisher class with Dapr client | P0 | 2h |
| P2-15 | Implement circuit breaker pattern | P1 | 2h |
| P2-16 | Implement local queue fallback | P1 | 2h |
| P2-17 | Add publish calls to TaskService.create_task | P0 | 1h |
| P2-18 | Add publish calls to TaskService.update_task | P0 | 1h |
| P2-19 | Add publish calls to TaskService.delete_task | P0 | 1h |
| P2-20 | Add publish calls to task completion | P0 | 1h |

**Deliverables:**
```
backend/src/events/
├── publisher.py      # EventPublisher class
└── resilience.py     # Circuit breaker implementation
```

**Implementation:**
```python
# backend/src/events/publisher.py
from dapr.clients import DaprClient
from .base import CloudEvent
import json

class EventPublisher:
    def __init__(self, pubsub_name: str = "pubsub-kafka"):
        self.pubsub_name = pubsub_name

    async def publish(self, topic: str, event: CloudEvent) -> bool:
        async with DaprClient() as client:
            await client.publish_event(
                pubsub_name=self.pubsub_name,
                topic_name=topic,
                data=event.model_dump_json(),
                data_content_type="application/json",
                publish_metadata={"partitionKey": str(event.data.user_id)}
            )
            return True
```

**Acceptance Criteria:**
- [ ] Events published on task CRUD operations
- [ ] Events visible in Kafka UI
- [ ] Circuit breaker trips after 5 failures
- [ ] Local queue buffers events during outage

---

#### 4.1.4 Dapr Subscription Configuration

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P2-21 | Create subscription config for task-events | P0 | 1h |
| P2-22 | Create test consumer endpoint in Task API | P0 | 1h |
| P2-23 | Verify event delivery end-to-end | P0 | 1h |

**Deliverables:**
```yaml
# k8s/dapr/subscriptions/task-events.yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-events-subscription
spec:
  topic: task-events
  routes:
    default: /subscribe/task-events
  pubsubname: pubsub-kafka
scopes:
  - audit-service
  - recurring-task-service
```

**Acceptance Criteria:**
- [ ] Subscription created in cluster
- [ ] Test endpoint receives events
- [ ] Event ordering preserved per user_id

---

### 4.2 Phase 2 Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Kafka Cluster | `kubectl get kafka -n kafka` | Ready |
| Topics | `kubectl get kafkatopics -n kafka` | 6 topics |
| Publish Test | `curl -X POST /api/tasks` | Event in Kafka UI |
| Consume Test | Check audit service logs | Event received |

---

## 5. Phase 3: Microservices Decomposition

**Duration:** Week 5-6
**Goal:** Extract and deploy independent microservices

### 5.1 Tasks

#### 5.1.1 Recurring Task Service

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P3-01 | Create service scaffold (FastAPI) | P0 | 1h |
| P3-02 | Implement RRULE parser using python-dateutil | P0 | 3h |
| P3-03 | Implement task.completed event consumer | P0 | 2h |
| P3-04 | Implement next occurrence generator | P0 | 3h |
| P3-05 | Implement Dapr Jobs handler for daily scan | P1 | 2h |
| P3-06 | Create Dockerfile | P0 | 0.5h |
| P3-07 | Create Helm templates | P0 | 2h |
| P3-08 | Write unit tests | P0 | 3h |
| P3-09 | Write integration tests | P1 | 2h |

**Deliverables:**
```
services/recurring-task/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── rrule_parser.py
│   ├── consumers/
│   │   └── task_completed.py
│   └── services/
│       └── occurrence_generator.py
├── tests/
├── Dockerfile
└── requirements.txt
```

**Core Logic:**
```python
# services/recurring-task/src/rrule_parser.py
from dateutil.rrule import rrulestr
from datetime import datetime

def get_next_occurrence(rrule_string: str, after: datetime) -> datetime | None:
    """
    Parse RRULE and return next occurrence after given datetime.
    """
    rule = rrulestr(rrule_string, dtstart=after)
    next_dt = rule.after(after)
    return next_dt
```

**Acceptance Criteria:**
- [ ] Service starts and passes health check
- [ ] Consumes task.completed events
- [ ] Generates next occurrence for recurring tasks
- [ ] Publishes task.occurrence.generated event
- [ ] Daily job scans for missed occurrences

---

#### 5.1.2 Notification Service

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P3-10 | Create service scaffold (FastAPI) | P0 | 1h |
| P3-11 | Implement reminder.triggered consumer | P0 | 2h |
| P3-12 | Implement in-app notification (WebSocket) | P0 | 3h |
| P3-13 | Implement email notification (SendGrid) | P1 | 2h |
| P3-14 | Implement push notification (FCM) | P2 | 3h |
| P3-15 | Create Dockerfile | P0 | 0.5h |
| P3-16 | Create Helm templates | P0 | 2h |
| P3-17 | Write unit tests | P0 | 2h |

**Deliverables:**
```
services/notification/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── consumers/
│   │   └── reminder_triggered.py
│   └── channels/
│       ├── in_app.py
│       ├── email.py
│       └── push.py
├── tests/
├── Dockerfile
└── requirements.txt
```

**Acceptance Criteria:**
- [ ] Service starts and passes health check
- [ ] Consumes reminder.triggered events
- [ ] Sends in-app notifications
- [ ] Sends email via SendGrid (when configured)
- [ ] Publishes notification.sent/failed events

---

#### 5.1.3 Audit Service

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P3-18 | Create service scaffold (FastAPI) | P0 | 1h |
| P3-19 | Create audit_logs table migration | P0 | 1h |
| P3-20 | Implement wildcard event consumer | P0 | 2h |
| P3-21 | Implement audit log persistence | P0 | 2h |
| P3-22 | Implement GET /api/audit endpoint | P0 | 2h |
| P3-23 | Implement GET /api/audit/export endpoint | P1 | 2h |
| P3-24 | Create Dockerfile | P0 | 0.5h |
| P3-25 | Create Helm templates | P0 | 2h |

**Deliverables:**
```
services/audit/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   └── audit_log.py
│   ├── consumers/
│   │   └── all_events.py
│   └── api/
│       └── audit.py
├── alembic/
├── tests/
├── Dockerfile
└── requirements.txt
```

**Audit Log Schema:**
```python
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_id: str = Field(index=True)
    event_type: str = Field(index=True)
    event_source: str
    event_time: datetime = Field(index=True)
    actor_type: str
    actor_id: UUID = Field(index=True)
    actor_email: str | None
    resource_type: str
    resource_id: UUID | None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Acceptance Criteria:**
- [ ] Service starts and passes health check
- [ ] Consumes all event types
- [ ] Persists audit logs to database
- [ ] Query API returns filtered logs
- [ ] Export endpoint generates CSV/JSON

---

#### 5.1.4 Service Helm Templates

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P3-26 | Create deployment template for recurring-task | P0 | 1h |
| P3-27 | Create deployment template for notification | P0 | 1h |
| P3-28 | Create deployment template for audit | P0 | 1h |
| P3-29 | Create internal services (ClusterIP) | P0 | 1h |
| P3-30 | Update umbrella chart dependencies | P0 | 1h |

**Deliverables:**
```
charts/todo-app/templates/
├── recurring-task/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── dapr-subscription.yaml
├── notification/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── dapr-subscription.yaml
└── audit/
    ├── deployment.yaml
    ├── service.yaml
    └── dapr-subscription.yaml
```

**Acceptance Criteria:**
- [ ] All 3 services deploy successfully
- [ ] Dapr sidecars injected
- [ ] Services communicate via Dapr
- [ ] Subscriptions active

---

### 5.2 Phase 3 Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Recurring Service | `kubectl get pods -l app=recurring-task` | 1/1 Running |
| Notification Service | `kubectl get pods -l app=notification` | 1/1 Running |
| Audit Service | `kubectl get pods -l app=audit` | 1/1 Running |
| Event Flow | Complete task → Check audit logs | Log entry created |

---

## 6. Phase 4: Advanced Features

**Duration:** Week 7-8
**Goal:** Implement user-facing features for task management

### 6.1 Tasks

#### 6.1.1 WebSocket Real-Time Sync

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P4-01 | Add WebSocket endpoint to Task API | P0 | 2h |
| P4-02 | Implement connection manager | P0 | 2h |
| P4-03 | Implement Kafka consumer for broadcasting | P0 | 3h |
| P4-04 | Implement subscription protocol | P0 | 2h |
| P4-05 | Add connection status to frontend | P0 | 2h |
| P4-06 | Implement optimistic updates in frontend | P1 | 3h |
| P4-07 | Write integration tests | P0 | 2h |

**Deliverables:**
```
backend/src/api/
└── websocket.py

frontend/hooks/
└── useTaskSync.ts
```

**Implementation:**
```python
# backend/src/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle client messages (subscribe/unsubscribe)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
```

**Acceptance Criteria:**
- [ ] WebSocket connection established
- [ ] Task changes broadcast to all user clients
- [ ] Connection status indicator in UI
- [ ] Graceful reconnection on disconnect

---

#### 6.1.2 Search, Filter & Sort API

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P4-08 | Implement full-text search using PostgreSQL | P0 | 2h |
| P4-09 | Implement filter by status | P0 | 1h |
| P4-10 | Implement filter by priority | P0 | 1h |
| P4-11 | Implement filter by tags | P0 | 2h |
| P4-12 | Implement filter by due date range | P0 | 1h |
| P4-13 | Implement filter by recurring | P1 | 0.5h |
| P4-14 | Implement sort by multiple fields | P0 | 1h |
| P4-15 | Implement pagination | P0 | 1h |
| P4-16 | Update TaskService.get_tasks_by_user | P0 | 2h |
| P4-17 | Write unit tests | P0 | 2h |

**Deliverables:**
```
backend/src/api/
└── tasks.py (updated with query params)

backend/src/services/
└── task_service.py (updated with filtering)
```

**Implementation:**
```python
# backend/src/api/tasks.py
@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    q: str | None = None,
    status: str | None = None,  # all, active, completed
    priority: str | None = None,  # low,medium,high (comma-separated)
    tags: str | None = None,  # tag1,tag2 (comma-separated, AND logic)
    due_after: date | None = None,
    due_before: date | None = None,
    is_recurring: bool | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 20,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    task_service = TaskService()
    return task_service.get_tasks_filtered(
        session=session,
        user_id=current_user_id,
        q=q,
        status=status,
        priority=priority.split(",") if priority else None,
        tags=tags.split(",") if tags else None,
        due_after=due_after,
        due_before=due_before,
        is_recurring=is_recurring,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
```

**Acceptance Criteria:**
- [ ] Full-text search returns relevant results
- [ ] All filters work independently
- [ ] Filters combine with AND logic
- [ ] Pagination returns correct totals
- [ ] Sort works on all supported fields

---

#### 6.1.3 Reminder Scheduling Integration

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P4-18 | Create Dapr Job for reminder check | P0 | 2h |
| P4-19 | Implement reminder query in Recurring Service | P0 | 2h |
| P4-20 | Publish reminder.triggered events | P0 | 1h |
| P4-21 | Update frontend to set remind_at | P0 | 2h |
| P4-22 | Display in-app notifications | P0 | 3h |

**Deliverables:**
```
k8s/dapr/jobs/
└── reminder-scheduler.yaml

services/recurring-task/src/jobs/
└── reminder_check.py
```

**Acceptance Criteria:**
- [ ] Dapr job runs every minute
- [ ] Due reminders detected and triggered
- [ ] Notification appears in user's browser
- [ ] Reminder only triggers once

---

#### 6.1.4 RRULE UI Integration

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P4-23 | Add recurrence selector to task form | P0 | 3h |
| P4-24 | Implement RRULE string generator | P0 | 2h |
| P4-25 | Display next occurrences preview | P1 | 2h |
| P4-26 | Add skip occurrence action | P1 | 2h |

**Deliverables:**
```
frontend/components/
├── RecurrenceSelector.tsx
└── OccurrencePreview.tsx
```

**Acceptance Criteria:**
- [ ] User can select recurrence pattern
- [ ] RRULE generated correctly
- [ ] Next 5 occurrences displayed
- [ ] Skip occurrence works

---

### 6.2 Phase 4 Verification

| Check | Action | Expected Result |
|-------|--------|-----------------|
| WebSocket | Open 2 browser tabs, create task | Both tabs update |
| Search | Search "quarterly" | Matching tasks returned |
| Filter | Filter by priority=high | Only high priority shown |
| Reminder | Set reminder for 1 min, wait | Notification appears |
| Recurring | Complete recurring task | New occurrence created |

---

## 7. Phase 5: Production Readiness

**Duration:** Week 9-10
**Goal:** Prepare system for production deployment

### 7.1 Tasks

#### 7.1.1 CI/CD Pipeline

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P5-01 | Create GitHub Actions workflow structure | P0 | 1h |
| P5-02 | Implement test job (matrix for all services) | P0 | 2h |
| P5-03 | Implement build job with Docker | P0 | 2h |
| P5-04 | Implement security scan with Trivy | P0 | 1h |
| P5-05 | Implement staging deployment job | P0 | 2h |
| P5-06 | Implement production deployment job | P0 | 2h |
| P5-07 | Add smoke tests after deployment | P1 | 2h |
| P5-08 | Configure GitHub environments | P0 | 1h |

**Deliverables:**
```
.github/workflows/
├── ci-cd.yaml
├── pr-checks.yaml
└── security-scan.yaml
```

**Acceptance Criteria:**
- [ ] Tests run on every PR
- [ ] Images built and pushed on merge
- [ ] Security scan blocks critical vulnerabilities
- [ ] Staging deploys from develop branch
- [ ] Production deploys from main branch

---

#### 7.1.2 Observability Stack

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P5-09 | Deploy Prometheus via Helm | P0 | 2h |
| P5-10 | Deploy Grafana via Helm | P0 | 1h |
| P5-11 | Deploy Loki for log aggregation | P1 | 2h |
| P5-12 | Deploy Jaeger for tracing | P1 | 2h |
| P5-13 | Create ServiceMonitor for each service | P0 | 2h |
| P5-14 | Create Grafana dashboards | P0 | 3h |
| P5-15 | Configure Alertmanager rules | P0 | 2h |
| P5-16 | Add OpenTelemetry to services | P1 | 3h |

**Deliverables:**
```
charts/observability/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── prometheus/
    ├── grafana/
    ├── loki/
    └── jaeger/

charts/todo-app/templates/observability/
├── servicemonitor.yaml
├── prometheusrule.yaml
└── grafana-dashboards.yaml
```

**Dashboards:**
- API Performance (latency percentiles, error rates)
- Kafka Metrics (lag, throughput, partitions)
- Service Health (pod status, restarts, resources)
- Business Metrics (tasks created, completed, reminders)

**Acceptance Criteria:**
- [ ] All services scraped by Prometheus
- [ ] Logs aggregated in Loki
- [ ] Traces visible in Jaeger
- [ ] Dashboards display real-time data
- [ ] Alerts fire on defined thresholds

---

#### 7.1.3 Security Hardening

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P5-17 | Upgrade JWT to RS256 | P0 | 3h |
| P5-18 | Generate RSA key pair for JWT | P0 | 1h |
| P5-19 | Store keys in Kubernetes secret | P0 | 0.5h |
| P5-20 | Configure Dapr secret store | P0 | 1h |
| P5-21 | Add rate limiting middleware | P0 | 2h |
| P5-22 | Add security headers middleware | P0 | 1h |
| P5-23 | Update network policies | P0 | 2h |
| P5-24 | Run security scan and fix issues | P0 | 3h |

**Deliverables:**
```
backend/src/utils/
└── jwt.py (updated for RS256)

k8s/secrets/
└── jwt-keys.yaml

k8s/networking/
└── network-policies-v2.yaml
```

**Acceptance Criteria:**
- [ ] JWT uses RS256 algorithm
- [ ] Keys stored securely
- [ ] Rate limiting active (100 req/s)
- [ ] Security headers present
- [ ] Network policies enforce least privilege

---

#### 7.1.4 Production Values & Documentation

| Task ID | Task | Priority | Effort |
|---------|------|----------|--------|
| P5-25 | Create values-production.yaml | P0 | 2h |
| P5-26 | Create values-staging.yaml | P0 | 1h |
| P5-27 | Document deployment procedures | P0 | 2h |
| P5-28 | Create runbook for common issues | P1 | 3h |
| P5-29 | Update README with architecture | P0 | 1h |
| P5-30 | Final end-to-end testing | P0 | 4h |

**Deliverables:**
```
charts/todo-app/
├── values-staging.yaml
└── values-production.yaml

docs/
├── deployment-guide.md
├── runbook.md
└── architecture.md
```

**Acceptance Criteria:**
- [ ] Production values configured for cloud
- [ ] Deployment documented step-by-step
- [ ] Runbook covers top 10 failure scenarios
- [ ] Architecture diagram current

---

### 7.2 Phase 5 Verification

| Check | Action | Expected Result |
|-------|--------|-----------------|
| CI/CD | Push to main | Full pipeline succeeds |
| Observability | Open Grafana | Dashboards populated |
| Security | Run Trivy scan | No critical vulnerabilities |
| E2E | Complete user journey | All features working |

---

## 8. Risk Analysis & Mitigation

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Kafka complexity on Minikube | Medium | High | Use Strimzi operator, start with 1 replica |
| Dapr learning curve | Medium | Medium | Follow official tutorials, start simple |
| Database migration issues | Low | High | Test on Neon branch first, backup before apply |
| WebSocket scaling | Medium | Medium | Use Redis pub/sub for multi-instance |
| Event ordering issues | Medium | High | Partition by user_id, idempotent consumers |

### 8.2 Resource Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Minikube resource limits | High | Medium | Allocate 8GB RAM, 4 CPUs minimum |
| Development time overrun | Medium | High | Prioritize P0 tasks, defer P2 features |
| External service costs | Low | Low | Use free tiers (SendGrid, FCM) |

### 8.3 Contingency Plans

| Scenario | Contingency |
|----------|-------------|
| Kafka too complex | Fall back to Redis Streams for MVP |
| Dapr issues | Use direct Kafka client as alternative |
| Cloud deployment blocked | Continue with Minikube, document cloud steps |

---

## 9. Dependencies & Prerequisites

### 9.1 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Minikube | >= 1.32.0 | Local Kubernetes |
| Dapr CLI | >= 1.12.0 | Dapr installation |
| Helm | >= 3.14.0 | Package management |
| kubectl | >= 1.28.0 | Cluster management |
| Docker | >= 24.0.0 | Container builds |

### 9.2 Service Dependencies

| Dependency | Type | Required For |
|------------|------|--------------|
| Neon PostgreSQL | External | All services |
| OpenAI API | External | Chat service |
| SendGrid | External | Email notifications |
| Firebase | External | Push notifications |

### 9.3 Development Prerequisites

- [ ] Minikube cluster running with adequate resources
- [ ] Docker Desktop configured for Kubernetes
- [ ] Neon project with staging branch
- [ ] GitHub repository with Actions enabled
- [ ] SendGrid account (optional for Phase 4)

---

## 10. Definition of Done

### 10.1 Phase Completion Criteria

| Phase | Criteria |
|-------|----------|
| Phase 1 | Dapr + Redis deployed, migration applied, Helm updated |
| Phase 2 | Kafka running, events publishing, subscriptions active |
| Phase 3 | All 3 microservices deployed and processing events |
| Phase 4 | WebSocket, search, reminders, recurring tasks working |
| Phase 5 | CI/CD running, observability deployed, security hardened |

### 10.2 Overall Definition of Done

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed or documented as deferred
- [ ] Unit test coverage > 80% for new code
- [ ] Integration tests passing
- [ ] No critical security vulnerabilities
- [ ] Documentation complete
- [ ] Deployment successful on Minikube
- [ ] End-to-end user journey working

### 10.3 Acceptance Testing Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Task Creation | Create task with all fields | Task saved, event published, audit logged |
| Recurring Task | Complete recurring task | New occurrence generated |
| Reminder | Set reminder, wait | Notification received |
| Real-time Sync | Open 2 clients, update task | Both clients sync |
| Search | Search by text + filters | Correct results returned |
| Failure Recovery | Kill Kafka, perform action | Event buffered, replayed on recovery |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-03 | System Architect | Initial plan |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| DevOps Lead | | | |
