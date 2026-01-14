# ─────────────────────────────────────────────────────────────────────────────
# Common Variables for CreatorX Infrastructure
# ─────────────────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "creatorx"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

# ─────────────────────────────────────────────────────────────────────────────
# VPC Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

# ─────────────────────────────────────────────────────────────────────────────
# Database Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "creatorx"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "creatorx_admin"
}

variable "db_password" {
  description = "Database master password (use Parameter Store in production)"
  type        = string
  sensitive   = true
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = false
}

# ─────────────────────────────────────────────────────────────────────────────
# ECS Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "ecs_task_cpu" {
  description = "ECS task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "app_version" {
  description = "Container image tag/version"
  type        = string
  default     = "latest"
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 8080
}

# ─────────────────────────────────────────────────────────────────────────────
# Monitoring Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "enable_enhanced_monitoring" {
  description = "Enable RDS enhanced monitoring"
  type        = bool
  default     = false
}

# ─────────────────────────────────────────────────────────────────────────────
# Tags
# ─────────────────────────────────────────────────────────────────────────────

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

locals {
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )
}
