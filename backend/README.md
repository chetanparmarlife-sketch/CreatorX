# CreatorX Backend API

Spring Boot backend for CreatorX - A three-sided marketplace connecting influencers with brand campaigns.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Database Migrations](#database-migrations)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

CreatorX is a three-sided marketplace platform that connects:
- **Creators**: Content creators and influencers
- **Brands**: Companies looking for influencer marketing
- **Admins**: Platform administrators

The backend provides RESTful APIs and WebSocket support for real-time messaging, built with Spring Boot and PostgreSQL.

## Tech Stack

- **Framework**: Spring Boot 3.2.0
- **Java**: 17+
- **Build Tool**: Gradle 8.5+
- **Database**: PostgreSQL 15+ (via Supabase)
- **Cache**: Redis 7+
- **Security**: Spring Security + JWT (Supabase Auth)
- **Storage**: Supabase Storage
- **WebSocket**: STOMP over WebSocket
- **Documentation**: OpenAPI 3 / Swagger UI
- **Migration**: Flyway
- **Containerization**: Docker & Docker Compose
- **Testing**: JUnit 5, Mockito, TestContainers, REST Assured

## Project Structure

```
backend/
├── creatorx-api/              # API layer (controllers, security, config)
│   ├── src/main/java/com/creatorx/api/
│   │   ├── config/           # Configuration classes
│   │   ├── controller/        # REST controllers
│   │   ├── security/         # Security filters and interceptors
│   │   └── CreatorXApplication.java
│   └── src/main/resources/
│       ├── application.yml   # Main configuration
│       └── db/migration/     # Flyway migrations
│
├── creatorx-service/         # Business logic layer
│   └── src/main/java/com/creatorx/service/
│       ├── dto/              # Data transfer objects
│       ├── mapper/           # MapStruct mappers
│       └── storage/          # Storage services
│
├── creatorx-repository/      # Data access layer
│   └── src/main/java/com/creatorx/repository/
│       ├── entity/           # JPA entities
│       └── *.java            # Repository interfaces
│
├── creatorx-common/         # Shared utilities
│   └── src/main/java/com/creatorx/common/
│       ├── enums/            # Enum types
│       ├── exception/        # Custom exceptions
│       └── util/             # Utility classes
│
├── docker-compose.yml        # Docker services
├── Dockerfile               # Application container
└── README.md                # This file
```

## Prerequisites

- **Java 17+** (OpenJDK or Oracle JDK)
- **Gradle 8.5+** (or use Gradle Wrapper)
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL 15+** (or use Supabase)
- **Redis 7+** (for caching)

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Spring Boot application on port 8080

4. **Check health**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

5. **Access Swagger UI**
   ```
   http://localhost:8080/swagger-ui.html
   ```

### Option 2: Local Development

1. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker Compose (only DB services)
   docker-compose up -d postgres redis
   
   # Or use your local PostgreSQL/Redis instances
   ```

2. **Configure environment variables**
   ```bash
   export DATABASE_URL=jdbc:postgresql://localhost:5432/creatorx
   export DATABASE_USERNAME=postgres
   export DATABASE_PASSWORD=postgres
   export REDIS_HOST=localhost
   export REDIS_PORT=6379
   export SUPABASE_URL=https://your-project.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Build the project**
   ```bash
   ./gradlew clean build
   ```

4. **Run the application**
   ```bash
   ./gradlew :creatorx-api:bootRun
   ```

   Or run from IDE:
   - Main class: `com.creatorx.api.CreatorXApplication`
   - Profile: `dev`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active profile (dev/staging/prod) | `dev` |
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/creatorx` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `postgres` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `SUPABASE_URL` | Supabase project URL | (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | (required) |
| `SERVER_PORT` | Application port | `8080` |

### Application Profiles

- **dev**: Development profile with debug logging
- **staging**: Staging environment configuration
- **prod**: Production environment configuration
- **test**: Test profile with TestContainers

## Database Migrations

### Flyway Configuration

Flyway is configured to run migrations automatically on startup. Migration files are located in:
```
creatorx-api/src/main/resources/db/migration/
```

### Migration Files

- `V1__create_enums.sql` - Enum types
- `V2__create_users_and_profiles.sql` - Users and profiles
- `V3__create_campaigns.sql` - Campaigns
- `V4__create_applications.sql` - Applications
- `V5__create_wallet_and_transactions.sql` - Wallet and transactions
- `V6__create_messaging_and_notifications.sql` - Messaging
- `V7__create_kyc_and_referrals.sql` - KYC and referrals
- `V8__create_triggers.sql` - Database triggers
- `V11__add_supabase_id_to_users.sql` - Supabase integration
- `V12__create_saved_campaigns.sql` - Saved campaigns
- `V13__create_storage_buckets_and_policies.sql` - Storage setup

### Running Migrations Manually

```bash
# Check migration status
./gradlew :creatorx-api:flywayInfo

# Repair migrations (if needed)
./gradlew :creatorx-api:flywayRepair
```

## Running Tests

### Run All Tests
```bash
./gradlew test
```

### Run with Coverage
```bash
./gradlew test jacocoTestReport
```

### View Coverage Report
```bash
open build/reports/jacoco/test/html/index.html
```

### Run Specific Test
```bash
./gradlew test --tests CampaignServiceTest
```

### Run Integration Tests
```bash
./gradlew test --tests "*IntegrationTest"
```

### Test Coverage Requirements
- **Minimum**: 80% line coverage
- **Enforced**: Build fails if below threshold
- **Report**: Generated in `build/reports/jacoco/`

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing documentation.

## API Documentation

### Swagger UI

Once the application is running, access:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/v3/api-docs.yaml

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/link-supabase-user` - Link Supabase user
- `GET /api/v1/auth/me` - Get current user

#### Campaigns
- `GET /api/v1/campaigns` - List campaigns (with filters)
- `GET /api/v1/campaigns/{id}` - Get campaign details
- `POST /api/v1/campaigns` - Create campaign (Brand only)
- `PUT /api/v1/campaigns/{id}` - Update campaign (Brand only)
- `DELETE /api/v1/campaigns/{id}` - Delete campaign (Brand only)
- `POST /api/v1/campaigns/{id}/save` - Save campaign (Creator only)
- `GET /api/v1/campaigns/saved` - Get saved campaigns

#### Applications
- `POST /api/v1/applications` - Submit application
- `GET /api/v1/applications` - Get applications
- `DELETE /api/v1/applications/{id}` - Withdraw application

#### Deliverables
- `GET /api/v1/deliverables` - Get deliverables
- `POST /api/v1/deliverables/{id}/submit` - Submit deliverable
- `GET /api/v1/deliverables/{id}/history` - Get submission history

#### Wallet
- `GET /api/v1/wallet` - Get wallet balance
- `GET /api/v1/wallet/transactions` - Get transactions
- `POST /api/v1/wallet/withdraw` - Request withdrawal

#### Messaging (WebSocket)
- `ws://localhost:8080/ws` - WebSocket endpoint
- `POST /app/chat.send` - Send message
- Subscribe to `/user/{userId}/queue/messages` - Receive messages

See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) for detailed API usage examples.

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t creatorx-backend:latest .
   ```

2. **Run container**
   ```bash
   docker run -d \
     -p 8080:8080 \
     -e SPRING_PROFILES_ACTIVE=prod \
     -e DATABASE_URL=jdbc:postgresql://... \
     -e SUPABASE_URL=https://... \
     creatorx-backend:latest
   ```

### Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure Supabase production project

## Troubleshooting

### Issue: Database connection failed
- **Solution**: Check database is running and credentials are correct
- Verify `DATABASE_URL` format: `jdbc:postgresql://host:port/database`

### Issue: Flyway migration failed
- **Solution**: Check migration file syntax
- Verify database user has CREATE/ALTER permissions
- Check for conflicting migrations

### Issue: Redis connection failed
- **Solution**: Check Redis is running
- Verify `REDIS_HOST` and `REDIS_PORT`
- Check Redis password if configured

### Issue: Supabase JWT validation failed
- **Solution**: Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify Supabase project is active

### Issue: WebSocket connection failed
- **Solution**: Check JWT token is valid
- Verify WebSocket URL: `ws://localhost:8080/ws`
- Check CORS configuration

## Additional Documentation

- [API Usage Guide](./API_USAGE_GUIDE.md) - Detailed API usage examples
- [Testing Guide](./TESTING_GUIDE.md) - Testing infrastructure
- [Architecture Decision Records](./docs/adr/) - ADRs
- [Database Schema](./docs/database-schema.md) - ER diagram and schema docs

## Support

For issues and questions:
- **Email**: api@creatorx.com
- **Documentation**: https://docs.creatorx.com
- **GitHub Issues**: https://github.com/creatorx/backend/issues

## License

Proprietary - © 2024 CreatorX. All rights reserved.
