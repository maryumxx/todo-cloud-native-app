# Cloud Deployment Guide for Todo App

This guide provides instructions for deploying the Todo App to a cloud Kubernetes service (AWS EKS, Google GKE, or Azure AKS).

## Prerequisites

Before deploying to the cloud, ensure you have:

1. **Cloud Account**: Active account with AWS, GCP, or Azure
2. **Kubernetes Cluster**: Managed cluster (EKS, GKE, or AKS) created
3. **CLI Tools**:
   - `kubectl`
   - `helm`
   - Cloud CLI (aws, gcloud, or az)
   - `docker`
4. **Container Registry**: Docker Hub account or cloud container registry
5. **Domain**: Optional, for custom domain access

## Deployment Steps

### 1. Prepare Your Environment

First, configure kubectl to connect to your cloud Kubernetes cluster:

**For AWS EKS:**
```bash
aws eks update-kubeconfig --region <region> --name <cluster-name>
```

**For Google GKE:**
```bash
gcloud container clusters get-credentials <cluster-name> --zone <zone> --project <project-id>
```

**For Azure AKS:**
```bash
az aks get-credentials --resource-group <resource-group> --name <cluster-name>
```

### 2. Build and Push Docker Images

You need to build and push Docker images to a container registry accessible from your cloud cluster:

```bash
# Build frontend image
docker build -t <your-registry>/todo-frontend:2.0.0-cloud ./frontend
docker push <your-registry>/todo-frontend:2.0.0-cloud

# Build backend image
docker build -t <your-registry>/todo-backend:2.0.0-cloud ./backend
docker push <your-registry>/todo-backend:2.0.0-cloud

# Build recurring task service image
docker build -t <your-registry>/todo-recurring-task:2.0.0-cloud ./services/recurring-task
docker push <your-registry>/todo-recurring-task:2.0.0-cloud

# Build reminder service image
docker build -t <your-registry>/todo-reminder-service:2.0.0-cloud ./services/reminder-service
docker push <your-registry>/todo-reminder-service:2.0.0-cloud
```

### 3. Update Values File

Update the `charts/todo-app/values-cloud.yaml` file with your container registry:

```yaml
frontend:
  image:
    repository: <your-registry>/todo-frontend
    tag: "2.0.0-cloud"

backend:
  image:
    repository: <your-registry>/todo-backend
    tag: "2.0.0-cloud"

recurringTask:
  image:
    repository: <your-registry>/todo-recurring-task
    tag: "2.0.0-cloud"

reminderService:
  image:
    repository: <your-registry>/todo-reminder-service
    tag: "2.0.0-cloud"
```

### 4. Deploy the Application

Run the deployment script:

```bash
chmod +x deploy-cloud.sh
./deploy-cloud.sh
```

Alternatively, you can deploy manually:

```bash
# Create namespace
kubectl create namespace todo-app

# Install Dapr
helm repo add dapr https://dapr.github.io/helm-charts
helm repo update
helm upgrade --install dapr dapr/dapr --namespace dapr-system --create-namespace --wait

# Install Strimzi Kafka Operator
kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s

# Deploy Kafka cluster
kubectl apply -f k8s/kafka/kafka-cluster.yaml
kubectl wait --for=condition=Ready kafka/todo-kafka -n kafka --timeout=600s

# Deploy Kafka topics
kubectl apply -f k8s/kafka/kafka-topics.yaml

# Install Redis
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm upgrade --install redis bitnami/redis --namespace todo-app [redis configuration options]

# Deploy the application
helm dependency update ./charts/todo-app
helm upgrade --install todo-app ./charts/todo-app --namespace todo-app --values ./charts/todo-app/values-cloud.yaml --create-namespace --wait
```

## Post-Deployment

### Access the Application

After deployment, get the external IP/URL:

```bash
kubectl get service -n todo-app -l app.kubernetes.io/name=todo-frontend
```

The LoadBalancer service will provide an external IP or hostname that you can use to access the application.

### Monitoring and Management

Monitor your application with these commands:

```bash
# Check all pods
kubectl get pods -n todo-app

# Check all services
kubectl get services -n todo-app

# Check logs
kubectl logs -n todo-app -l app.kubernetes.io/name=todo-frontend

# Access Dapr dashboard
kubectl port-forward -n dapr-system svc/dapr-dashboard 8080:8080

# Access Grafana dashboard (if deployed)
kubectl port-forward -n todo-app svc/grafana 3000:3000

# Access Jaeger dashboard (if deployed)
kubectl port-forward -n todo-app svc/jaeger-query 16686:16686
```

## Configuration Options

### Environment Variables and Secrets

For production deployment, configure your secrets using Kubernetes secrets:

```bash
# Create database secrets
kubectl create secret generic backend-secrets \
  --from-literal=DATABASE_URL=<your-database-url> \
  --from-literal=SECRET_KEY=<your-secret-key> \
  --from-literal=OPENAI_API_KEY=<your-openai-key> \
  -n todo-app

# Create Redis secret
kubectl create secret generic redis-secret \
  --from-literal=redis-password=<your-redis-password> \
  -n todo-app
```

### Scaling

The application is configured with Horizontal Pod Autoscalers. Adjust the values in `values-cloud.yaml`:

```yaml
backend:
  autoscaling:
    enabled: true
    minReplicas: 3  # Adjust as needed
    maxReplicas: 15 # Adjust as needed
    targetCPUUtilizationPercentage: 60
```

## Troubleshooting

### Common Issues

1. **Images not pulling**: Verify your container registry and image tags in values file
2. **LoadBalancer stuck in pending**: Check cloud provider load balancer quotas
3. **Dapr sidecars not injecting**: Verify Dapr is installed and configured
4. **Kafka not ready**: Check if Strimzi operator is running and has proper permissions

### Useful Commands

```bash
# Describe pods for troubleshooting
kubectl describe pods -n todo-app

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Check Dapr sidecar injection
kubectl get pods -n todo-app -o yaml | grep dapr

# Check Kafka status
kubectl get kafka -n kafka
```

## Security Considerations

1. **Network Policies**: Already configured for service isolation
2. **Secrets Management**: Use cloud-specific secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)
3. **RBAC**: Ensure proper role-based access controls are in place
4. **TLS/SSL**: Configure TLS for production domains

## Scaling Recommendations

- **Frontend**: Scale based on request volume
- **Backend**: Scale based on CPU and memory usage
- **Kafka**: Adjust partitions and replicas based on event volume
- **Database**: Use managed database services with auto-scaling

## Cost Optimization

- Use spot/preemptible instances for non-critical workloads
- Configure proper resource requests and limits
- Use cluster autoscaling
- Monitor and optimize resource usage regularly