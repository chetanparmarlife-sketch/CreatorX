# CreatorX Docker Compose Setup Guide

Complete guide for setting up CreatorX local development environment using Docker Compose.

## 📋 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository
- **8GB+ RAM** recommended
- **10GB+ free disk space**

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd CreatorX-1/backend
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration (optional - defaults work for local dev)
nano .env
```

### 3. Start All Services

```bash
# Start all services in detached mode
docker-compose up -d

# Or start with logs visible
docker-compose up
```

### 4. Verify Services

```bash
# Check all services are running
docker-compose ps

# Check service health
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### 5. Access Services

Once all services are running, access:

- **Spring Boot API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Supabase Studio**: http://localhost:3000
- **MailHog UI**: http://localhost:8025
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📦 Services Overview

### 1. PostgreSQL (Supabase-compatible)

- **Image**: `supabase/postgres:15.1.0.147`
- **Port**: 5432
- **Database**: `creatorx`
- **User**: `postgres`
- **Password**: `postgres` (default, change in `.env`)
- **Data Volume**: `postgres_data`
- **Extensions**: uuid-ossp, pgcrypto, pg_stat_statements

**Connection String**:
```
postgresql://postgres:postgres@localhost:5432/creatorx
```

### 2. Redis

- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Data Volume**: `redis_data`
- **Password**: (empty by default, set in `.env`)

**Connection**:
```bash
docker exec -it creatorx-redis redis-cli
```

### 3. Spring Boot Application

- **Port**: 8080
- **Hot Reload**: Enabled (via volume mount)
- **Health Check**: http://localhost:8080/actuator/health
- **Logs**: `docker-compose logs -f spring-boot-app`

**Build**:
```bash
docker-compose build spring-boot-app
```

### 4. Supabase Studio

- **Port**: 3000
- **URL**: http://localhost:3000
- **Purpose**: Database management UI
- **Features**: Table browser, SQL editor, data viewer

### 5. MailHog

- **SMTP Port**: 1025
- **Web UI Port**: 8025
- **URL**: http://localhost:8025
- **Purpose**: Catch all emails for testing

## 🔧 Configuration

### Environment Variables

Edit `.env` file to customize:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=creatorx

# Redis
REDIS_PASSWORD=

# Spring Boot
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Supabase (for local dev, can use remote)
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Port Configuration

Change ports in `.env` if conflicts occur:

```bash
POSTGRES_PORT=5433  # If 5432 is in use
REDIS_PORT=6380     # If 6379 is in use
SERVER_PORT=8081    # If 8080 is in use
STUDIO_PORT=3001    # If 3000 is in use
```

## 📊 Database Setup

### Automatic Migrations

Flyway runs migrations automatically on Spring Boot startup. Migration files are in:
```
backend/creatorx-api/src/main/resources/db/migration/
```

### Seed Data

Seed data is automatically loaded from:
```
backend/db/seed/seed-data.sql
```

**Manual Seed** (if needed):
```bash
docker exec -i creatorx-postgres psql -U postgres -d creatorx < db/seed/seed-data.sql
```

### Database Access

**Using psql**:
```bash
docker exec -it creatorx-postgres psql -U postgres -d creatorx
```

**Using Supabase Studio**:
- Open http://localhost:3000
- Browse tables, run queries, view data

**Using DBeaver/TablePlus**:
- Host: `localhost`
- Port: `5432`
- Database: `creatorx`
- User: `postgres`
- Password: `postgres`

## 🛠️ Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart a specific service
docker-compose restart spring-boot-app
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f spring-boot-app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Rebuild Services

```bash
# Rebuild Spring Boot app
docker-compose build spring-boot-app
docker-compose up -d spring-boot-app

# Rebuild all
docker-compose build --no-cache
```

### Database Operations

```bash
# Run SQL file
docker exec -i creatorx-postgres psql -U postgres -d creatorx < script.sql

# Backup database
docker exec creatorx-postgres pg_dump -U postgres creatorx > backup.sql

# Restore database
docker exec -i creatorx-postgres psql -U postgres -d creatorx < backup.sql

# Reset database (⚠️ deletes all data)
docker-compose down -v postgres
docker-compose up -d postgres
```

### Clean Up

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove unused images
docker image prune -a

# Full cleanup (⚠️ removes all Docker data)
docker system prune -a --volumes
```

## 🧪 Testing

### Health Checks

```bash
# Spring Boot health
curl http://localhost:8080/actuator/health

# PostgreSQL health
docker exec creatorx-postgres pg_isready -U postgres

# Redis health
docker exec creatorx-redis redis-cli ping
```

### Test API

```bash
# Get campaigns
curl http://localhost:8080/api/v1/campaigns

# With authentication
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/campaigns
```

### Test Email

1. Configure Spring Boot to use MailHog SMTP (port 1025)
2. Send test email from application
3. View in MailHog UI: http://localhost:8025

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Solution**: Change port in `.env` file
```bash
SERVER_PORT=8081
```

### Issue: Database Connection Failed

**Solution**: 
1. Check PostgreSQL is running: `docker-compose ps`
2. Wait for health check: `docker-compose logs postgres`
3. Verify connection string in Spring Boot logs

### Issue: Spring Boot Won't Start

**Solution**:
1. Check logs: `docker-compose logs spring-boot-app`
2. Verify database is healthy: `docker-compose ps`
3. Check environment variables: `docker-compose config`

### Issue: Seed Data Not Loading

**Solution**:
1. Check seed file exists: `ls db/seed/seed-data.sql`
2. Manually run: `docker exec -i creatorx-postgres psql -U postgres -d creatorx < db/seed/seed-data.sql`
3. Verify data: `docker exec -it creatorx-postgres psql -U postgres -d creatorx -c "SELECT COUNT(*) FROM users;"`

### Issue: Hot Reload Not Working

**Solution**:
1. Verify volume mount in `docker-compose.yml`
2. Check file permissions
3. Restart service: `docker-compose restart spring-boot-app`

### Issue: Out of Memory

**Solution**:
1. Increase Docker memory limit (Docker Desktop → Settings → Resources)
2. Reduce JVM heap size in `docker-compose.yml`:
   ```yaml
   JAVA_OPTS: -Xms256m -Xmx512m
   ```

## 📝 Development Workflow

### 1. Initial Setup

```bash
# Clone and setup
git clone <repo>
cd backend
cp .env.example .env
docker-compose up -d
```

### 2. Daily Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f spring-boot-app

# Make code changes (hot reload enabled)

# Test API
curl http://localhost:8080/api/v1/campaigns
```

### 3. Database Changes

```bash
# Create new migration
# File: creatorx-api/src/main/resources/db/migration/V14__new_migration.sql

# Restart Spring Boot to run migration
docker-compose restart spring-boot-app
```

### 4. Testing

```bash
# Run tests
docker-compose exec spring-boot-app ./gradlew test

# Or run locally (if Java installed)
./gradlew test
```

## 🔐 Security Notes

⚠️ **Important**: This setup is for **local development only**!

- Default passwords are weak (change in production)
- No SSL/TLS encryption
- Services exposed on localhost only
- Do NOT use in production without hardening

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Review this guide's troubleshooting section
4. Check GitHub issues

---

**Happy Coding! 🚀**

