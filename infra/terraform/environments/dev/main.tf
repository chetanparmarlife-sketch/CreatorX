# ─────────────────────────────────────────────────────────────────────────────
# CreatorX Development Environment
# ─────────────────────────────────────────────────────────────────────────────
# This is a minimal development environment configuration.
# For production, use environments/prod/main.tf with Multi-AZ and auto-scaling.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Uncomment to use S3 backend for state management
  # backend "s3" {
  #   bucket         = "creatorx-terraform-state"
  #   key            = "dev/terraform.tfstate"
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

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "app_version" {
  description = "Container image version"
  default     = "latest"
}

locals {
  environment = "dev"
  project     = "creatorx"
  
  common_tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# VPC
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
  count             = 2
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
  count             = 2
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
  
  tags = {
    Name = "${local.project}-${local.environment}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${local.project}-${local.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
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
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
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
  
  tags = {
    Name = "${local.project}-${local.environment}-alb-sg"
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
  
  tags = {
    Name = "${local.project}-${local.environment}-ecs-sg"
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
  
  tags = {
    Name = "${local.project}-${local.environment}-rds-sg"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# RDS PostgreSQL
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${local.project}-${local.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "${local.project}-${local.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${local.project}-${local.environment}-db"
  
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "creatorx"
  username = "creatorx_admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  multi_az               = false  # Enable in prod
  publicly_accessible    = false
  skip_final_snapshot    = true   # Disable in prod
  deletion_protection    = false  # Enable in prod
  
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  
  tags = {
    Name = "${local.project}-${local.environment}-db"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# ECS Cluster
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${local.project}-${local.environment}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "${local.project}-${local.environment}-cluster"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${local.project}-${local.environment}"
  retention_in_days = 30
  
  tags = {
    Name = "${local.project}-${local.environment}-logs"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# ALB
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${local.project}-${local.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  tags = {
    Name = "${local.project}-${local.environment}-alb"
  }
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
  
  tags = {
    Name = "${local.project}-${local.environment}-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

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

output "cloudwatch_log_group" {
  description = "CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs.name
}
