# CreatorX Infrastructure

This directory contains Terraform configurations for deploying CreatorX backend to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           AWS Cloud                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                         VPC                             │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐  │    │
│  │  │  Public Subnet  │  │      Private Subnet          │  │    │
│  │  │  ┌───────────┐  │  │  ┌─────────────────────────┐│  │    │
│  │  │  │    ALB    │──────→│  ECS Fargate Service    ││  │    │
│  │  │  └───────────┘  │  │  │  (CreatorX Backend)     ││  │    │
│  │  │                 │  │  └───────────┬─────────────┘│  │    │
│  │  │  ┌───────────┐  │  │              │              │  │    │
│  │  │  │NAT Gateway│  │  │  ┌───────────▼─────────────┐│  │    │
│  │  │  └───────────┘  │  │  │   RDS PostgreSQL        ││  │    │
│  │  └─────────────────┘  │  │   (Primary + Read Rep)  ││  │    │
│  │                       │  └─────────────────────────┘│  │    │
│  │                       └─────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ CloudWatch   │  │ S3 Bucket   │  │ Parameter Store  │     │
│  │ Logs/Metrics │  │ (Optional)  │  │ (Secrets)        │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
infra/terraform/
├── README.md           # This file
├── environments/
│   ├── dev/           # Development environment
│   │   └── main.tf
│   ├── staging/       # Staging environment
│   │   └── main.tf
│   └── prod/          # Production environment
│       └── main.tf
├── modules/
│   ├── vpc/           # VPC, subnets, NAT gateway
│   ├── rds/           # RDS PostgreSQL
│   ├── ecs/           # ECS Fargate cluster and service
│   ├── alb/           # Application Load Balancer
│   └── monitoring/    # CloudWatch dashboards and alarms
└── variables.tf       # Common variables
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.5.0
3. **Docker** for building container images

## Quick Start

### 1. Initialize Terraform

```bash
cd infra/terraform/environments/dev
terraform init
```

### 2. Set Required Variables

Create a `terraform.tfvars` file (not committed to git):

```hcl
# AWS Configuration
aws_region = "ap-south-1"

# Database
db_password = "your-secure-password"  # Use AWS Parameter Store in prod

# Application
app_version = "latest"
```

### 3. Plan and Apply

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

## Secrets Management

**IMPORTANT**: Never commit secrets to this repository.

### Recommended: AWS Parameter Store

Store secrets in AWS Systems Manager Parameter Store:

```bash
# Store database password
aws ssm put-parameter \
  --name "/creatorx/prod/db/password" \
  --value "your-secure-password" \
  --type SecureString

# Store SendGrid API key
aws ssm put-parameter \
  --name "/creatorx/prod/sendgrid-api-key" \
  --value "SG.xxxx" \
  --type SecureString

# Store JWT secret
aws ssm put-parameter \
  --name "/creatorx/prod/jwt-secret" \
  --value "your-jwt-secret" \
  --type SecureString
```

Reference in Terraform:
```hcl
data "aws_ssm_parameter" "db_password" {
  name = "/creatorx/${var.environment}/db/password"
}
```

### Alternative: HashiCorp Vault

For enterprise deployments, use HashiCorp Vault with the Terraform Vault provider.

## Environment Configuration

| Environment | Purpose | Auto-scale | Multi-AZ |
|-------------|---------|------------|----------|
| dev         | Development | No | No |
| staging     | Pre-production testing | Limited | Yes |
| prod        | Production | Yes | Yes |

## Cost Estimates

### Development (~$100/month)
- t3.micro RDS instance
- Single ECS task (0.5 vCPU, 1GB)
- NAT Gateway (minimal traffic)

### Production (~$500-1000/month)
- db.r6g.large RDS with Multi-AZ
- 2-4 ECS tasks (1 vCPU, 2GB each)
- Auto-scaling based on CPU/memory
- CloudWatch enhanced monitoring

## Outputs

After applying, Terraform outputs:
- `alb_dns_name` - Load balancer DNS name
- `rds_endpoint` - Database connection endpoint
- `ecs_cluster_name` - ECS cluster name
- `cloudwatch_log_group` - Log group for application logs

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all data including the database.

## Next Steps

1. Set up CI/CD to auto-deploy on push (see `.github/workflows/ci-cd.yml`)
2. Configure custom domain with Route 53
3. Set up SSL certificate with ACM
4. Enable AWS WAF for additional security
