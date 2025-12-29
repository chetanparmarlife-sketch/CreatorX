# CreatorX Backend Setup Guide

## Quick Setup Steps

### 1. Prerequisites Check
```bash
# Check Java version (should be 17+)
java -version

# Check Docker (optional, for containerized setup)
docker --version
docker-compose --version
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- Redis settings
- JWT secret (generate a strong secret for production)
- Application port

### 3. Database Setup

#### Option A: Using Docker Compose
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

#### Option B: Local PostgreSQL
1. Install PostgreSQL 16+
2. Create database:
   ```sql
   CREATE DATABASE creatorx;
   ```
3. Update `application.yml` with your connection details

### 4. Build and Run

#### Using Gradle Wrapper
```bash
# Build the project
./gradlew clean build

# Run the application
./gradlew :creatorx-api:bootRun
```

#### Using Docker Compose (Full Stack)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 5. Verify Installation

1. **Health Check**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Swagger UI**
   Open browser: http://localhost:8080/swagger-ui.html

3. **API Docs**
   Open browser: http://localhost:8080/v3/api-docs

## Generating JWT Secret

For production, generate a secure JWT secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```
JWT_SECRET=<generated-secret>
```

## Supabase Integration

To connect to Supabase PostgreSQL:

1. Get your Supabase connection string from the Supabase dashboard
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres?user=postgres&password=your-password
   ```

## Common Issues

### Port Already in Use
```bash
# Change port in .env
SERVER_PORT=8081
```

### Database Connection Failed
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists

### Redis Connection Failed
- Verify Redis is running
- Check password if configured
- Test: `docker exec -it creatorx-redis redis-cli ping`

## Next Steps

1. Set up authentication endpoints
2. Implement campaign management APIs
3. Add wallet and transaction endpoints
4. Configure Razorpay integration
5. Set up CI/CD pipeline




