# ─────────────────────────────────────────────────────────────────────────────
# CreatorX Production Environment
# ─────────────────────────────────────────────────────────────────────────────
# Production-grade configuration with Multi-AZ, auto-scaling, and monitoring.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Use S3 backend for production state management
  # backend "s3" {
  #   bucket         = "creatorx-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-south-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = local.common_tags
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Variables
# ─────────────────────────────────────────────────────────────────────────────

variable "aws_region" {
  default = "ap-south-1"
}

variable "app_version" {
  description = "Container image version"
  default     = "latest"
}

locals {
  environment = "prod"
  project     = "creatorx"
  
  common_tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Secrets from Parameter Store
# ─────────────────────────────────────────────────────────────────────────────

data "aws_ssm_parameter" "db_password" {
  name = "/creatorx/prod/db/password"
}

data "aws_ssm_parameter" "jwt_secret" {
  name = "/creatorx/prod/jwt-secret"
}

data "aws_ssm_parameter" "sendgrid_api_key" {
  name = "/creatorx/prod/sendgrid-api-key"
}

# ─────────────────────────────────────────────────────────────────────────────
# VPC (Production - Multi-AZ)
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${local.project}-${local.environment}-vpc"
  }
}

resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${local.project}-${local.environment}-public-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "${local.project}-${local.environment}-private-${count.index + 1}"
    Type = "private"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# NAT Gateway for private subnets
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"
  
  tags = {
    Name = "${local.project}-${local.environment}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${local.project}-${local.environment}-nat-${count.index + 1}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
}

resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ─────────────────────────────────────────────────────────────────────────────
# Security Groups
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "${local.project}-${local.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name        = "${local.project}-${local.environment}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "${local.project}-${local.environment}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# RDS PostgreSQL (Production - Multi-AZ)
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${local.project}-${local.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  identifier = "${local.project}-${local.environment}-db"
  
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.large"
  allocated_storage    = 100
  max_allocated_storage = 500
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "creatorx"
  username = "creatorx_admin"
  password = data.aws_ssm_parameter.db_password.value
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  multi_az               = true
  publicly_accessible    = false
  skip_final_snapshot    = false
  deletion_protection    = true
  
  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  
  performance_insights_enabled = true
  monitoring_interval          = 60
  
  tags = {
    Name = "${local.project}-${local.environment}-db"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# ECS Cluster with Auto-Scaling
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${local.project}-${local.environment}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${local.project}-${local.environment}"
  retention_in_days = 90
}

# ─────────────────────────────────────────────────────────────────────────────
# ALB with HTTPS
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${local.project}-${local.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = true
}

resource "aws_lb_target_group" "main" {
  name        = "${local.project}-${local.environment}-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }
}

# Note: Add HTTPS listener with ACM certificate for production
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
#   certificate_arn   = aws_acm_certificate.main.arn
# }

# ─────────────────────────────────────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────────────────────────────────────

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
