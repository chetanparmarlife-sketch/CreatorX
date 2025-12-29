# CreatorX Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Java**: JDK 17 or higher
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for local development)
- **PostgreSQL**: 15+ (if not using Docker)
- **Redis**: 7+ (if not using Docker)
- **Node.js**: 18+ (for frontend)
- **Gradle**: 7.5+ (or use Gradle wrapper)

### Required Accounts

- **Supabase**: Project for authentication and storage
- **Firebase**: Project for push notifications
- **Domain**: For production deployment

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd CreatorX-1
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start Services with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f spring-boot-app
```

### 4. Verify Setup

```bash
# Health check
curl http://localhost:8080/actuator/health

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## Docker Deployment

### Build Docker Image

```bash
cd backend

# Build image
docker build -t creatorx-backend:latest .

# Tag for registry
docker tag creatorx-backend:latest registry.example.com/creatorx-backend:1.0.0
```

### Run Container

```bash
docker run -d \
  --name creatorx-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:postgresql://postgres:5432/creatorx \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=secure-password \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  creatorx-backend:latest
```

### Docker Compose for Production

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: creatorx
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - creatorx-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - creatorx-network

  backend:
    image: creatorx-backend:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DATABASE_URL: jdbc:postgresql://postgres:5432/creatorx
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - creatorx-network

volumes:
  postgres_data:
  redis_data:

networks:
  creatorx-network:
    driver: bridge
```

---

## Production Deployment

### 1. Prepare Environment

```bash
# Set production profile
export SPRING_PROFILES_ACTIVE=prod

# Set secure passwords
export DATABASE_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
```

### 2. Database Setup

```bash
# Create production database
createdb creatorx_prod

# Run migrations
./gradlew flywayMigrate -Pflyway.url=jdbc:postgresql://prod-db:5432/creatorx_prod
```

### 3. Build Application

```bash
# Build JAR
./gradlew clean build -x test

# JAR location
ls -lh creatorx-api/build/libs/creatorx-api-*.jar
```

### 4. Deploy Application

**Option A: Systemd Service**

```bash
# Create service file
sudo nano /etc/systemd/system/creatorx.service
```

```ini
[Unit]
Description=CreatorX Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=creatorx
WorkingDirectory=/opt/creatorx
ExecStart=/usr/bin/java -jar /opt/creatorx/creatorx-api.jar
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DATABASE_URL=jdbc:postgresql://localhost:5432/creatorx_prod"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable creatorx
sudo systemctl start creatorx
sudo systemctl status creatorx
```

**Option B: Docker Swarm**

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml creatorx
```

---

## Environment Configuration

### Required Variables

```bash
# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/creatorx
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secure-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# JWT (if not using Supabase)
JWT_SECRET=your-256-bit-secret
JWT_EXPIRATION_MS=86400000

# Storage Buckets
SUPABASE_STORAGE_BUCKET_AVATARS=avatars
SUPABASE_STORAGE_BUCKET_KYC=kyc-documents
SUPABASE_STORAGE_BUCKET_DELIVERABLES=deliverables
SUPABASE_STORAGE_BUCKET_PORTFOLIO=portfolio
```

### Environment-Specific Configs

**application-prod.yml**:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
  jpa:
    show-sql: false
  flyway:
    enabled: true

logging:
  level:
    root: INFO
    com.creatorx: INFO
  file:
    name: /var/log/creatorx/application.log
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE creatorx_prod;
CREATE USER creatorx_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE creatorx_prod TO creatorx_user;
```

### 2. Run Migrations

Migrations run automatically on startup. To run manually:

```bash
./gradlew flywayMigrate \
  -Pflyway.url=jdbc:postgresql://localhost:5432/creatorx_prod \
  -Pflyway.user=creatorx_user \
  -Pflyway.password=secure-password
```

### 3. Verify Migrations

```bash
./gradlew flywayInfo
```

### 4. Backup Database

```bash
# Full backup
pg_dump -h localhost -U creatorx_user -d creatorx_prod -F c -f backup_$(date +%Y%m%d).dump

# Schema only
pg_dump -h localhost -U creatorx_user -d creatorx_prod -s -f schema.sql
```

---

## Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Database health
curl http://localhost:8080/actuator/health/db

# Redis health
curl http://localhost:8080/actuator/health/redis
```

### Logs

```bash
# Application logs
tail -f /var/log/creatorx/application.log

# Docker logs
docker logs -f creatorx-backend

# Systemd logs
journalctl -u creatorx -f
```

### Metrics (Future)

- Prometheus metrics endpoint: `/actuator/prometheus`
- Grafana dashboards
- APM integration

---

## Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS (reverse proxy)
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure Supabase production project
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Test disaster recovery
- [ ] Load testing completed

---

## Reverse Proxy (Nginx)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.creatorx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.creatorx.com;

    ssl_certificate /etc/ssl/certs/creatorx.crt;
    ssl_certificate_key /etc/ssl/private/creatorx.key;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Nginx or AWS ALB
2. **Multiple Instances**: Run multiple backend instances
3. **Session Management**: Stateless design (no sessions)
4. **Database**: Read replicas for read-heavy operations

### Vertical Scaling

1. **JVM Heap**: Increase `-Xmx` for more memory
2. **Database**: Increase PostgreSQL resources
3. **Redis**: Increase Redis memory

---

## Troubleshooting

### Application Won't Start

1. Check logs: `docker logs creatorx-backend`
2. Verify environment variables
3. Check database connectivity
4. Verify port availability

### Database Connection Failed

1. Check database is running
2. Verify connection string
3. Check firewall rules
4. Verify credentials

### High Memory Usage

1. Check JVM heap settings
2. Review connection pool size
3. Check for memory leaks
4. Monitor with JVM tools

---

**Last Updated**: [Date]  
**Version**: 1.0.0

