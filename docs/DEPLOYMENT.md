# AMDOX ERP – Deployment Guide

**Status**: Production-Ready Framework  
**Last Updated**: June 7, 2026

---

## 1. Deployment Architecture

### Local Development
- **Docker Compose** with PostgreSQL, Redis, Keycloak, App, AI Service
- **Single machine** setup for development/testing
- All services on private network

### Staging Environment
- **AWS EKS** cluster (Elastic Kubernetes Service)
- **Multi-node** setup with auto-scaling
- **RDS PostgreSQL** managed database
- **ElastiCache Redis** for caching
- **Keycloak** on separate pods
- **Monitoring**: Prometheus + Grafana

### Production Environment
- **AWS EKS** cluster (multi-AZ)
- **High availability** setup with redundancy
- **RDS PostgreSQL** with multi-AZ failover
- **Route 53** for DNS and failover
- **CloudFront** CDN for static assets
- **S3** for document/file storage
- **CloudWatch** for logging and monitoring
- **SNS/SQS** for async processing

---

## 2. Local Deployment

### Using Docker Compose

```bash
# Start all services
npm run docker:up

# Wait for services to initialize (2-3 minutes)
sleep 120

# Initialize database
npm run db:push
npm run db:seed

# View services
docker-compose ps

# Verify services are healthy
curl http://localhost:3000        # App
curl http://localhost:5432        # PostgreSQL
curl http://localhost:6379        # Redis
curl http://localhost:8080/auth   # Keycloak
curl http://localhost:8000        # AI Service
```

**Services Started**:
- **App**: http://localhost:3000
- **Keycloak**: http://localhost:8080/auth (admin/admin_password_2024)
- **pgAdmin**: http://localhost:5050 (admin@amdox.local/admin_password_2024)
- **AI Service**: http://localhost:8000

### Stopping Services

```bash
# Stop all services
npm run docker:down

# Stop and remove volumes
docker-compose down -v
```

---

## 3. AWS EKS Deployment

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** v2.12+
3. **kubectl** v1.27+
4. **Helm** v3.12+
5. **Docker** for building images
6. **Terraform** v1.6+ (for IaC)

### Step 1: Setup AWS Infrastructure

#### Option A: Using Terraform (Recommended)

```bash
# Navigate to infrastructure folder
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="production.tfvars"

# Apply configuration
terraform apply -var-file="production.tfvars"
```

#### Option B: Manual AWS Setup

```bash
# Create EKS cluster
aws eks create-cluster \
  --name amdox-prod \
  --version 1.28 \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/eks-service-role \
  --resources-vpc-config subnetIds=subnet-xxx,subnet-yyy

# Create node group
aws eks create-nodegroup \
  --cluster-name amdox-prod \
  --nodegroup-name amdox-nodes \
  --node-role arn:aws:iam::ACCOUNT_ID:role/eks-node-role \
  --subnets subnet-xxx subnet-yyy

# Configure kubectl
aws eks update-kubeconfig \
  --name amdox-prod \
  --region us-east-1
```

### Step 2: Create RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier amdox-postgres-prod \
  --db-instance-class db.r6g.large \
  --engine postgres \
  --engine-version 15.3 \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 30 \
  --master-username amdox_admin \
  --master-user-password "$(openssl rand -base64 32)"

# Wait for DB to be ready (5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier amdox-postgres-prod
```

### Step 3: Setup ECR Docker Registry

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name amdox-erp

# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push Docker image
docker build -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/amdox-erp:latest .

docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/amdox-erp:latest
```

### Step 4: Deploy with Helm

```bash
# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create namespace
kubectl create namespace amdox

# Install Keycloak
helm install keycloak bitnami/keycloak \
  --namespace amdox \
  --values infrastructure/helm/keycloak-values.yaml

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace amdox \
  --values infrastructure/helm/prometheus-values.yaml

# Deploy AMDOX App
helm install amdox-app infrastructure/helm/amdox-chart \
  --namespace amdox \
  --values infrastructure/helm/values-prod.yaml
```

### Step 5: Configure Database

```bash
# Port-forward to RDS (from bastion or pod)
kubectl port-forward -n amdox svc/amdox-app 5432:5432

# Initialize database
DATABASE_URL="postgresql://amdox_admin:password@RDS_ENDPOINT:5432/amdox_erp" \
  npm run db:migrate:prod

DATABASE_URL="postgresql://amdox_admin:password@RDS_ENDPOINT:5432/amdox_erp" \
  npm run db:seed
```

### Step 6: Setup DNS & SSL

```bash
# Create Route 53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "amdox.local",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z123...",
          "DNSName": "k8s-amdox-svc-xxx.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# Install Let's Encrypt cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

---

## 4. Kubernetes Configuration

### Deployment YAML

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amdox-app
  namespace: amdox
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amdox-app
  template:
    metadata:
      labels:
        app: amdox-app
    spec:
      containers:
      - name: amdox-app
        image: ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/amdox-erp:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: amdox-secrets
              key: database-url
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
```

### Service YAML

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: amdox-app
  namespace: amdox
spec:
  type: LoadBalancer
  selector:
    app: amdox-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  sessionAffinity: ClientIP
```

### Ingress YAML

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: amdox-ingress
  namespace: amdox
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - amdox.local
    secretName: amdox-tls
  rules:
  - host: amdox.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: amdox-app
            port:
              number: 80
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

See [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) for complete pipeline.

**Stages**:
1. **Lint & Format** – ESLint, Prettier
2. **Type Check** – TypeScript
3. **Unit Tests** – Vitest with coverage
4. **Build** – Next.js build
5. **Docker Build** – Build and push image to ECR
6. **E2E Tests** – Playwright on staging
7. **Deploy to Staging** – On `develop` branch
8. **Deploy to Production** – On `main` branch (manual approval)

### Deployment Secrets

Configure GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ECR_REGISTRY`
- `KUBECONFIG`
- `SLACK_WEBHOOK` (for notifications)

---

## 6. Monitoring & Logging

### Prometheus Metrics

```yaml
# infrastructure/helm/prometheus-values.yaml
prometheus:
  prometheusSpec:
    retention: 15d
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
    serviceMonitorSelector: {}
```

### Grafana Dashboards

Import pre-built dashboards:
- Node Exporter Full
- Kubernetes cluster Monitoring
- AMDOX Custom Dashboard (stores in `infrastructure/grafana/`)

```bash
# Access Grafana
kubectl port-forward -n amdox svc/prometheus-grafana 3000:80
# URL: http://localhost:3000 (admin/prom-operator)
```

### CloudWatch Logging

```bash
# View application logs
kubectl logs -n amdox deployment/amdox-app

# Stream logs live
kubectl logs -n amdox deployment/amdox-app -f

# View previous pod logs
kubectl logs -n amdox pod-name --previous
```

---

## 7. Backup & Disaster Recovery

### Automated Backups

```bash
# Enable RDS automated backups (via Terraform)
# Backup retention: 30 days
# Backup window: 03:00-04:00 UTC
# Multi-AZ: Enabled for automatic failover
```

### Point-in-Time Recovery

```bash
# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier amdox-postgres-restored \
  --db-snapshot-identifier amdox-postgres-backup-2026-06-07-030000 \
  --db-instance-class db.r6g.large

# Update connection string and redeploy
```

### Disaster Recovery Procedure

1. **Alert triggered** if primary RDS unavailable
2. **Automatic failover** to multi-AZ standby (1-2 minutes)
3. **Health checks** verify cluster is responsive
4. **Optional manual steps**:
   ```bash
   # Force failover for testing
   aws rds failover-db-cluster \
     --db-cluster-identifier amdox-postgres-prod
   ```

---

## 8. Scaling

### Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: amdox-app-hpa
  namespace: amdox
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: amdox-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Apply HPA:
```bash
kubectl apply -f k8s/hpa.yaml
```

### Database Scaling

```bash
# Scale RDS instance class
aws rds modify-db-instance \
  --db-instance-identifier amdox-postgres-prod \
  --db-instance-class db.r6g.xlarge \
  --apply-immediately
```

---

## 9. Performance Tuning

### PostgreSQL Configuration

```sql
-- Connection pooling with PgBouncer
-- Max connections: 200
-- Pool mode: transaction

-- Key settings:
shared_buffers = 256MB      -- 25% of RAM
effective_cache_size = 1GB  -- 50% of RAM
work_mem = 10MB
```

### Redis Optimization

```bash
# Configure Redis for caching
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1      -- 900s if 1+ keys changed
save 300 10
save 60 10000
```

---

## 10. Troubleshooting

### Common Issues

#### App not starting
```bash
# Check pod status
kubectl get pods -n amdox

# View pod events
kubectl describe pod POD_NAME -n amdox

# Check logs
kubectl logs POD_NAME -n amdox
```

#### Database connection issues
```bash
# Test RDS connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -n amdox -- \
  psql -h RDS_ENDPOINT -U amdox_admin -d amdox_erp -c "SELECT 1"
```

#### Out of memory
```bash
# Check resource usage
kubectl top pods -n amdox

# Increase memory limits in deployment.yaml
resources:
  limits:
    memory: 4Gi
```

---

## 11. Security Checklist

- [ ] Use TLS 1.3 for all communication
- [ ] Enable pod security policies
- [ ] Use encrypted secrets (AWS Secrets Manager)
- [ ] Enable network policies
- [ ] Enable pod autoscaling
- [ ] Configure resource quotas
- [ ] Enable audit logging
- [ ] Setup RBAC permissions
- [ ] Regular security scanning (Trivy)
- [ ] SSL certificate renewal automation

---

## 12. Health Checks

```bash
# App health
curl https://amdox.local/api/health

# Database
kubectl exec -it POD_NAME -n amdox -- \
  psql $DATABASE_URL -c "SELECT 1"

# Redis
kubectl exec -it POD_NAME -n amdox -- \
  redis-cli ping

# Keycloak
curl https://keycloak.amdox.local/auth/health/live
```

---

## Appendix: Useful Commands

```bash
# Kubernetes
kubectl get nodes                           # List nodes
kubectl get pods -n amdox                  # List pods
kubectl describe node NODE_NAME             # Node details
kubectl logs POD_NAME -n amdox -f          # Stream logs

# Database
npm run db:migrate:prod                     # Apply migrations
npm run db:seed                             # Seed data

# AWS
aws eks list-clusters                       # List EKS clusters
aws rds describe-db-instances               # List RDS instances
aws ec2 describe-security-groups            # List security groups

# Helm
helm list -n amdox                          # List releases
helm upgrade RELEASE CHART -n amdox         # Upgrade release
helm rollback RELEASE -n amdox              # Rollback release
```
