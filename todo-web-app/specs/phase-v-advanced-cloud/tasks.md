# Phase V: Advanced Cloud Deployment - Task Breakdown

**Document Version:** 1.0.0
**Date:** 2026-02-03
**Status:** Draft
**Plan Reference:** [plan.md](./plan.md)
**Spec Reference:** [spec.md](./spec.md)

---

## Task Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[!]` | Blocked |
| **P0** | Must have (critical path) |
| **P1** | Should have (important) |
| **P2** | Nice to have (can defer) |

---

## Summary Statistics

| Phase | Total Tasks | P0 | P1 | P2 | Estimated Hours |
|-------|-------------|----|----|----|-----------------|
| Phase 1 | 21 | 17 | 4 | 0 | 21h |
| Phase 2 | 23 | 19 | 4 | 0 | 29h |
| Phase 3 | 30 | 24 | 5 | 1 | 45.5h |
| Phase 4 | 26 | 20 | 6 | 0 | 45.5h |
| Phase 5 | 30 | 23 | 7 | 0 | 48h |
| **Total** | **130** | **103** | **26** | **1** | **189h** |

---

## Phase 1: Foundation & Infrastructure

**Duration:** Week 1-2
**Goal:** Establish infrastructure foundation for event-driven microservices
**Blockers:** None (starting phase)

### 1.1 Dapr Installation & Configuration

#### P1-01: Install Dapr CLI locally
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Install the Dapr CLI tool on the local development machine to enable Dapr management commands.

**Acceptance Criteria:**
- [ ] `dapr --version` returns version >= 1.12.0
- [ ] CLI installed via official installer (not package manager for consistency)
- [ ] PATH configured correctly

**Test Cases:**
```bash
# TC-P1-01-1: Verify installation
dapr --version
# Expected: CLI version: 1.12.x, Runtime version: n/a

# TC-P1-01-2: Verify help works
dapr --help
# Expected: Lists all available commands
```

---

#### P1-02: Initialize Dapr on Minikube cluster
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-01

**Description:**
Initialize Dapr runtime on the Minikube Kubernetes cluster with default configuration.

**Acceptance Criteria:**
- [ ] Dapr control plane pods running in `dapr-system` namespace
- [ ] `dapr-operator`, `dapr-sidecar-injector`, `dapr-placement`, `dapr-sentry` healthy
- [ ] Dapr dashboard accessible

**Test Cases:**
```bash
# TC-P1-02-1: Verify Dapr status
dapr status -k
# Expected: All components show "Running"

# TC-P1-02-2: Verify pods
kubectl get pods -n dapr-system
# Expected: 4 pods in Running state

# TC-P1-02-3: Verify dashboard
dapr dashboard -k -p 9999
# Expected: Dashboard opens at http://localhost:9999
```

**Commands:**
```bash
dapr init -k --runtime-version 1.12.0
```

---

#### P1-03: Create Dapr component: secrets-kubernetes
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-02

**Description:**
Create a Dapr secrets component that reads secrets from Kubernetes secrets.

**Acceptance Criteria:**
- [ ] Component YAML created at `k8s/dapr/components/secrets-kubernetes.yaml`
- [ ] Component deployed to `todo-app` namespace
- [ ] Component shows in `dapr components -k`

**Test Cases:**
```bash
# TC-P1-03-1: Verify component exists
kubectl get component secrets-kubernetes -n todo-app
# Expected: Component exists

# TC-P1-03-2: Verify in Dapr
dapr components -k -n todo-app
# Expected: secrets-kubernetes listed
```

**Deliverable:**
```yaml
# k8s/dapr/components/secrets-kubernetes.yaml
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

---

#### P1-04: Create Dapr component: statestore-redis
- **Priority:** P0
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-03, P1-09

**Description:**
Create a Dapr state store component backed by Redis for distributed state management.

**Acceptance Criteria:**
- [ ] Component YAML created at `k8s/dapr/components/statestore-redis.yaml`
- [ ] Component references Redis password from Kubernetes secret
- [ ] State operations work (save, get, delete)

**Test Cases:**
```bash
# TC-P1-04-1: Verify component
kubectl get component statestore-redis -n todo-app
# Expected: Component exists

# TC-P1-04-2: Test state operations (from a Dapr-enabled pod)
curl -X POST http://localhost:3500/v1.0/state/statestore-redis \
  -H "Content-Type: application/json" \
  -d '[{"key": "test-key", "value": "test-value"}]'
# Expected: 204 No Content

curl http://localhost:3500/v1.0/state/statestore-redis/test-key
# Expected: "test-value"
```

**Deliverable:**
```yaml
# k8s/dapr/components/statestore-redis.yaml
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
      value: "redis-master.todo-app.svc.cluster.local:6379"
    - name: redisPassword
      secretKeyRef:
        name: redis-secret
        key: redis-password
scopes:
  - task-api
  - chat-api
```

---

#### P1-05: Verify Dapr dashboard access
- **Priority:** P1
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-02

**Description:**
Verify that the Dapr dashboard is accessible and shows all components correctly.

**Acceptance Criteria:**
- [ ] Dashboard accessible via port-forward
- [ ] All components visible in dashboard
- [ ] Applications tab shows no errors

**Test Cases:**
```bash
# TC-P1-05-1: Access dashboard
dapr dashboard -k -p 9999
# Open http://localhost:9999
# Expected: Dashboard loads, shows components
```

---

### 1.2 Redis Deployment

#### P1-06: Add Redis Helm chart dependency
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Add Bitnami Redis as a dependency to the todo-app Helm chart.

**Acceptance Criteria:**
- [ ] `Chart.yaml` updated with Redis dependency
- [ ] `helm dependency update` succeeds
- [ ] Redis chart downloaded to `charts/` folder

**Test Cases:**
```bash
# TC-P1-06-1: Verify dependency
cd charts/todo-app && helm dependency list
# Expected: redis listed as dependency

# TC-P1-06-2: Update dependencies
helm dependency update
# Expected: Downloading redis...
```

**Deliverable:**
```yaml
# charts/todo-app/Chart.yaml (addition)
dependencies:
  - name: redis
    version: "18.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
```

---

#### P1-07: Configure Redis values for Minikube
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-06

**Description:**
Configure Redis values optimized for Minikube (single replica, minimal resources).

**Acceptance Criteria:**
- [ ] Redis values added to `values.yaml`
- [ ] Resource limits appropriate for Minikube
- [ ] Persistence disabled for dev (optional)

**Test Cases:**
```bash
# TC-P1-07-1: Verify values
helm template todo-app ./charts/todo-app | grep -A 20 "kind: StatefulSet" | grep redis
# Expected: Redis StatefulSet with configured values
```

**Deliverable:**
```yaml
# charts/todo-app/values.yaml (addition)
redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true
    existingSecret: redis-secret
    existingSecretPasswordKey: redis-password
  master:
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 256Mi
    persistence:
      enabled: false
```

---

#### P1-08: Create Redis secret for password
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Create a Kubernetes secret template for Redis password.

**Acceptance Criteria:**
- [ ] Secret template created at `charts/todo-app/templates/redis/secret.yaml`
- [ ] Password configurable via values
- [ ] Secret created in namespace

**Test Cases:**
```bash
# TC-P1-08-1: Verify secret
kubectl get secret redis-secret -n todo-app
# Expected: Secret exists

# TC-P1-08-2: Verify password key
kubectl get secret redis-secret -n todo-app -o jsonpath='{.data.redis-password}'
# Expected: Base64 encoded password
```

**Deliverable:**
```yaml
# charts/todo-app/templates/redis/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
  namespace: {{ .Release.Namespace }}
type: Opaque
data:
  redis-password: {{ .Values.redis.password | default "changeme" | b64enc }}
```

---

#### P1-09: Verify Redis connectivity from pods
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-07, P1-08

**Description:**
Verify that Redis is accessible from application pods.

**Acceptance Criteria:**
- [ ] Redis pod running and healthy
- [ ] Can connect from backend pod
- [ ] PING returns PONG

**Test Cases:**
```bash
# TC-P1-09-1: Verify Redis pod
kubectl get pods -l app.kubernetes.io/name=redis -n todo-app
# Expected: redis-master-0 Running

# TC-P1-09-2: Test connectivity
kubectl exec -it redis-master-0 -n todo-app -- redis-cli -a $REDIS_PASSWORD ping
# Expected: PONG

# TC-P1-09-3: Test from backend pod
kubectl exec -it deploy/task-api -n todo-app -- \
  python -c "import redis; r=redis.Redis(host='redis-master', password='changeme'); print(r.ping())"
# Expected: True
```

---

#### P1-10: Add Redis to Helm umbrella chart
- **Priority:** P1
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-09

**Description:**
Ensure Redis is properly integrated as a subchart with correct naming and configuration.

**Acceptance Criteria:**
- [ ] Redis deploys as part of `helm install todo-app`
- [ ] Service name consistent (`redis-master`)
- [ ] Conditional deployment via `redis.enabled`

**Test Cases:**
```bash
# TC-P1-10-1: Deploy with Redis
helm upgrade --install todo-app ./charts/todo-app -n todo-app --set redis.enabled=true
# Expected: Redis pods created

# TC-P1-10-2: Deploy without Redis
helm upgrade --install todo-app ./charts/todo-app -n todo-app --set redis.enabled=false
# Expected: No Redis pods
```

---

### 1.3 Database Migration

#### P1-11: Generate Alembic migration for new Task fields
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Generate Alembic migration to add advanced task fields to the database. Note: Model already updated in `backend/src/models/task.py`.

**Acceptance Criteria:**
- [ ] Migration file created in `backend/alembic/versions/`
- [ ] Adds columns: `due_at`, `remind_at`, `is_recurring`, `recurrence_rule`, `priority`, `tags`
- [ ] Sets correct defaults and constraints

**Test Cases:**
```bash
# TC-P1-11-1: Generate migration
cd backend && alembic revision --autogenerate -m "add_advanced_task_fields"
# Expected: New migration file created

# TC-P1-11-2: Review migration
cat backend/alembic/versions/*_add_advanced_task_fields.py
# Expected: Contains add_column operations for all 6 fields
```

---

#### P1-12: Add indexes for due_at, remind_at, priority
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-11

**Description:**
Add database indexes for frequently queried columns.

**Acceptance Criteria:**
- [ ] Index on `due_at` column
- [ ] Index on `remind_at` column
- [ ] Index on `priority` column

**Test Cases:**
```sql
-- TC-P1-12-1: Verify indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';
-- Expected: idx_tasks_due_at, idx_tasks_remind_at, idx_tasks_priority
```

---

#### P1-13: Add GIN index for tags JSONB column
- **Priority:** P1
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-11

**Description:**
Add GIN index on tags column for efficient JSONB array queries.

**Acceptance Criteria:**
- [ ] GIN index created on `tags` column
- [ ] Query `WHERE tags @> '["work"]'` uses index

**Test Cases:**
```sql
-- TC-P1-13-1: Verify GIN index
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks' AND indexdef LIKE '%GIN%';
-- Expected: idx_tasks_tags

-- TC-P1-13-2: Verify index usage
EXPLAIN ANALYZE SELECT * FROM tasks WHERE tags @> '["work"]';
-- Expected: Shows "Bitmap Index Scan on idx_tasks_tags"
```

---

#### P1-14: Add full-text search index
- **Priority:** P1
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-11

**Description:**
Add full-text search GIN index on title and description for efficient text search.

**Acceptance Criteria:**
- [ ] GIN index created for full-text search
- [ ] Search query uses index

**Test Cases:**
```sql
-- TC-P1-14-1: Verify FTS index
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks' AND indexdef LIKE '%tsvector%';
-- Expected: idx_tasks_fulltext

-- TC-P1-14-2: Test search
EXPLAIN ANALYZE SELECT * FROM tasks
WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ to_tsquery('quarterly');
-- Expected: Uses idx_tasks_fulltext
```

**Migration Addition:**
```python
op.execute("""
    CREATE INDEX idx_tasks_fulltext ON tasks
    USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')))
""")
```

---

#### P1-15: Test migration on Neon staging branch
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-12, P1-13, P1-14

**Description:**
Create a Neon branch and test the migration before applying to main.

**Acceptance Criteria:**
- [ ] Neon staging branch created
- [ ] Migration applies successfully
- [ ] Existing data preserved
- [ ] New columns have correct defaults

**Test Cases:**
```bash
# TC-P1-15-1: Apply migration to staging
DATABASE_URL=$NEON_STAGING_URL alembic upgrade head
# Expected: Migration succeeds

# TC-P1-15-2: Verify existing data
psql $NEON_STAGING_URL -c "SELECT id, title, priority, tags FROM tasks LIMIT 5"
# Expected: Existing tasks have priority='medium', tags='[]'
```

---

#### P1-16: Apply migration to Neon main branch
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-15

**Description:**
Apply the tested migration to the production Neon database.

**Acceptance Criteria:**
- [ ] Migration applied to main branch
- [ ] No data loss
- [ ] Application still functional

**Test Cases:**
```bash
# TC-P1-16-1: Apply migration
DATABASE_URL=$NEON_MAIN_URL alembic upgrade head
# Expected: Migration succeeds

# TC-P1-16-2: Verify application
curl https://api.todo-app.com/api/tasks
# Expected: 200 OK with tasks
```

---

### 1.4 Helm Chart Updates

#### P1-17: Add Dapr annotations to backend deployment
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-02

**Description:**
Add Dapr sidecar injection annotations to the backend deployment.

**Acceptance Criteria:**
- [ ] Dapr annotations added to deployment template
- [ ] Sidecar injected after deployment
- [ ] App ID is `task-api`

**Test Cases:**
```bash
# TC-P1-17-1: Verify annotations
kubectl get deploy task-api -n todo-app -o jsonpath='{.spec.template.metadata.annotations}'
# Expected: Contains dapr.io/enabled: "true"

# TC-P1-17-2: Verify sidecar
kubectl get pods -l app=task-api -n todo-app -o jsonpath='{.items[0].spec.containers[*].name}'
# Expected: task-api daprd
```

**Deliverable:**
```yaml
# charts/todo-app/templates/backend/deployment.yaml (additions to pod template)
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "task-api"
  dapr.io/app-port: "8000"
  dapr.io/config: "todo-app-config"
  dapr.io/log-level: "info"
  dapr.io/enable-api-logging: "true"
```

---

#### P1-18: Add Dapr annotations to frontend deployment
- **Priority:** P1
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-02

**Description:**
Add Dapr sidecar injection annotations to the frontend deployment (optional, for service invocation).

**Acceptance Criteria:**
- [ ] Dapr annotations added (configurable via values)
- [ ] Sidecar injected when enabled
- [ ] App ID is `frontend`

**Test Cases:**
```bash
# TC-P1-18-1: Verify annotations (when enabled)
kubectl get deploy frontend -n todo-app -o jsonpath='{.spec.template.metadata.annotations}'
# Expected: Contains dapr.io/enabled based on values
```

---

#### P1-19: Create values-phase5.yaml for new config
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-17

**Description:**
Create a new values file with Phase 5 specific configuration.

**Acceptance Criteria:**
- [ ] File created at `charts/todo-app/values-phase5.yaml`
- [ ] Includes Dapr, Redis, Kafka configuration
- [ ] Can be used with `helm install -f values-phase5.yaml`

**Deliverable:**
```yaml
# charts/todo-app/values-phase5.yaml
global:
  phase: "v"

redis:
  enabled: true

dapr:
  enabled: true
  config:
    name: todo-app-config

kafka:
  enabled: true
  bootstrapServers: "todo-kafka-kafka-bootstrap.kafka.svc.cluster.local:9092"
```

---

#### P1-20: Update Chart.yaml version to 2.0.0
- **Priority:** P0
- **Effort:** 0.5h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Update the Helm chart version to 2.0.0 for Phase V.

**Acceptance Criteria:**
- [ ] Chart.yaml version updated to 2.0.0
- [ ] appVersion updated appropriately

**Test Cases:**
```bash
# TC-P1-20-1: Verify version
helm show chart ./charts/todo-app | grep version
# Expected: version: 2.0.0
```

---

#### P1-21: Add Dapr components to templates
- **Priority:** P0
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P1-03, P1-04

**Description:**
Add Dapr component definitions as Helm templates for deployment.

**Acceptance Criteria:**
- [ ] Components defined in `templates/dapr/` directory
- [ ] Conditional deployment based on values
- [ ] All components deploy successfully

**Test Cases:**
```bash
# TC-P1-21-1: Verify components deployed
kubectl get components -n todo-app
# Expected: secrets-kubernetes, statestore-redis listed
```

**Deliverables:**
```
charts/todo-app/templates/dapr/
├── secrets-kubernetes.yaml
├── statestore-redis.yaml
└── config.yaml
```

---

### Phase 1 Completion Checklist

- [ ] All P0 tasks completed (17 tasks)
- [ ] All P1 tasks completed (4 tasks)
- [ ] Dapr control plane healthy
- [ ] Redis running and accessible
- [ ] Database migration applied
- [ ] Helm chart updated and deployable
- [ ] Phase 1 verification checks pass

---

## Phase 2: Event-Driven Core

**Duration:** Week 3-4
**Goal:** Deploy Kafka and implement event publishing
**Blockers:** Phase 1 must be complete

### 2.1 Kafka Deployment (Strimzi)

#### P2-01: Install Strimzi operator in kafka namespace
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** Phase 1 complete

**Description:**
Install the Strimzi Kafka operator to manage Kafka clusters on Kubernetes.

**Acceptance Criteria:**
- [ ] `kafka` namespace created
- [ ] Strimzi operator pod running
- [ ] CRDs installed (Kafka, KafkaTopic, etc.)

**Test Cases:**
```bash
# TC-P2-01-1: Verify namespace
kubectl get namespace kafka
# Expected: kafka namespace exists

# TC-P2-01-2: Verify operator
kubectl get pods -n kafka -l name=strimzi-cluster-operator
# Expected: 1 pod Running

# TC-P2-01-3: Verify CRDs
kubectl get crd | grep kafka
# Expected: kafkas.kafka.strimzi.io, kafkatopics.kafka.strimzi.io, etc.
```

**Commands:**
```bash
kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s
```

---

#### P2-02: Create Kafka cluster manifest (3 brokers)
- **Priority:** P0
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-01

**Description:**
Create and deploy a Kafka cluster with appropriate configuration for development.

**Acceptance Criteria:**
- [ ] Kafka cluster manifest created at `k8s/kafka/kafka-cluster.yaml`
- [ ] Cluster deployed with 1 broker (dev) / 3 brokers (prod)
- [ ] Cluster reaches Ready state

**Test Cases:**
```bash
# TC-P2-02-1: Verify cluster
kubectl get kafka -n kafka
# Expected: todo-kafka with Ready condition

# TC-P2-02-2: Verify broker pods
kubectl get pods -n kafka -l strimzi.io/kind=Kafka
# Expected: 1-3 broker pods Running

# TC-P2-02-3: Verify bootstrap service
kubectl get svc todo-kafka-kafka-bootstrap -n kafka
# Expected: Service exists with port 9092
```

**Deliverable:**
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
    replicas: 1  # Use 3 for production
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
    storage:
      type: ephemeral  # Use persistent-claim for production
    config:
      offsets.topic.replication.factor: 1
      transaction.state.log.replication.factor: 1
      transaction.state.log.min.isr: 1
      default.replication.factor: 1
      min.insync.replicas: 1
  zookeeper:
    replicas: 1
    storage:
      type: ephemeral
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

---

#### P2-03: Create Kafka topics via KafkaTopic CRDs
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-02

**Description:**
Create all required Kafka topics using Strimzi KafkaTopic CRDs.

**Acceptance Criteria:**
- [ ] 6 topics created: task-events, reminder-events, notification-events, audit-events, chat-events, dlq-events
- [ ] Correct partition counts and retention settings
- [ ] Topics visible in Kafka

**Test Cases:**
```bash
# TC-P2-03-1: Verify topics
kubectl get kafkatopics -n kafka
# Expected: 6 topics listed

# TC-P2-03-2: Verify topic details
kubectl get kafkatopic task-events -n kafka -o yaml
# Expected: partitions: 6, config.retention.ms: 604800000
```

**Deliverable:**
```yaml
# k8s/kafka/kafka-topics.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: task-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 6
  replicas: 1
  config:
    retention.ms: 604800000  # 7 days
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: reminder-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 86400000  # 1 day
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: notification-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 86400000
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: audit-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 6
  replicas: 1
  config:
    retention.ms: 2592000000  # 30 days
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: chat-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 604800000
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: dlq-events
  namespace: kafka
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 1209600000  # 14 days
```

---

#### P2-04: Deploy Kafka UI for debugging
- **Priority:** P1
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-02

**Description:**
Deploy Kafka UI for visual debugging and monitoring of Kafka topics and messages.

**Acceptance Criteria:**
- [ ] Kafka UI deployed in `kafka` namespace
- [ ] UI accessible via port-forward
- [ ] Shows all topics and messages

**Test Cases:**
```bash
# TC-P2-04-1: Verify deployment
kubectl get deploy kafka-ui -n kafka
# Expected: kafka-ui deployment exists

# TC-P2-04-2: Access UI
kubectl port-forward svc/kafka-ui 8080:8080 -n kafka
# Open http://localhost:8080
# Expected: Shows todo-kafka cluster with 6 topics
```

---

#### P2-05: Create Dapr pubsub-kafka component
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-02

**Description:**
Create a Dapr pub/sub component that connects to the Kafka cluster.

**Acceptance Criteria:**
- [ ] Component YAML created at `k8s/dapr/components/pubsub-kafka.yaml`
- [ ] Component deployed and initialized
- [ ] Scoped to appropriate services

**Test Cases:**
```bash
# TC-P2-05-1: Verify component
kubectl get component pubsub-kafka -n todo-app
# Expected: Component exists

# TC-P2-05-2: Verify in Dapr
dapr components -k -n todo-app | grep pubsub
# Expected: pubsub-kafka listed
```

**Deliverable:**
```yaml
# k8s/dapr/components/pubsub-kafka.yaml
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
      value: "todo-kafka-kafka-bootstrap.kafka.svc.cluster.local:9092"
    - name: consumerGroup
      value: "todo-app-group"
    - name: authType
      value: "none"
    - name: maxMessageBytes
      value: "1048576"
scopes:
  - task-api
  - chat-api
  - recurring-task-service
  - notification-service
  - audit-service
```

---

#### P2-06: Test publish/subscribe flow
- **Priority:** P0
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-05

**Description:**
End-to-end test of Dapr pub/sub with Kafka.

**Acceptance Criteria:**
- [ ] Can publish message to topic via Dapr
- [ ] Message visible in Kafka UI
- [ ] Can consume message via subscription

**Test Cases:**
```bash
# TC-P2-06-1: Publish test message
kubectl exec -it deploy/task-api -n todo-app -- \
  curl -X POST http://localhost:3500/v1.0/publish/pubsub-kafka/task-events \
  -H "Content-Type: application/json" \
  -d '{"specversion":"1.0","type":"test","source":"test","data":{"test":true}}'
# Expected: 204 No Content

# TC-P2-06-2: Verify in Kafka UI
# Open Kafka UI, navigate to task-events topic
# Expected: Test message visible
```

---

### 2.2 CloudEvents Schema Implementation

#### P2-07: Create CloudEvents base schema
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** None

**Description:**
Create the base CloudEvents envelope schema using Pydantic.

**Acceptance Criteria:**
- [ ] `backend/src/events/__init__.py` created
- [ ] `backend/src/events/base.py` with CloudEvent class
- [ ] CloudEvents v1.0 compliant

**Test Cases:**
```python
# TC-P2-07-1: Verify schema
from src.events.base import CloudEvent
event = CloudEvent(type="test", source="/test", data={"key": "value"})
assert event.specversion == "1.0"
assert event.id.startswith("evt-")
```

**Deliverable:**
```python
# backend/src/events/base.py
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Any, Generic, TypeVar

T = TypeVar('T')

class CloudEvent(BaseModel, Generic[T]):
    """CloudEvents v1.0 compliant event envelope."""
    specversion: str = "1.0"
    type: str
    source: str
    id: str = Field(default_factory=lambda: f"evt-{uuid4()}")
    time: datetime = Field(default_factory=datetime.utcnow)
    datacontenttype: str = "application/json"
    data: T
```

---

#### P2-08 to P2-13: Create event schemas
- **Priority:** P0
- **Effort:** 0.5h each (3h total)
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-07

**Tasks:**
- P2-08: TaskCreated event schema
- P2-09: TaskUpdated event schema
- P2-10: TaskCompleted event schema
- P2-11: TaskDeleted event schema
- P2-12: ReminderScheduled event schema
- P2-13: ReminderTriggered event schema

**Deliverables:**
```
backend/src/events/
├── __init__.py
├── base.py
├── task_events.py
└── reminder_events.py
```

---

### 2.3 Event Publisher Service

#### P2-14: Create EventPublisher class with Dapr client
- **Priority:** P0
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-05, P2-07

**Description:**
Create the EventPublisher class that wraps Dapr pub/sub operations.

**Acceptance Criteria:**
- [ ] `backend/src/events/publisher.py` created
- [ ] Async publish method
- [ ] Partition key support for ordering

**Deliverable:**
```python
# backend/src/events/publisher.py
from dapr.clients import DaprClient
from dapr.clients.exceptions import DaprInternalError
from .base import CloudEvent
import json
import logging

logger = logging.getLogger(__name__)

class EventPublisher:
    def __init__(self, pubsub_name: str = "pubsub-kafka"):
        self.pubsub_name = pubsub_name

    async def publish(self, topic: str, event: CloudEvent, partition_key: str = None) -> bool:
        """Publish a CloudEvent to a Kafka topic via Dapr."""
        try:
            async with DaprClient() as client:
                metadata = {}
                if partition_key:
                    metadata["partitionKey"] = partition_key

                await client.publish_event(
                    pubsub_name=self.pubsub_name,
                    topic_name=topic,
                    data=event.model_dump_json(),
                    data_content_type="application/json",
                    publish_metadata=metadata
                )
                logger.info(f"Published {event.type} to {topic}: {event.id}")
                return True
        except DaprInternalError as e:
            logger.error(f"Failed to publish {event.type}: {e}")
            raise
```

---

#### P2-15: Implement circuit breaker pattern
- **Priority:** P1
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-14

**Description:**
Add circuit breaker pattern to EventPublisher for resilience.

**Deliverable:** `backend/src/events/resilience.py`

---

#### P2-16: Implement local queue fallback
- **Priority:** P1
- **Effort:** 2h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-15

**Description:**
Add local Redis queue fallback when Kafka is unavailable.

---

#### P2-17 to P2-20: Add publish calls to TaskService
- **Priority:** P0
- **Effort:** 1h each (4h total)
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-14

**Tasks:**
- P2-17: Add publish to create_task
- P2-18: Add publish to update_task
- P2-19: Add publish to delete_task
- P2-20: Add publish on task completion

---

### 2.4 Dapr Subscription Configuration

#### P2-21: Create subscription config for task-events
- **Priority:** P0
- **Effort:** 1h
- **Assignee:** _unassigned_
- **Status:** `[ ]`
- **Dependencies:** P2-05

**Deliverable:**
```yaml
# k8s/dapr/subscriptions/task-events.yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-events-subscription
  namespace: todo-app
spec:
  topic: task-events
  routes:
    default: /subscribe/task-events
  pubsubname: pubsub-kafka
scopes:
  - audit-service
  - recurring-task-service
```

---

#### P2-22: Create test consumer endpoint in Task API
- **Priority:** P0
- **Effort:** 1h

---

#### P2-23: Verify event delivery end-to-end
- **Priority:** P0
- **Effort:** 1h

---

### Phase 2 Completion Checklist

- [ ] All P0 tasks completed (19 tasks)
- [ ] All P1 tasks completed (4 tasks)
- [ ] Kafka cluster healthy
- [ ] All 6 topics created
- [ ] Dapr pubsub component working
- [ ] Events publishing on task operations
- [ ] Phase 2 verification checks pass

---

## Phase 3: Microservices Decomposition

**Duration:** Week 5-6
**Goal:** Extract and deploy independent microservices
**Blockers:** Phase 2 must be complete

_[Abbreviated for length - Full task details follow same pattern as Phase 1 & 2]_

### 3.1 Recurring Task Service (P3-01 to P3-09)
### 3.2 Notification Service (P3-10 to P3-17)
### 3.3 Audit Service (P3-18 to P3-25)
### 3.4 Service Helm Templates (P3-26 to P3-30)

---

## Phase 4: Advanced Features

**Duration:** Week 7-8
**Goal:** Implement user-facing features
**Blockers:** Phase 3 must be complete

### 4.1 WebSocket Real-Time Sync (P4-01 to P4-07)
### 4.2 Search, Filter & Sort API (P4-08 to P4-17)
### 4.3 Reminder Scheduling Integration (P4-18 to P4-22)
### 4.4 RRULE UI Integration (P4-23 to P4-26)

---

## Phase 5: Production Readiness

**Duration:** Week 9-10
**Goal:** Prepare system for production deployment
**Blockers:** Phase 4 must be complete

### 5.1 CI/CD Pipeline (P5-01 to P5-08)
### 5.2 Observability Stack (P5-09 to P5-16)
### 5.3 Security Hardening (P5-17 to P5-24)
### 5.4 Production Values & Documentation (P5-25 to P5-30)

---

## Appendix A: Task ID Quick Reference

| ID Range | Phase | Category |
|----------|-------|----------|
| P1-01 to P1-05 | Phase 1 | Dapr Installation |
| P1-06 to P1-10 | Phase 1 | Redis Deployment |
| P1-11 to P1-16 | Phase 1 | Database Migration |
| P1-17 to P1-21 | Phase 1 | Helm Chart Updates |
| P2-01 to P2-06 | Phase 2 | Kafka Deployment |
| P2-07 to P2-13 | Phase 2 | CloudEvents Schemas |
| P2-14 to P2-20 | Phase 2 | Event Publisher |
| P2-21 to P2-23 | Phase 2 | Subscriptions |
| P3-01 to P3-09 | Phase 3 | Recurring Task Service |
| P3-10 to P3-17 | Phase 3 | Notification Service |
| P3-18 to P3-25 | Phase 3 | Audit Service |
| P3-26 to P3-30 | Phase 3 | Helm Templates |
| P4-01 to P4-07 | Phase 4 | WebSocket |
| P4-08 to P4-17 | Phase 4 | Search/Filter/Sort |
| P4-18 to P4-22 | Phase 4 | Reminders |
| P4-23 to P4-26 | Phase 4 | RRULE UI |
| P5-01 to P5-08 | Phase 5 | CI/CD |
| P5-09 to P5-16 | Phase 5 | Observability |
| P5-17 to P5-24 | Phase 5 | Security |
| P5-25 to P5-30 | Phase 5 | Documentation |

---

## Appendix B: Dependency Graph

```
P1-01 → P1-02 → P1-03 → P1-04
                    ↓
P1-06 → P1-07 → P1-08 → P1-09 → P1-10
                    ↓
P1-11 → P1-12 → P1-13 → P1-14 → P1-15 → P1-16
                    ↓
P1-17 → P1-18 → P1-19 → P1-20 → P1-21
                    ↓
═══════════════════════════════════════════
                    ↓
P2-01 → P2-02 → P2-03 → P2-04
           ↓
        P2-05 → P2-06
           ↓
P2-07 → P2-08...P2-13
           ↓
P2-14 → P2-15 → P2-16
   ↓
P2-17...P2-20 → P2-21 → P2-22 → P2-23
                    ↓
═══════════════════════════════════════════
                    ↓
        [Phase 3: P3-01...P3-30]
                    ↓
        [Phase 4: P4-01...P4-26]
                    ↓
        [Phase 5: P5-01...P5-30]
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-03 | System Architect | Initial task breakdown |
