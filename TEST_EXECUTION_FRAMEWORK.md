# CreatorX Integration Test Execution Framework

## Overview

This document provides a structured approach to executing the complete 118-test integration suite for CreatorX Phase 1.

## Prerequisites

### Required Software
- Docker Desktop 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Java JDK 17+
- React Native CLI
- iOS Simulator (macOS) or Android Emulator
- Postman or curl for API testing

### Required Access
- Supabase project credentials
- Test user accounts (creator and brand)

## Test Environment Setup

### 1. Start Backend Services

```bash
cd backend

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f spring-boot-app
```

**Expected Output:**
- PostgreSQL: Running on port 5432
- Redis: Running on port 6379
- Spring Boot: Running on port 8080
- Supabase Studio: Running on port 3000
- MailHog: Running on port 8025

### 2. Verify Database Migrations

```bash
# Check migration status
docker-compose exec spring-boot-app ./gradlew flywayInfo

# Or check logs for migration completion
docker-compose logs spring-boot-app | grep "Flyway"
```

### 3. Load Seed Data

```bash
# If seed data script exists
docker exec -i creatorx-postgres psql -U postgres -d creatorx < backend/db/seed/seed-data.sql

# Verify seed data
docker exec -it creatorx-postgres psql -U postgres -d creatorx -c "SELECT COUNT(*) FROM users;"
docker exec -it creatorx-postgres psql -U postgres -d creatorx -c "SELECT COUNT(*) FROM campaigns;"
```

### 4. Start React Native App

```bash
# iOS
npm run ios

# Android
npm run android

# Or with Expo
npx expo start
```

### 5. Health Checks

```bash
# Backend API
curl http://localhost:8080/actuator/health

# Database
docker exec creatorx-postgres pg_isready -U postgres

# Redis
docker exec creatorx-redis redis-cli ping
```

## Test Execution Strategy

### Phase 1: Backend API Tests (Automated)
- Use Postman collections or curl scripts
- Test all endpoints independently
- Verify response formats and status codes

### Phase 2: Frontend Integration Tests (Manual)
- Test user flows through the React Native app
- Verify UI updates match API responses
- Test error handling and loading states

### Phase 3: End-to-End Tests (Manual)
- Complete user journeys
- Cross-platform testing (iOS + Android)
- Real device testing

## Test Documentation Structure

1. **TEST_RESULTS.md** - Detailed test execution results
2. **BUGS.md** - Bug tracking and resolution
3. **PERFORMANCE_REPORT.md** - Performance metrics
4. **UAT_FEEDBACK.md** - User acceptance testing feedback

## Test Execution Checklist

- [ ] Environment setup complete
- [ ] All services running
- [ ] Seed data loaded
- [ ] Test accounts created
- [ ] Postman collection imported
- [ ] React Native app running
- [ ] Test execution started
- [ ] Results documented
- [ ] Bugs logged
- [ ] Performance metrics collected


