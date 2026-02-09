#!/bin/bash
# Cloud Deployment Script for Todo App

set -e  # Exit on any error

echo "🚀 Starting Cloud Deployment for Todo App..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it first."
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "❌ helm is not installed. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ docker is not installed. Please install it first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build and push Docker images to container registry
echo "🐳 Building and pushing Docker images..."

# Build frontend image
echo "📦 Building frontend image..."
docker build -t todo-frontend:2.0.0-cloud ./frontend
# Tag for your cloud registry (replace with your actual registry)
# docker tag todo-frontend:2.0.0-cloud YOUR_REGISTRY/todo-frontend:2.0.0-cloud
# docker push YOUR_REGISTRY/todo-frontend:2.0.0-cloud

# Build backend image
echo "📦 Building backend image..."
docker build -t todo-backend:2.0.0-cloud ./backend
# Tag for your cloud registry (replace with your actual registry)
# docker tag todo-backend:2.0.0-cloud YOUR_REGISTRY/todo-backend:2.0.0-cloud
# docker push YOUR_REGISTRY/todo-backend:2.0.0-cloud

# Build recurring task service image
echo "📦 Building recurring task service image..."
docker build -t todo-recurring-task:2.0.0-cloud ./services/recurring-task
# Tag for your cloud registry (replace with your actual registry)
# docker tag todo-recurring-task:2.0.0-cloud YOUR_REGISTRY/todo-recurring-task:2.0.0-cloud
# docker push YOUR_REGISTRY/todo-recurring-task:2.0.0-cloud

# Build reminder service image
echo "📦 Building reminder service image..."
docker build -t todo-reminder-service:2.0.0-cloud ./services/reminder-service
# Tag for your cloud registry (replace with your actual registry)
# docker tag todo-reminder-service:2.0.0-cloud YOUR_REGISTRY/todo-reminder-service:2.0.0-cloud
# docker push YOUR_REGISTRY/todo-reminder-service:2.0.0-cloud

echo "✅ Docker images built and pushed"

# Setup Kubernetes cluster connection
echo "🔗 Connecting to Kubernetes cluster..."
# This step depends on your cloud provider:
# For AWS EKS: aws eks update-kubeconfig --region <region> --name <cluster-name>
# For GCP GKE: gcloud container clusters get-credentials <cluster-name> --zone <zone> --project <project-id>
# For Azure AKS: az aks get-credentials --resource-group <resource-group> --name <cluster-name>

# Create namespace
echo "🌐 Creating namespace..."
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Install Dapr
echo "🎯 Installing Dapr..."
helm repo add dapr https://dapr.github.io/helm-charts
helm repo update
helm upgrade --install dapr dapr/dapr --namespace dapr-system --create-namespace --wait

# Install Strimzi Kafka Operator
echo "afka Installing Strimzi Kafka Operator..."
kubectl create namespace kafka --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka

# Wait for Strimzi operator to be ready
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s

# Deploy Kafka cluster
echo "afka Deploying Kafka cluster..."
kubectl apply -f ../k8s/kafka/kafka-cluster.yaml

# Wait for Kafka to be ready
kubectl wait --for=condition=Ready kafka/todo-kafka -n kafka --timeout=600s

# Deploy Kafka topics
kubectl apply -f ../k8s/kafka/kafka-topics.yaml

# Install Redis (using Bitnami chart)
echo ".Redis Installing Redis..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm upgrade --install redis bitnami/redis \
  --namespace todo-app \
  --set auth.enabled=true \
  --set auth.existingSecret=redis-secret \
  --set auth.existingSecretPasswordKey=redis-password \
  --set master.persistence.enabled=true \
  --set master.resources.requests.memory=256Mi \
  --set master.resources.requests.cpu=200m \
  --set master.resources.limits.memory=512Mi \
  --set master.resources.limits.cpu=500m \
  --set replica.replicaCount=2 \
  --set replica.resources.requests.memory=128Mi \
  --set replica.resources.requests.cpu=100m \
  --set replica.resources.limits.memory=256Mi \
  --set replica.resources.limits.cpu=250m

# Deploy the application using Helm
echo "🚢 Deploying application with Helm..."
helm dependency update ./charts/todo-app
helm upgrade --install todo-app ./charts/todo-app \
  --namespace todo-app \
  --values ./charts/todo-app/values-cloud.yaml \
  --create-namespace \
  --wait \
  --timeout 20m

# Verify deployment
echo "🔍 Verifying deployment..."
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get deployments -n todo-app

# Get external IP/URL
echo "🌐 Getting external access points..."
FRONTEND_SERVICE=$(kubectl get service -n todo-app -l app.kubernetes.io/name=todo-frontend -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
if [ -z "$FRONTEND_SERVICE" ]; then
    echo "⚠️  Frontend service is not yet available. It may take a few more minutes for the LoadBalancer to provision."
    echo "📝 Check the service status with: kubectl get service -n todo-app -l app.kubernetes.io/name=todo-frontend"
else
    echo "🎉 Frontend is available at: http://$FRONTEND_SERVICE"
fi

echo ""
echo "✅ Cloud deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check the LoadBalancer service to get the external IP: kubectl get service -n todo-app -l app.kubernetes.io/name=todo-frontend"
echo "2. Monitor the application: kubectl get pods -n todo-app"
echo "3. Check logs: kubectl logs -n todo-app -l app.kubernetes.io/name=todo-frontend"
echo "4. Access the Dapr dashboard: kubectl port-forward -n dapr-system svc/dapr-dashboard 8080:8080"
echo ""
echo "🔧 Troubleshooting:"
echo "- If services are not starting, check: kubectl describe pods -n todo-app"
echo "- If images are not pulling, verify your container registry and image tags in values-cloud.yaml"
echo "- Check Dapr sidecar injection: kubectl get pods -n todo-app -o yaml | grep dapr"