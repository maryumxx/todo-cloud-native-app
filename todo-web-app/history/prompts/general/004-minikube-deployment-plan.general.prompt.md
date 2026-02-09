---
id: 004
title: "Minikube Deployment Plan"
stage: general
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: phase-iv-infrastructure
branch: main
user: Maryam
command: direct-request
labels: ["minikube", "kubernetes", "helm", "deployment", "local-dev", "devops", "infrastructure"]
links:
  spec: specs/phase-iv-infrastructure/spec.md
  plan: specs/phase-iv-infrastructure/minikube-deployment-plan.md
  tasks: null
  adr: null
  pr: null
files:
  - specs/phase-iv-infrastructure/spec.md
  - specs/phase-iv-infrastructure/minikube-deployment-plan.md
  - charts/todo-app/values-minikube.yaml
  - charts/todo-app/templates/backend/deployment.yaml
  - charts/todo-app/templates/backend/secret.yaml
  - scripts/deploy-minikube.ps1
  - scripts/deploy-minikube.sh
tests: []
---

# Prompt History Record

## Prompt (Verbatim)

Phase IV Todo Chatbot Deployment – Claude Code Prompt:

I have already built Docker images for my Todo Chatbot frontend and backend:

- todo-frontend
- todo-backend

I want to deploy these on a **local Minikube cluster** using **Helm charts**, without writing manual YAML.

Please do the following:

1. Generate a **deployment plan** for both frontend and backend, including replicas, services, and port mappings.
2. Create **Helm charts** for frontend and backend with AI-assisted best practices.
3. Use **kubectl-ai** and **kagent** commands to deploy the apps on Minikube.
4. Suggest steps to verify the deployment is working and troubleshoot if pods fail.
5. Include optional **resource optimization** recommendations.
6. Provide **all CLI commands** that I can copy-paste for local deployment.
7. Ensure the deployment is **spec-driven**, repeatable, and suitable for AI-assisted DevOps.

Output the full specification, stepwise plan, and Helm chart templates.

## Response Summary

Created comprehensive Minikube deployment plan and updated Helm charts for local development:

### Deliverables Created

1. **Deployment Specification** (`specs/phase-iv-infrastructure/spec.md`)
   - Architecture overview with visual diagram
   - Component specifications for frontend and backend
   - Port mappings and resource configurations
   - Security context and acceptance criteria

2. **Minikube Deployment Plan** (`specs/phase-iv-infrastructure/minikube-deployment-plan.md`)
   - 12-step deployment workflow with copy-paste commands
   - Prerequisites checklist
   - Quick-start one-liner for full deployment
   - PowerShell and Bash command versions
   - kubectl-ai and kagent examples
   - Comprehensive troubleshooting guide
   - Resource optimization recommendations

3. **Minikube Values File** (`charts/todo-app/values-minikube.yaml`)
   - Optimized for local development (reduced resources)
   - Single replicas, HPA disabled
   - Debug mode enabled
   - Network policies disabled for simpler setup

4. **Deployment Scripts**
   - `scripts/deploy-minikube.ps1` - PowerShell script
   - `scripts/deploy-minikube.sh` - Bash script
   - Both support: deploy, status, logs, cleanup actions

5. **Helm Chart Updates**
   - Fixed readiness probe path to `/api/ready`
   - Made secretRef optional to prevent deployment failures
   - Added default values for secrets

### Key Configuration

| Service | Port | NodePort | Replicas |
|---------|------|----------|----------|
| Frontend | 3000 | 30080 | 1 |
| Backend | 8000 | ClusterIP | 1 |

### Quick Start Command (PowerShell)
```powershell
.\scripts\deploy-minikube.ps1 -Action deploy
```

## Outcome

- Complete spec-driven Minikube deployment solution
- Ready-to-use CLI commands for local Kubernetes deployment
- Optimized resource settings for development machines
- Comprehensive troubleshooting and verification steps
- AI-assisted deployment guidance with kubectl-ai examples

## Evaluation

- [x] Deployment plan generated with replicas, services, port mappings
- [x] Helm charts updated with Minikube-optimized values
- [x] kubectl-ai and kagent command examples included
- [x] Verification and troubleshooting steps documented
- [x] Resource optimization recommendations provided
- [x] Copy-paste CLI commands for all steps
- [x] Spec-driven, repeatable deployment workflow
