# Phase V: Advanced Cloud Deployment - System Specification

**Document Version:** 1.0.0
**Date:** 2026-02-03
**Status:** Draft
**Author:** System Architect
**Stakeholders:** Development Team, DevOps, Product

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [System Architecture](#4-system-architecture)
5. [Event-Driven Architecture](#5-event-driven-architecture)
6. [Dapr Usage Specification](#6-dapr-usage-specification)
7. [Deployment Specification](#7-deployment-specification)
8. [Data Model Specification](#8-data-model-specification)
9. [Failure Scenarios & Recovery](#9-failure-scenarios--recovery)
10. [Security Model](#10-security-model)
11. [Future Extension Points](#11-future-extension-points)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

### 1.1 Purpose

This specification defines the architecture and implementation requirements for Phase V of the AI-powered Todo Chatbot system. Phase V evolves the system from a basic CRUD application into a production-grade, event-driven microservices architecture deployed on Kubernetes.

### 1.2 Scope

Phase V introduces:
- Event-driven architecture with Apache Kafka
- Microservices decomposition with Dapr sidecars
- Advanced task features (recurring tasks, reminders, priorities, tags)
- Real-time synchronization across clients
- Production deployment on managed Kubernetes (AKS/GKE/OKE)

### 1.3 Background

The system currently consists of:
- Next.js frontend with TypeScript
- FastAPI backend with SQLModel ORM
- Neon PostgreSQL database
- Basic Kubernetes deployment via Helm charts
- OpenAI-powered chatbot with MCP tool integration

### 1.4 Success Criteria

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Event Processing Latency | < 500ms |
| System Availability | 99.9% |
| Recovery Time Objective (RTO) | < 5 minutes |
| Recovery Point Objective (RPO) | < 1 minute |

---

## 2. Functional Requirements

### 2.1 Recurring Tasks

#### 2.1.1 Description
Users can create tasks that automatically regenerate based on a recurrence pattern after completion.

#### 2.1.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RT-001 | Support daily, weekly, monthly, and yearly recurrence patterns | P0 |
| FR-RT-002 | Support custom recurrence rules using RRULE (RFC 5545) format | P1 |
| FR-RT-003 | Generate next occurrence automatically upon task completion | P0 |
| FR-RT-004 | Allow users to skip individual occurrences | P1 |
| FR-RT-005 | Support end conditions: by date, by count, or never | P1 |
| FR-RT-006 | Display upcoming occurrences in task detail view | P2 |

#### 2.1.3 Recurrence Rule Examples

```
FREQ=DAILY                          # Every day
FREQ=WEEKLY;BYDAY=MO,WE,FR          # Mon, Wed, Fri
FREQ=MONTHLY;BYMONTHDAY=15          # 15th of each month
FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1  # January 1st yearly
FREQ=DAILY;COUNT=10                 # Daily for 10 occurrences
FREQ=WEEKLY;UNTIL=20261231T235959Z  # Weekly until end of 2026
```

#### 2.1.4 State Machine

```
┌─────────────┐    complete    ┌─────────────┐
│   PENDING   │───────────────►│  COMPLETED  │
└─────────────┘                └──────┬──────┘
       ▲                              │
       │                              │ is_recurring=true
       │         generate_next        │
       └──────────────────────────────┘
```

---

### 2.2 Due Dates & Reminder Scheduling

#### 2.2.1 Description
Tasks support precise due dates with timezone awareness and configurable reminder notifications.

#### 2.2.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DD-001 | Support due date with full datetime precision (due_at) | P0 |
| FR-DD-002 | Support legacy date-only due dates for backward compatibility | P0 |
| FR-DD-003 | Store all timestamps in UTC with timezone metadata | P0 |
| FR-DD-004 | Support reminder scheduling (remind_at) | P0 |
| FR-DD-005 | Allow multiple reminders per task (future) | P2 |
| FR-DD-006 | Send reminders via in-app notification | P0 |
| FR-DD-007 | Support email/push notifications for reminders | P1 |
| FR-DD-008 | Auto-suggest reminder times based on due date | P2 |

#### 2.2.3 Reminder Scheduling Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Task with   │     │   Reminder   │     │ Notification │
│  remind_at   │────►│   Service    │────►│   Service    │
│   created    │     │  (Dapr Job)  │     │  (Consumer)  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────┴──────┐
                     │   Kafka     │
                     │   Topic:    │
                     │  reminders  │
                     └─────────────┘
```

---

### 2.3 Priority System

#### 2.3.1 Description
Tasks are assigned priority levels that influence display order, notification urgency, and AI suggestions.

#### 2.3.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PR-001 | Support three priority levels: low, medium, high | P0 |
| FR-PR-002 | Default priority is "medium" | P0 |
| FR-PR-003 | Visual distinction for priority levels in UI | P0 |
| FR-PR-004 | Sort tasks by priority (descending) as secondary sort | P1 |
| FR-PR-005 | High-priority tasks trigger more aggressive reminders | P2 |
| FR-PR-006 | AI chatbot considers priority in task suggestions | P1 |

#### 2.3.3 Priority Definitions

| Level | Value | Color | Reminder Multiplier | Description |
|-------|-------|-------|---------------------|-------------|
| High | `high` | Red | 2x | Critical tasks requiring immediate attention |
| Medium | `medium` | Yellow | 1x | Standard tasks with normal urgency |
| Low | `low` | Gray | 0.5x | Non-urgent tasks that can be deferred |

---

### 2.4 Tags

#### 2.4.1 Description
Users can categorize tasks with free-form tags for organization and filtering.

#### 2.4.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TG-001 | Tasks support multiple tags (0 to N) | P0 |
| FR-TG-002 | Tags are stored as JSON array of strings | P0 |
| FR-TG-003 | Tag names are case-insensitive for matching | P1 |
| FR-TG-004 | Maximum 20 tags per task | P1 |
| FR-TG-005 | Maximum tag length: 50 characters | P1 |
| FR-TG-006 | Auto-suggest tags from user's existing tags | P2 |
| FR-TG-007 | Filter tasks by one or more tags | P0 |
| FR-TG-008 | Display tag usage statistics | P2 |

#### 2.4.3 Tag Storage

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Review quarterly report",
  "tags": ["work", "finance", "q4-2026", "urgent"]
}
```

---

### 2.5 Search, Filter & Sort

#### 2.5.1 Description
Users can search, filter, and sort their tasks using various criteria.

#### 2.5.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SF-001 | Full-text search on title and description | P0 |
| FR-SF-002 | Filter by completion status (all/active/completed) | P0 |
| FR-SF-003 | Filter by priority level | P0 |
| FR-SF-004 | Filter by tags (AND/OR logic) | P0 |
| FR-SF-005 | Filter by due date range | P1 |
| FR-SF-006 | Filter by recurring vs one-time tasks | P1 |
| FR-SF-007 | Sort by: due_at, priority, created_at, title | P0 |
| FR-SF-008 | Combine multiple filters with AND logic | P0 |
| FR-SF-009 | Save filter presets (smart lists) | P2 |
| FR-SF-010 | Search via AI chatbot natural language | P1 |

#### 2.5.3 API Query Parameters

```
GET /api/tasks?
  q=quarterly                    # Full-text search
  &status=active                 # Completion filter
  &priority=high,medium          # Priority filter (OR)
  &tags=work,finance             # Tag filter (AND)
  &due_after=2026-02-01          # Due date range start
  &due_before=2026-02-28         # Due date range end
  &is_recurring=true             # Recurring filter
  &sort_by=due_at                # Sort field
  &sort_order=asc                # Sort direction
  &page=1&limit=20               # Pagination
```

---

### 2.6 Real-Time Sync Across Clients

#### 2.6.1 Description
Changes made on one client are immediately reflected on all other connected clients for the same user.

#### 2.6.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RS-001 | WebSocket connection for real-time updates | P0 |
| FR-RS-002 | Sync task CRUD operations across clients | P0 |
| FR-RS-003 | Sync task reordering across clients | P0 |
| FR-RS-004 | Handle offline mode with conflict resolution | P1 |
| FR-RS-005 | Last-write-wins conflict resolution strategy | P1 |
| FR-RS-006 | Optimistic UI updates with rollback on failure | P1 |
| FR-RS-007 | Connection status indicator in UI | P0 |

#### 2.6.3 WebSocket Protocol

```
# Client → Server
{"type": "subscribe", "channel": "tasks", "user_id": "..."}
{"type": "unsubscribe", "channel": "tasks"}

# Server → Client
{"type": "task.created", "data": {...}}
{"type": "task.updated", "data": {...}}
{"type": "task.deleted", "data": {"id": "..."}}
{"type": "task.reordered", "data": {"task_ids": [...]}}
```

---

### 2.7 Activity & Audit Logging

#### 2.7.1 Description
All significant user actions and system events are logged for audit, debugging, and analytics purposes.

#### 2.7.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AL-001 | Log all task CRUD operations | P0 |
| FR-AL-002 | Log authentication events (login, logout, failures) | P0 |
| FR-AL-003 | Log AI chatbot interactions | P1 |
| FR-AL-004 | Include actor, action, resource, timestamp, metadata | P0 |
| FR-AL-005 | Retain audit logs for 90 days minimum | P1 |
| FR-AL-006 | Display activity feed in user dashboard | P2 |
| FR-AL-007 | Export audit logs for compliance | P2 |

#### 2.7.3 Audit Log Schema

```json
{
  "id": "evt_123456789",
  "timestamp": "2026-02-03T10:30:00Z",
  "actor": {
    "type": "user",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "action": "task.completed",
  "resource": {
    "type": "task",
    "id": "660e8400-e29b-41d4-a716-446655440001"
  },
  "metadata": {
    "previous_status": false,
    "new_status": true,
    "client_ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  }
}
```

---

## 3. Non-Functional Requirements

### 3.1 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SC-001 | Horizontal scaling of all services | 1-100 replicas |
| NFR-SC-002 | Database connection pooling | 5-50 connections/pod |
| NFR-SC-003 | Kafka partition scaling | 3-12 partitions/topic |
| NFR-SC-004 | Support concurrent users | 10,000+ |
| NFR-SC-005 | Tasks per user limit | 100,000 |
| NFR-SC-006 | Auto-scaling based on CPU/memory/custom metrics | HPA + KEDA |

### 3.2 Fault Tolerance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-FT-001 | Service redundancy | Minimum 2 replicas |
| NFR-FT-002 | Kafka replication factor | 3 |
| NFR-FT-003 | Database failover | Automatic (Neon) |
| NFR-FT-004 | Circuit breaker for external calls | 5 failures/10s |
| NFR-FT-005 | Graceful degradation when Kafka unavailable | Queue locally |
| NFR-FT-006 | Pod disruption budget | maxUnavailable: 1 |

### 3.3 Event-Driven Decoupling

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-ED-001 | Async event publishing | Non-blocking, fire-and-forget |
| NFR-ED-002 | At-least-once delivery | Idempotent consumers |
| NFR-ED-003 | Event ordering | Per-partition ordering by user_id |
| NFR-ED-004 | Dead letter queue | For failed message processing |
| NFR-ED-005 | Event replay capability | 7-day retention |

### 3.4 Observability

| ID | Requirement | Tool/Target |
|----|-------------|-------------|
| NFR-OB-001 | Structured JSON logging | All services |
| NFR-OB-002 | Distributed tracing | OpenTelemetry + Jaeger |
| NFR-OB-003 | Metrics collection | Prometheus |
| NFR-OB-004 | Dashboards | Grafana |
| NFR-OB-005 | Alerting | Alertmanager |
| NFR-OB-006 | Log aggregation | Loki or ELK |
| NFR-OB-007 | Trace sampling rate | 10% in production |

### 3.5 Security

| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-SE-001 | Secrets management | Dapr Secrets + K8s Secrets |
| NFR-SE-002 | API authentication | JWT with RS256 |
| NFR-SE-003 | Service-to-service auth | mTLS via Dapr |
| NFR-SE-004 | Network isolation | Kubernetes NetworkPolicies |
| NFR-SE-005 | Container security | Non-root, read-only filesystem |
| NFR-SE-006 | Vulnerability scanning | Trivy in CI/CD |
| NFR-SE-007 | Secret rotation | Quarterly minimum |

### 3.6 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PF-001 | API response time (p50) | < 50ms |
| NFR-PF-002 | API response time (p95) | < 200ms |
| NFR-PF-003 | API response time (p99) | < 500ms |
| NFR-PF-004 | Event processing latency | < 500ms |
| NFR-PF-005 | WebSocket message latency | < 100ms |
| NFR-PF-006 | Database query time (p95) | < 50ms |
| NFR-PF-007 | Kafka produce latency | < 10ms |

---

## 4. System Architecture

### 4.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERNETES CLUSTER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           INGRESS CONTROLLER                             │    │
│  │                    (NGINX / Traefik / Cloud ALB)                        │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                              │
│  ┌────────────────────────────────┼────────────────────────────────────────┐    │
│  │                                ▼                                         │    │
│  │  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │    │
│  │  │    FRONTEND      │    │    CHAT API      │    │    TASK API      │   │    │
│  │  │    (Next.js)     │    │    SERVICE       │    │    SERVICE       │   │    │
│  │  │                  │    │    (FastAPI)     │    │    (FastAPI)     │   │    │
│  │  │  ┌────────────┐  │    │  ┌────────────┐  │    │  ┌────────────┐  │   │    │
│  │  │  │            │  │    │  │   DAPR     │  │    │  │   DAPR     │  │   │    │
│  │  │  │            │  │    │  │  SIDECAR   │  │    │  │  SIDECAR   │  │   │    │
│  │  │  └────────────┘  │    │  └─────┬──────┘  │    │  └─────┬──────┘  │   │    │
│  │  └──────────────────┘    └────────┼─────────┘    └────────┼─────────┘   │    │
│  │           │                       │                       │              │    │
│  │           │                       └───────────┬───────────┘              │    │
│  │           │                                   │                          │    │
│  │           │              ┌────────────────────┼────────────────────┐     │    │
│  │           │              │                    ▼                    │     │    │
│  │           │              │  ┌─────────────────────────────────┐   │     │    │
│  │           │              │  │         APACHE KAFKA            │   │     │    │
│  │           │              │  │    (Strimzi / Redpanda Cloud)   │   │     │    │
│  │           │              │  │                                 │   │     │    │
│  │           │              │  │  Topics:                        │   │     │    │
│  │           │              │  │  • task-events                  │   │     │    │
│  │           │              │  │  • reminder-events              │   │     │    │
│  │           │              │  │  • notification-events          │   │     │    │
│  │           │              │  │  • audit-events                 │   │     │    │
│  │           │              │  └─────────────────────────────────┘   │     │    │
│  │           │              │                    │                    │     │    │
│  │           │              └────────────────────┼────────────────────┘     │    │
│  │           │                                   │                          │    │
│  │           │         ┌─────────────────────────┼─────────────────────┐    │    │
│  │           │         │                         ▼                     │    │    │
│  │           │         │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │           │         │  │  RECURRING   │  │ NOTIFICATION │  │   AUDIT    │    │
│  │           │         │  │    TASK      │  │   SERVICE    │  │  SERVICE   │    │
│  │           │         │  │   SERVICE    │  │              │  │            │    │
│  │           │         │  │ ┌──────────┐ │  │ ┌──────────┐ │  │┌──────────┐│    │
│  │           │         │  │ │  DAPR    │ │  │ │  DAPR    │ │  ││  DAPR    ││    │
│  │           │         │  │ │ SIDECAR  │ │  │ │ SIDECAR  │ │  ││ SIDECAR  ││    │
│  │           │         │  │ └──────────┘ │  │ └──────────┘ │  │└──────────┘│    │
│  │           │         │  └──────────────┘  └──────────────┘  └────────────┘    │
│  │           │         │         │                 │                │      │    │
│  │           │         └─────────┼─────────────────┼────────────────┼──────┘    │
│  │           │                   │                 │                │           │
│  └───────────┼───────────────────┼─────────────────┼────────────────┼───────────┘
│              │                   │                 │                │           │
│              ▼                   ▼                 ▼                ▼           │
│  ┌───────────────────────────────────────────────────────────────────────┐      │
│  │                        EXTERNAL SERVICES                              │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │      │
│  │  │    NEON      │  │   OPENAI     │  │    EMAIL     │  │   PUSH    │ │      │
│  │  │  POSTGRESQL  │  │     API      │  │   SERVICE    │  │  SERVICE  │ │      │
│  │  │   (Managed)  │  │              │  │  (SendGrid)  │  │  (FCM)    │ │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │      │
│  └───────────────────────────────────────────────────────────────────────┘      │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐      │
│  │                        OBSERVABILITY STACK                            │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │      │
│  │  │  PROMETHEUS  │  │   GRAFANA    │  │    JAEGER    │  │   LOKI    │ │      │
│  │  │   (Metrics)  │  │ (Dashboards) │  │  (Tracing)   │  │  (Logs)   │ │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │      │
│  └───────────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Microservices Breakdown

#### 4.2.1 Chat API Service

**Responsibility:** Handle AI chatbot interactions, natural language task management

| Aspect | Detail |
|--------|--------|
| **Technology** | FastAPI + OpenAI SDK |
| **Port** | 8001 |
| **Replicas** | 2-10 (HPA) |
| **Dependencies** | Task API, OpenAI API, Neon PostgreSQL |
| **Dapr Components** | pubsub, secrets, service-invocation |

**Endpoints:**
- `POST /api/chat/{user_id}` - Process chat message
- `GET /api/chat/{user_id}/history` - Get conversation history
- `DELETE /api/chat/{user_id}/history` - Clear conversation

**Events Published:**
- `chat.message.received`
- `chat.tool.executed`

---

#### 4.2.2 Task API Service

**Responsibility:** Core task CRUD operations, real-time sync, search/filter

| Aspect | Detail |
|--------|--------|
| **Technology** | FastAPI + SQLModel |
| **Port** | 8000 |
| **Replicas** | 2-10 (HPA) |
| **Dependencies** | Neon PostgreSQL, Kafka |
| **Dapr Components** | pubsub, state, secrets, service-invocation |

**Endpoints:**
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/reorder` - Reorder tasks
- `WS /api/tasks/ws` - WebSocket for real-time sync

**Events Published:**
- `task.created`
- `task.updated`
- `task.completed`
- `task.deleted`

---

#### 4.2.3 Recurring Task Service

**Responsibility:** Generate next occurrences for recurring tasks, handle RRULE parsing

| Aspect | Detail |
|--------|--------|
| **Technology** | FastAPI + python-dateutil |
| **Port** | 8002 |
| **Replicas** | 1-3 |
| **Dependencies** | Task API, Neon PostgreSQL |
| **Dapr Components** | pubsub, jobs, secrets |

**Triggers:**
- Kafka consumer: `task.completed` events
- Dapr Job: Daily scan for overdue recurring tasks

**Events Published:**
- `task.occurrence.generated`
- `recurring.task.error`

---

#### 4.2.4 Notification Service

**Responsibility:** Process reminder events, send notifications via multiple channels

| Aspect | Detail |
|--------|--------|
| **Technology** | FastAPI + SendGrid/FCM SDKs |
| **Port** | 8003 |
| **Replicas** | 2-5 |
| **Dependencies** | SendGrid API, Firebase Cloud Messaging |
| **Dapr Components** | pubsub, secrets |

**Triggers:**
- Kafka consumer: `reminder.triggered` events
- Kafka consumer: `notification.requested` events

**Events Published:**
- `notification.sent`
- `notification.failed`

---

#### 4.2.5 Audit Service

**Responsibility:** Consume all events, persist audit logs, provide query API

| Aspect | Detail |
|--------|--------|
| **Technology** | FastAPI |
| **Port** | 8004 |
| **Replicas** | 1-2 |
| **Dependencies** | Neon PostgreSQL (separate audit schema) |
| **Dapr Components** | pubsub, secrets |

**Triggers:**
- Kafka consumer: All `*` events (wildcard subscription)

**Endpoints:**
- `GET /api/audit` - Query audit logs
- `GET /api/audit/export` - Export logs (CSV/JSON)

---

### 4.3 Role of Kafka

Apache Kafka serves as the central nervous system for event-driven communication:

| Function | Description |
|----------|-------------|
| **Event Bus** | Decouples services via async messaging |
| **Event Sourcing** | Maintains event history for replay |
| **Load Leveling** | Buffers traffic spikes |
| **Fan-out** | Single event consumed by multiple services |
| **Ordering** | Guarantees per-partition ordering |

---

### 4.4 Role of Dapr Sidecars

Dapr sidecars provide platform-agnostic building blocks:

| Building Block | Usage |
|----------------|-------|
| **Pub/Sub** | Abstract Kafka producer/consumer |
| **State** | Distributed state management |
| **Service Invocation** | Service-to-service calls with retries |
| **Secrets** | Unified secrets access |
| **Jobs** | Scheduled task execution |
| **Bindings** | External system integration |

---

## 5. Event-Driven Architecture

### 5.1 Kafka Topics

| Topic Name | Partitions | Retention | Description |
|------------|------------|-----------|-------------|
| `task-events` | 6 | 7 days | All task lifecycle events |
| `reminder-events` | 3 | 1 day | Reminder scheduling and triggers |
| `notification-events` | 3 | 1 day | Notification delivery events |
| `audit-events` | 6 | 30 days | All system audit events |
| `chat-events` | 3 | 7 days | Chatbot interaction events |
| `dlq-events` | 3 | 14 days | Dead letter queue for failed messages |

### 5.2 Producers and Consumers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EVENT FLOW DIAGRAM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   PRODUCERS                    TOPICS                    CONSUMERS      │
│   ─────────                    ──────                    ─────────      │
│                                                                         │
│   ┌───────────┐                                        ┌─────────────┐  │
│   │ Task API  │────────────►  task-events  ──────────►│ Recurring   │  │
│   │ Service   │                    │                   │ Task Svc    │  │
│   └───────────┘                    │                   └─────────────┘  │
│                                    │                                    │
│                                    ├─────────────────►┌─────────────┐  │
│                                    │                  │ Audit Svc   │  │
│                                    │                  └─────────────┘  │
│                                    │                                    │
│                                    └─────────────────►┌─────────────┐  │
│                                                       │ WebSocket   │  │
│                                                       │ Broadcaster │  │
│                                                       └─────────────┘  │
│                                                                         │
│   ┌───────────┐                                        ┌─────────────┐  │
│   │ Recurring │────────────► reminder-events ────────►│Notification │  │
│   │ Task Svc  │                                        │ Service     │  │
│   └───────────┘                                        └─────────────┘  │
│                                                                         │
│   ┌───────────┐                                        ┌─────────────┐  │
│   │Notification────────────►notification-events──────►│ Audit Svc   │  │
│   │ Service   │                                        └─────────────┘  │
│   └───────────┘                                                         │
│                                                                         │
│   ┌───────────┐                                        ┌─────────────┐  │
│   │ Chat API  │────────────►  chat-events  ──────────►│ Audit Svc   │  │
│   │ Service   │                                        └─────────────┘  │
│   └───────────┘                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Event Schemas

#### 5.3.1 Task Events

**TaskCreated Event**
```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/services/task-api",
  "id": "evt-550e8400-e29b-41d4-a716-446655440000",
  "time": "2026-02-03T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Review quarterly report",
    "description": "Q4 2026 financial review",
    "priority": "high",
    "tags": ["work", "finance"],
    "due_at": "2026-02-15T17:00:00Z",
    "remind_at": "2026-02-15T09:00:00Z",
    "is_recurring": false,
    "recurrence_rule": null,
    "created_at": "2026-02-03T10:30:00Z"
  }
}
```

**TaskCompleted Event**
```json
{
  "specversion": "1.0",
  "type": "task.completed",
  "source": "/services/task-api",
  "id": "evt-550e8400-e29b-41d4-a716-446655440003",
  "time": "2026-02-15T16:45:00Z",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "completed_at": "2026-02-15T16:45:00Z",
    "is_recurring": false,
    "recurrence_rule": null
  }
}
```

**TaskUpdated Event**
```json
{
  "specversion": "1.0",
  "type": "task.updated",
  "source": "/services/task-api",
  "id": "evt-550e8400-e29b-41d4-a716-446655440004",
  "time": "2026-02-10T14:20:00Z",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "changes": {
      "priority": {"old": "medium", "new": "high"},
      "due_at": {"old": "2026-02-20T17:00:00Z", "new": "2026-02-15T17:00:00Z"}
    },
    "updated_at": "2026-02-10T14:20:00Z"
  }
}
```

#### 5.3.2 Reminder Events

**ReminderScheduled Event**
```json
{
  "specversion": "1.0",
  "type": "reminder.scheduled",
  "source": "/services/task-api",
  "id": "evt-550e8400-e29b-41d4-a716-446655440005",
  "time": "2026-02-03T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "rem-880e8400-e29b-41d4-a716-446655440006",
    "task_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "scheduled_for": "2026-02-15T09:00:00Z",
    "task_title": "Review quarterly report"
  }
}
```

**ReminderTriggered Event**
```json
{
  "specversion": "1.0",
  "type": "reminder.triggered",
  "source": "/services/recurring-task",
  "id": "evt-550e8400-e29b-41d4-a716-446655440007",
  "time": "2026-02-15T09:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "rem-880e8400-e29b-41d4-a716-446655440006",
    "task_id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "task_title": "Review quarterly report",
    "task_priority": "high",
    "due_at": "2026-02-15T17:00:00Z",
    "channels": ["in_app", "email"]
  }
}
```

#### 5.3.3 CloudEvents Envelope

All events follow the [CloudEvents v1.0 specification](https://cloudevents.io/) for interoperability:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `specversion` | String | Yes | CloudEvents version (1.0) |
| `type` | String | Yes | Event type (e.g., `task.created`) |
| `source` | URI | Yes | Event origin service |
| `id` | String | Yes | Unique event identifier |
| `time` | Timestamp | Yes | Event timestamp (RFC 3339) |
| `datacontenttype` | String | Yes | Payload content type |
| `data` | Object | Yes | Event payload |

---

## 6. Dapr Usage Specification

### 6.1 Pub/Sub Component

**Component Definition:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-kafka
  namespace: todo-app
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka-bootstrap.kafka.svc.cluster.local:9092"
    - name: consumerGroup
      value: "todo-app-group"
    - name: authType
      value: "none"  # Use "sasl" for production
    - name: maxMessageBytes
      value: "1048576"  # 1MB
scopes:
  - task-api
  - chat-api
  - recurring-task
  - notification-service
  - audit-service
```

**Usage in Code:**
```python
from dapr.clients import DaprClient

async def publish_task_event(event_type: str, data: dict):
    async with DaprClient() as client:
        await client.publish_event(
            pubsub_name="pubsub-kafka",
            topic_name="task-events",
            data=json.dumps(data),
            data_content_type="application/json",
            publish_metadata={"partitionKey": data["user_id"]}
        )
```

---

### 6.2 State Management Component

**Component Definition:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore-redis
  namespace: todo-app
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: "redis-master.redis.svc.cluster.local:6379"
    - name: redisPassword
      secretKeyRef:
        name: redis-secret
        key: password
    - name: actorStateStore
      value: "true"
scopes:
  - task-api
  - chat-api
```

**Usage in Code:**
```python
# Save state
async with DaprClient() as client:
    await client.save_state(
        store_name="statestore-redis",
        key=f"user:{user_id}:preferences",
        value=json.dumps(preferences)
    )

# Get state
async with DaprClient() as client:
    state = await client.get_state(
        store_name="statestore-redis",
        key=f"user:{user_id}:preferences"
    )
```

---

### 6.3 Service Invocation

**Direct Service Call:**
```python
async with DaprClient() as client:
    # Call Task API from Chat API
    response = await client.invoke_method(
        app_id="task-api",
        method_name="api/tasks",
        http_verb="POST",
        data=json.dumps(task_data),
        content_type="application/json"
    )
```

**Benefits:**
- Automatic service discovery
- Built-in retries and circuit breaking
- mTLS encryption
- Distributed tracing propagation

---

### 6.4 Jobs API (Reminder Scheduling)

**Job Definition:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Job
metadata:
  name: reminder-scheduler
  namespace: todo-app
spec:
  schedule: "*/1 * * * *"  # Every minute
  repeats: 0  # Infinite
  dueTime: "0s"
  ttl: "30s"
  data:
    type: "check_reminders"
```

**Handler in Recurring Task Service:**
```python
@app.post("/jobs/reminder-scheduler")
async def handle_reminder_job(request: Request):
    """
    Dapr Jobs trigger - runs every minute.
    Checks for reminders due in the next minute and publishes events.
    """
    now = datetime.utcnow()
    window_end = now + timedelta(minutes=1)

    due_reminders = await get_due_reminders(now, window_end)

    for reminder in due_reminders:
        await publish_reminder_triggered(reminder)

    return {"processed": len(due_reminders)}
```

---

### 6.5 Secrets Management

**Component Definition:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secrets-kubernetes
  namespace: todo-app
spec:
  type: secretstores.kubernetes
  version: v1
  metadata: []
```

**Usage in Code:**
```python
async with DaprClient() as client:
    # Get database credentials
    secret = await client.get_secret(
        store_name="secrets-kubernetes",
        key="neon-credentials"
    )
    db_url = secret.secret["DATABASE_URL"]
```

**Multi-Secret Store Support:**
```yaml
# Azure Key Vault for production
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secrets-azurekeyvault
  namespace: todo-app
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
    - name: vaultName
      value: "todo-app-prod-kv"
    - name: azureClientId
      value: "<managed-identity-client-id>"
```

---

## 7. Deployment Specification

### 7.1 Local Deployment (Minikube)

#### 7.1.1 Prerequisites

```bash
# Required tools
minikube version  # >= 1.32.0
kubectl version   # >= 1.28.0
helm version      # >= 3.14.0
dapr version      # >= 1.12.0
```

#### 7.1.2 Setup Script

```bash
#!/bin/bash
# scripts/setup-local.sh

# Start Minikube with adequate resources
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=50g \
  --driver=docker \
  --kubernetes-version=v1.28.0

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# Initialize Dapr
dapr init -k --runtime-version 1.12.0

# Install Strimzi Kafka Operator
kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka

# Wait for operator
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s

# Deploy Kafka cluster
kubectl apply -f k8s/kafka/kafka-cluster.yaml

# Install Redis (for Dapr state store)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis -n todo-app --create-namespace

# Deploy application
helm install todo-app ./charts/todo-app -n todo-app -f charts/todo-app/values-minikube.yaml
```

#### 7.1.3 Port Forwarding

```bash
# Frontend
kubectl port-forward svc/todo-frontend 3000:80 -n todo-app

# Backend API
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app

# Kafka UI (optional)
kubectl port-forward svc/kafka-ui 8080:8080 -n kafka

# Grafana
kubectl port-forward svc/grafana 3001:80 -n monitoring
```

---

### 7.2 Cloud Deployment (AKS/GKE/OKE)

#### 7.2.1 Infrastructure Requirements

| Resource | AKS | GKE | OKE |
|----------|-----|-----|-----|
| **Node Pool** | Standard_D4s_v3 (3 nodes) | e2-standard-4 (3 nodes) | VM.Standard.E4.Flex (3 nodes) |
| **Kubernetes Version** | 1.28+ | 1.28+ | 1.28+ |
| **Container Registry** | ACR | Artifact Registry | OCIR |
| **Load Balancer** | Azure LB | Cloud Load Balancing | OCI LB |
| **Managed Kafka** | Azure Event Hubs | Confluent Cloud | OCI Streaming |

#### 7.2.2 Terraform Structure

```
infrastructure/
├── modules/
│   ├── aks/
│   ├── gke/
│   ├── oke/
│   ├── kafka/
│   └── observability/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
└── main.tf
```

#### 7.2.3 Helm Values Override (Production)

```yaml
# charts/todo-app/values-production.yaml
global:
  environment: production
  imageRegistry: myregistry.azurecr.io

backend:
  replicas: 3
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 2000m
      memory: 1Gi
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPU: 70

frontend:
  replicas: 3
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 512Mi

kafka:
  external: true
  bootstrapServers: "pkc-xxxxx.eastus.azure.confluent.cloud:9092"
  sasl:
    enabled: true
    mechanism: PLAIN
    secretRef: kafka-credentials

dapr:
  enabled: true
  sidecar:
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 256Mi

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: todo.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: todo-tls
      hosts:
        - todo.example.com
```

---

### 7.3 Kafka Options

#### 7.3.1 Strimzi (Self-Managed)

**Pros:**
- Full control over configuration
- No external dependencies
- Cost-effective for development

**Cons:**
- Operational overhead
- Requires Kafka expertise
- Manual scaling and upgrades

**Deployment:**
```yaml
# k8s/kafka/kafka-cluster.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: todo-kafka
  namespace: kafka
spec:
  kafka:
    version: 3.6.0
    replicas: 3
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    storage:
      type: persistent-claim
      size: 50Gi
      class: standard
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 10Gi
      class: standard
```

#### 7.3.2 Redpanda Cloud (Managed)

**Pros:**
- Zero operational overhead
- Kafka API compatible
- Built-in schema registry
- Lower latency than Kafka

**Cons:**
- Monthly cost (~$100+/month for dedicated)
- External network dependency

**Configuration:**
```yaml
# Dapr pubsub component for Redpanda
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-redpanda
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "seed-xxxxx.redpanda.com:9092"
    - name: authType
      value: "sasl"
    - name: saslUsername
      secretKeyRef:
        name: redpanda-credentials
        key: username
    - name: saslPassword
      secretKeyRef:
        name: redpanda-credentials
        key: password
    - name: saslMechanism
      value: "SCRAM-SHA-256"
```

---

### 7.4 Helm Charts Structure

```
charts/
└── todo-app/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-minikube.yaml
    ├── values-production.yaml
    ├── templates/
    │   ├── _helpers.tpl
    │   ├── namespace.yaml
    │   ├── configmap.yaml
    │   ├── secrets.yaml
    │   ├── deployments/
    │   │   ├── frontend.yaml
    │   │   ├── task-api.yaml
    │   │   ├── chat-api.yaml
    │   │   ├── recurring-task.yaml
    │   │   ├── notification.yaml
    │   │   └── audit.yaml
    │   ├── services/
    │   │   ├── frontend.yaml
    │   │   ├── task-api.yaml
    │   │   ├── chat-api.yaml
    │   │   └── internal-services.yaml
    │   ├── dapr/
    │   │   ├── pubsub.yaml
    │   │   ├── statestore.yaml
    │   │   ├── secrets.yaml
    │   │   └── jobs.yaml
    │   ├── networking/
    │   │   ├── ingress.yaml
    │   │   └── network-policies.yaml
    │   ├── autoscaling/
    │   │   ├── hpa.yaml
    │   │   └── pdb.yaml
    │   └── observability/
    │       ├── servicemonitor.yaml
    │       └── prometheusrule.yaml
    └── charts/
        └── kafka/  # Strimzi subchart (optional)
```

---

### 7.5 CI/CD with GitHub Actions

#### 7.5.1 Workflow Structure

```yaml
# .github/workflows/ci-cd.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ${{ github.repository }}

jobs:
  # ============================================
  # TEST STAGE
  # ============================================
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [task-api, chat-api, recurring-task, notification, audit]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend/${{ matrix.service }}
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          cd backend/${{ matrix.service }}
          pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: backend/${{ matrix.service }}/coverage.xml
          flags: ${{ matrix.service }}

  # ============================================
  # BUILD STAGE
  # ============================================
  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, task-api, chat-api, recurring-task, notification, audit]
    outputs:
      tags: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service == 'frontend' && 'frontend' || format('backend/{0}', matrix.service) }}
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ============================================
  # SECURITY SCAN
  # ============================================
  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  # ============================================
  # DEPLOY TO STAGING
  # ============================================
  deploy-staging:
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v4
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}

      - name: Deploy with Helm
        run: |
          helm upgrade --install todo-app ./charts/todo-app \
            -n todo-app \
            -f charts/todo-app/values-staging.yaml \
            --set global.imageTag=${{ github.sha }} \
            --wait --timeout=10m

  # ============================================
  # DEPLOY TO PRODUCTION
  # ============================================
  deploy-production:
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v4
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}

      - name: Deploy with Helm
        run: |
          helm upgrade --install todo-app ./charts/todo-app \
            -n todo-app \
            -f charts/todo-app/values-production.yaml \
            --set global.imageTag=${{ github.sha }} \
            --wait --timeout=15m

      - name: Smoke tests
        run: |
          kubectl run smoke-test --image=curlimages/curl --rm -i --restart=Never -- \
            curl -sf https://todo.example.com/api/health
```

---

## 8. Data Model Specification

### 8.1 Advanced Task Model

#### 8.1.1 Database Schema (PostgreSQL)

```sql
-- Already implemented in backend/src/models/task.py
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,

    -- Legacy date field (backward compatibility)
    due_date DATE,

    -- Advanced scheduling
    due_at TIMESTAMP WITH TIME ZONE,
    remind_at TIMESTAMP WITH TIME ZONE,

    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255),  -- RRULE format

    -- Priority and categorization
    priority VARCHAR(20) DEFAULT 'medium',
    tags JSONB DEFAULT '[]'::jsonb,

    -- Ordering and ownership
    position INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

-- Indexes for query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_at ON tasks(due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_tasks_remind_at ON tasks(remind_at) WHERE remind_at IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_is_recurring ON tasks(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_tasks_fulltext ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

#### 8.1.2 SQLModel Definition (Python)

```python
# Already implemented in backend/src/models/task.py
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime, date
from uuid import UUID, uuid4
from typing import Optional, List
from enum import Enum


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, sa_column_kwargs={"nullable": False})
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False)

    # Legacy date field (backward compatibility)
    due_date: Optional[date] = Field(default=None, sa_column_kwargs={"index": True})

    # Advanced scheduling
    due_at: Optional[datetime] = Field(default=None, sa_column_kwargs={"index": True})
    remind_at: Optional[datetime] = Field(default=None)

    # Recurrence
    is_recurring: bool = Field(default=False)
    recurrence_rule: Optional[str] = Field(default=None, max_length=255)

    # Priority and categorization
    priority: str = Field(default=TaskPriority.MEDIUM.value, max_length=20)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON, default=[]))

    position: int = Field(default=0)
    user_id: UUID = Field(foreign_key="users.id", sa_column_kwargs={"nullable": False, "index": True})
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"nullable": False})
```

#### 8.1.3 Field Specifications

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | Auto-generated | Primary key |
| `title` | VARCHAR(255) | No | - | Task title |
| `description` | TEXT | Yes | NULL | Detailed description |
| `is_completed` | BOOLEAN | No | FALSE | Completion status |
| `due_date` | DATE | Yes | NULL | Legacy date-only due date |
| `due_at` | TIMESTAMPTZ | Yes | NULL | Full datetime due date |
| `remind_at` | TIMESTAMPTZ | Yes | NULL | Reminder trigger time |
| `is_recurring` | BOOLEAN | No | FALSE | Recurrence flag |
| `recurrence_rule` | VARCHAR(255) | Yes | NULL | RRULE string |
| `priority` | VARCHAR(20) | No | 'medium' | Priority level |
| `tags` | JSONB | No | '[]' | Array of tag strings |
| `position` | INTEGER | No | 0 | Sort order |
| `user_id` | UUID | No | - | Foreign key to users |
| `created_at` | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | NOW() | Last modification |

---

## 9. Failure Scenarios & Recovery

### 9.1 Kafka Unavailable

#### 9.1.1 Detection
- Dapr sidecar health check fails for pubsub component
- Kafka producer timeout errors (>30s)
- Consumer lag alerts in monitoring

#### 9.1.2 Impact
- Events not published (task changes not propagated)
- Reminders not triggered
- Audit logs delayed
- Real-time sync disabled

#### 9.1.3 Mitigation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    KAFKA OUTAGE HANDLING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Normal Operation:                                             │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐                  │
│   │ Task API│────►│  KAFKA  │────►│Consumer │                  │
│   └─────────┘     └─────────┘     └─────────┘                  │
│                                                                 │
│   During Outage:                                                │
│   ┌─────────┐     ┌─────────┐                                  │
│   │ Task API│────►│  LOCAL  │  (Redis or file-based queue)    │
│   └─────────┘     │  QUEUE  │                                  │
│                   └────┬────┘                                  │
│                        │                                        │
│   After Recovery:      ▼                                        │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐                  │
│   │  LOCAL  │────►│  KAFKA  │────►│Consumer │                  │
│   │  QUEUE  │     │(replay) │     │         │                  │
│   └─────────┘     └─────────┘     └─────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```python
class ResilientPublisher:
    def __init__(self):
        self.local_queue = RedisQueue("event-buffer")
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=30
        )

    async def publish(self, topic: str, event: dict):
        try:
            if self.circuit_breaker.is_open:
                await self.local_queue.push(topic, event)
                return

            async with DaprClient() as client:
                await client.publish_event(
                    pubsub_name="pubsub-kafka",
                    topic_name=topic,
                    data=json.dumps(event)
                )
                self.circuit_breaker.record_success()
        except Exception as e:
            self.circuit_breaker.record_failure()
            await self.local_queue.push(topic, event)
            logger.error(f"Kafka publish failed, queued locally: {e}")
```

---

### 9.2 Service Crash

#### 9.2.1 Detection
- Kubernetes liveness probe fails (3 consecutive failures)
- Pod enters CrashLoopBackOff state
- Alertmanager fires PodCrashLooping alert

#### 9.2.2 Recovery

| Phase | Action | Timeout |
|-------|--------|---------|
| **Automatic** | Kubernetes restarts pod | Immediate |
| **Liveness** | New pod passes health check | 30s |
| **Readiness** | Pod receives traffic | 10s |
| **Scaling** | HPA may spawn additional pods | 15s |

#### 9.2.3 Configuration

```yaml
# Liveness probe - restart if unhealthy
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
  timeoutSeconds: 5

# Readiness probe - remove from LB if not ready
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
  timeoutSeconds: 3

# Pod disruption budget
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: task-api-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: task-api
```

---

### 9.3 Message Retry Logic

#### 9.3.1 Retry Policy

| Attempt | Delay | Max Attempts | Action on Failure |
|---------|-------|--------------|-------------------|
| 1 | Immediate | - | Retry |
| 2 | 1 second | - | Retry |
| 3 | 5 seconds | - | Retry |
| 4 | 30 seconds | - | Retry |
| 5 | 5 minutes | Max | Send to DLQ |

#### 9.3.2 Dead Letter Queue Handling

```python
@app.post("/subscribe/task-events")
async def handle_task_event(request: Request):
    """
    Dapr subscription handler with retry and DLQ support.
    """
    try:
        event = await request.json()
        await process_task_event(event["data"])
        return {"status": "SUCCESS"}
    except TransientError as e:
        # Retry: Dapr will re-deliver based on retry policy
        logger.warning(f"Transient error, will retry: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "RETRY"}
        )
    except PermanentError as e:
        # DLQ: Don't retry, send to dead letter queue
        logger.error(f"Permanent error, sending to DLQ: {e}")
        await send_to_dlq(event, str(e))
        return {"status": "DROP"}
```

#### 9.3.3 DLQ Processing

```python
# Manual DLQ processor (run periodically or on-demand)
async def process_dlq():
    """
    Reprocess messages from dead letter queue.
    """
    async with DaprClient() as client:
        while True:
            msg = await client.get_state("statestore-redis", "dlq:next")
            if not msg.data:
                break

            try:
                event = json.loads(msg.data)
                await reprocess_event(event)
                await client.delete_state("statestore-redis", f"dlq:{msg.etag}")
            except Exception as e:
                logger.error(f"DLQ reprocessing failed: {e}")
                # Alert on-call engineer
                await send_alert(f"DLQ message stuck: {msg.etag}")
```

---

### 9.4 Dapr Resilience

#### 9.4.1 Resiliency Policy

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: todo-app-resiliency
  namespace: todo-app
spec:
  policies:
    timeouts:
      general: 30s
      kafka-publish: 10s
      database: 5s

    retries:
      pubsubRetry:
        policy: exponential
        maxRetries: 5
        duration: 1s
        maxDuration: 1m

      serviceRetry:
        policy: constant
        duration: 1s
        maxRetries: 3

    circuitBreakers:
      kafkaBreaker:
        maxRequests: 10
        interval: 10s
        timeout: 30s
        trip: consecutiveFailures >= 5

  targets:
    components:
      pubsub-kafka:
        outbound:
          retry: pubsubRetry
          circuitBreaker: kafkaBreaker
          timeout: kafka-publish

    apps:
      task-api:
        retry: serviceRetry
        timeout: general
```

---

## 10. Security Model

### 10.1 Kubernetes Secrets

#### 10.1.1 Secret Categories

| Secret Name | Contents | Rotation |
|-------------|----------|----------|
| `neon-credentials` | DATABASE_URL | Quarterly |
| `jwt-signing-key` | RS256 private/public keys | Annually |
| `openai-api-key` | OpenAI API key | On compromise |
| `kafka-credentials` | SASL username/password | Quarterly |
| `sendgrid-api-key` | Email service API key | Quarterly |
| `fcm-credentials` | Firebase service account | Annually |

#### 10.1.2 Secret Definition

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: neon-credentials
  namespace: todo-app
  labels:
    app.kubernetes.io/managed-by: external-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@host:5432/db?sslmode=require"
```

#### 10.1.3 External Secrets Operator (Production)

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: neon-credentials
  namespace: todo-app
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-keyvault
    kind: ClusterSecretStore
  target:
    name: neon-credentials
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: neon-database-url
```

---

### 10.2 Dapr Secrets

#### 10.2.1 Secret Store Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secrets-kubernetes
  namespace: todo-app
spec:
  type: secretstores.kubernetes
  version: v1
  metadata: []
---
# Production: Azure Key Vault
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secrets-azurekeyvault
  namespace: todo-app
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
    - name: vaultName
      value: "todo-app-prod-kv"
    - name: azureClientId
      value: "<managed-identity-client-id>"
```

#### 10.2.2 Component Secret References

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-kafka
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka.example.com:9092"
    - name: saslUsername
      secretKeyRef:
        name: kafka-credentials
        key: username
    - name: saslPassword
      secretKeyRef:
        name: kafka-credentials
        key: password
```

---

### 10.3 API Authentication

#### 10.3.1 JWT Configuration (RS256)

```python
# backend/src/utils/jwt.py
from jose import jwt, JWTError
from datetime import datetime, timedelta

JWT_ALGORITHM = "RS256"  # Upgraded from HS256
JWT_EXPIRY_HOURS = 24

def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "todo-app",
        "aud": "todo-app-api"
    }
    return jwt.encode(payload, PRIVATE_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
            audience="todo-app-api",
            issuer="todo-app"
        )
        return payload
    except JWTError:
        raise AuthenticationError("Invalid token")
```

#### 10.3.2 API Security Headers

```python
# Middleware for security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

#### 10.3.3 Rate Limiting

```yaml
# Dapr middleware for rate limiting
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ratelimit
  namespace: todo-app
spec:
  type: middleware.http.ratelimit
  version: v1
  metadata:
    - name: maxRequestsPerSecond
      value: "100"
    - name: key
      value: "ip"  # Rate limit by IP
```

---

### 10.4 Network Security

#### 10.4.1 Network Policies

```yaml
# Default deny all
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: todo-app
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# Allow task-api to receive traffic from ingress and dapr
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: task-api-policy
  namespace: todo-app
spec:
  podSelector:
    matchLabels:
      app: task-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: kafka
      ports:
        - protocol: TCP
          port: 9092
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0  # Neon PostgreSQL (external)
      ports:
        - protocol: TCP
          port: 5432
```

---

## 11. Future Extension Points

### 11.1 Multi-Agent Orchestration

**Description:** Coordinate multiple AI agents for complex task workflows.

**Architecture:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Planner    │────►│  Executor   │────►│  Validator  │
│   Agent     │     │   Agent     │     │   Agent     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                   ┌─────────────┐
                   │ Orchestrator│
                   │   (LangGraph)│
                   └─────────────┘
```

**Implementation Path:**
1. Add LangGraph dependency for agent orchestration
2. Define agent roles (Planner, Executor, Validator)
3. Implement state machine for multi-step task breakdown
4. Add human-in-the-loop approval for sensitive actions

---

### 11.2 AI Scheduling Assistant

**Description:** Intelligent task scheduling based on user patterns, priorities, and calendar availability.

**Features:**
- Analyze user's task completion patterns
- Suggest optimal times for tasks based on priority and duration
- Integrate with calendar events to avoid conflicts
- Learn from user feedback (accepted/rejected suggestions)

**Data Requirements:**
```sql
-- User productivity patterns
CREATE TABLE user_patterns (
    user_id UUID REFERENCES users(id),
    day_of_week INTEGER,
    hour_of_day INTEGER,
    completion_rate FLOAT,
    avg_task_duration_minutes INTEGER,
    PRIMARY KEY (user_id, day_of_week, hour_of_day)
);

-- Scheduling suggestions
CREATE TABLE scheduling_suggestions (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    suggested_at TIMESTAMPTZ,
    suggested_for TIMESTAMPTZ,
    confidence_score FLOAT,
    user_response VARCHAR(20), -- accepted, rejected, ignored
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11.3 Smart Task Suggestions

**Description:** AI-powered suggestions for task creation, prioritization, and categorization.

**Features:**
- Auto-suggest tags based on task title/description
- Recommend priority based on keywords and due date proximity
- Suggest related tasks or dependencies
- Predict task duration based on similar completed tasks

**Implementation:**
```python
class SmartSuggestionService:
    def __init__(self, openai_client, embedding_store):
        self.llm = openai_client
        self.embeddings = embedding_store

    async def suggest_tags(self, title: str, description: str) -> List[str]:
        """Use embeddings to find similar tasks and suggest common tags."""
        embedding = await self.llm.embeddings.create(
            input=f"{title} {description}",
            model="text-embedding-3-small"
        )
        similar_tasks = await self.embeddings.search(
            embedding.data[0].embedding,
            top_k=10
        )
        return self._extract_common_tags(similar_tasks)

    async def suggest_priority(self, task: TaskCreate) -> str:
        """Analyze task content and suggest appropriate priority."""
        prompt = f"""
        Analyze this task and suggest priority (low/medium/high):
        Title: {task.title}
        Description: {task.description}
        Due: {task.due_at}

        Consider urgency keywords, deadline proximity, and task complexity.
        Return only: low, medium, or high
        """
        response = await self.llm.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip().lower()
```

---

### 11.4 Extension Roadmap

| Phase | Feature | Timeline | Dependencies |
|-------|---------|----------|--------------|
| V.1 | Core microservices + Kafka | Q1 2026 | Phase V base |
| V.2 | AI Scheduling Assistant | Q2 2026 | User pattern data |
| V.3 | Smart Task Suggestions | Q2 2026 | Embedding store |
| V.4 | Multi-Agent Orchestration | Q3 2026 | LangGraph integration |
| V.5 | Collaborative Workspaces | Q4 2026 | RBAC system |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **CloudEvents** | Specification for describing event data in a common way |
| **Dapr** | Distributed Application Runtime - portable, event-driven runtime |
| **DLQ** | Dead Letter Queue - storage for failed messages |
| **HPA** | Horizontal Pod Autoscaler - Kubernetes auto-scaling |
| **KEDA** | Kubernetes Event-driven Autoscaling |
| **MCP** | Model Context Protocol - AI tool execution framework |
| **mTLS** | Mutual TLS - bidirectional certificate authentication |
| **RRULE** | Recurrence Rule - iCalendar standard (RFC 5545) |
| **Sidecar** | Container running alongside main application container |
| **Strimzi** | Kubernetes operator for Apache Kafka |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-03 | System Architect | Initial specification |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| DevOps Lead | | | |
| Security | | | |
