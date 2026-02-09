# Cloud Deployment Setup Guide

This document outlines the steps to deploy your Todo App to major cloud providers.

## Option 1: AWS EKS (Elastic Kubernetes Service)

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- eksctl installed
- kubectl installed

### Steps
1. **Create EKS Cluster**
   ```bash
   eksctl create cluster \
     --name todo-app-cluster \
     --version 1.28 \
     --region us-west-2 \
     --nodegroup-name standard-workers \
     --node-type t3.medium \
     --nodes 3 \
     --nodes-min 1 \
     --nodes-max 10 \
     --managed
   ```

2. **Configure kubectl**
   ```bash
   aws eks update-kubeconfig --region us-west-2 --name todo-app-cluster
   ```

3. **Continue with deployment steps in DEPLOYMENT_GUIDE.md**

## Option 2: Google Cloud GKE (Google Kubernetes Engine)

### Prerequisites
- Google Cloud Account with billing enabled
- gcloud CLI installed and authenticated (`gcloud auth login`)
- kubectl installed

### Steps
1. **Create GKE Cluster**
   ```bash
   gcloud container clusters create todo-app-cluster \
     --zone us-central1-a \
     --num-nodes 3 \
     --enable-autoscaling \
     --min-nodes 1 \
     --max-nodes 10 \
     --machine-type e2-standard-2
   ```

2. **Configure kubectl**
   ```bash
   gcloud container clusters get-credentials todo-app-cluster --zone us-central1-a
   ```

3. **Continue with deployment steps in DEPLOYMENT_GUIDE.md**

## Option 3: Microsoft Azure AKS (Azure Kubernetes Service)

### Prerequisites
- Azure Account with appropriate permissions
- Azure CLI installed and authenticated (`az login`)
- kubectl installed

### Steps
1. **Create Resource Group**
   ```bash
   az group create --name todo-app-rg --location eastus
   ```

2. **Create AKS Cluster**
   ```bash
   az aks create \
     --resource-group todo-app-rg \
     --name todo-app-cluster \
     --node-count 3 \
     --enable-auto-scaler \
     --min-count 1 \
     --max-count 10 \
     --generate-ssh-keys \
     --enable-managed-identity
   ```

3. **Configure kubectl**
   ```bash
   az aks get-credentials --resource-group todo-app-rg --name todo-app-cluster
   ```

4. **Continue with deployment steps in DEPLOYMENT_GUIDE.md**

## Option 4: DigitalOcean Kubernetes

### Prerequisites
- DigitalOcean Account
- doctl CLI installed and authenticated (`doctl auth init`)

### Steps
1. **Create Kubernetes Cluster**
   ```bash
   doctl kubernetes cluster create todo-app-cluster --region sfo3 --count 3 --size s-2vcpu-4gb
   ```

2. **Configure kubectl**
   ```bash
   doctl kubernetes cluster kubeconfig save todo-app-cluster
   ```

3. **Continue with deployment steps in DEPLOYMENT_GUIDE.md**

## Container Registry Setup

Regardless of which cloud provider you choose, you'll need to push your Docker images to a container registry:

### For AWS ECR:
```bash
# Create ECR repository
aws ecr create-repository --repository-name todo-frontend --region us-west-2
aws ecr create-repository --repository-name todo-backend --region us-west-2
aws ecr create-repository --repository-name todo-recurring-task --region us-west-2
aws ecr create-repository --repository-name todo-reminder-service --region us-west-2

# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-west-2.amazonaws.com

# Tag and push images
docker tag todo-frontend:2.0.0-cloud <account_id>.dkr.ecr.us-west-2.amazonaws.com/todo-frontend:2.0.0-cloud
docker push <account_id>.dkr.ecr.us-west-2.amazonaws.com/todo-frontend:2.0.0-cloud
# Repeat for other services
```

### For Google Container Registry (GCR):
```bash
# Tag and push images
docker tag todo-frontend:2.0.0-cloud gcr.io/<project-id>/todo-frontend:2.0.0-cloud
docker push gcr.io/<project-id>/todo-frontend:2.0.0-cloud
# Repeat for other services

# Configure cluster to pull from GCR
kubectl create secret docker-registry gcr-json-key \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat key.json)" \
  --docker-email=your-email@example.com
```

### For Azure Container Registry (ACR):
```bash
# Create ACR
az acr create --resource-group todo-app-rg --name <acr-name> --sku Basic

# Tag and push images
docker tag todo-frontend:2.0.0-cloud <acr-name>.azurecr.io/todo-frontend:2.0.0-cloud
docker push <acr-name>.azurecr.io/todo-frontend:2.0.0-cloud
# Repeat for other services

# Configure cluster to pull from ACR
az aks update -n todo-app-cluster -g todo-app-rg --attach-acr <acr-name>
```

## Important Notes

1. **Costs**: All cloud providers charge for compute, storage, and network usage. Monitor your usage to control costs.

2. **Security**: 
   - Use IAM roles and policies to restrict access
   - Enable encryption for data at rest and in transit
   - Regularly rotate secrets and credentials

3. **Monitoring**: Set up monitoring and alerting for your cluster and applications.

4. **Backup**: Implement backup strategies for your data.

5. **Scaling**: Configure appropriate auto-scaling policies based on your expected load.

## Next Steps

Once you've set up your cloud environment:

1. Follow the deployment steps in the DEPLOYMENT_GUIDE.md file
2. Update the values-cloud.yaml file with your container registry URLs
3. Deploy the application using the provided scripts
4. Monitor the deployment and troubleshoot any issues
5. Set up DNS and SSL certificates for production access