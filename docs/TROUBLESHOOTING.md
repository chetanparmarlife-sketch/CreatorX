# CreatorX Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Database Issues](#database-issues)
5. [Authentication Issues](#authentication-issues)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)

---

## Common Issues

### Issue: Application Won't Start

**Symptoms**:
- Application fails to start
- Port already in use error
- Database connection failed

**Solutions**:

1. **Port Already in Use**:
   ```bash
   # Check what's using port 8080
   lsof -i :8080
   # Or on Windows
   netstat -ano | findstr :8080
   
   # Kill the process or change port
   export SERVER_PORT=8081
   ```

2. **Database Connection Failed**:
   ```bash
   # Check database is running
   docker-compose ps postgres
   
   # Check connection
   psql -h localhost -U postgres -d creatorx
   
   # Verify connection string in .env
   ```

3. **Missing Environment Variables**:
   ```bash
   # Check required variables
   echo $DATABASE_URL
   echo $SUPABASE_URL
   
   # Set missing variables
   export DATABASE_URL=jdbc:postgresql://localhost:5432/creatorx
   ```

---

## Backend Issues

### Issue: 401 Unauthorized Errors

**Symptoms**:
- All API calls return 401
- Token validation fails

**Solutions**:

1. **Check Token Format**:
   ```bash
   # Token should be in format: Bearer <token>
   curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/campaigns
   ```

2. **Verify Token Expiration**:
   - Tokens expire after 24 hours
   - Refresh token using Supabase SDK

3. **Check Supabase Configuration**:
   ```bash
   # Verify Supabase URL and keys
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Check User Status**:
   ```sql
   SELECT id, email, status FROM users WHERE supabase_id = 'your-supabase-id';
   -- User status should be 'ACTIVE'
   ```

---

### Issue: 500 Internal Server Error

**Symptoms**:
- API returns 500 error
- Generic error message

**Solutions**:

1. **Check Application Logs**:
   ```bash
   # Docker
   docker logs creatorx-backend
   
   # Systemd
   journalctl -u creatorx -f
   
   # Local
   tail -f logs/application.log
   ```

2. **Check Database**:
   ```bash
   # Verify database is accessible
   psql -h localhost -U postgres -d creatorx -c "SELECT 1;"
   ```

3. **Check Redis**:
   ```bash
   # Verify Redis is accessible
   redis-cli ping
   # Should return: PONG
   ```

4. **Check Stack Trace**:
   - Enable stack trace in error response (dev only)
   - Review exception details in logs

---

### Issue: Slow API Response Times

**Symptoms**:
- API responses take > 1 second
- Timeout errors

**Solutions**:

1. **Check Database Performance**:
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Check Indexes**:
   ```sql
   -- Verify indexes exist
   SELECT indexname FROM pg_indexes WHERE tablename = 'campaigns';
   ```

3. **Check Connection Pool**:
   ```yaml
   # Increase pool size in application.yml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 20
   ```

4. **Enable Query Logging**:
   ```yaml
   # application-dev.yml
   spring:
     jpa:
       show-sql: true
       properties:
         hibernate:
           format_sql: true
   ```

---

## Frontend Issues

### Issue: API Calls Fail

**Symptoms**:
- Network errors
- CORS errors
- 401/403 errors

**Solutions**:

1. **Check API Base URL**:
   ```typescript
   // Verify .env file
   EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

2. **Check CORS Configuration**:
   ```java
   // Verify allowed origins in SecurityConfig
   configuration.setAllowedOrigins(Arrays.asList("http://localhost:8081"));
   ```

3. **Check Token Storage**:
   ```typescript
   // Verify token is stored
   const token = await AsyncStorage.getItem('access_token');
   console.log('Token:', token);
   ```

4. **Check Network Connectivity**:
   ```typescript
   import NetInfo from '@react-native-community/netinfo';
   
   const state = await NetInfo.fetch();
   console.log('Network state:', state);
   ```

---

### Issue: WebSocket Connection Fails

**Symptoms**:
- Messages not received
- Connection errors
- Reconnection loops

**Solutions**:

1. **Check WebSocket URL**:
   ```typescript
   // Verify WebSocket URL
   const wsUrl = 'ws://localhost:8080/ws';
   ```

2. **Check Authentication**:
   ```typescript
   // Include token in connection
   const client = new Client({
     brokerURL: wsUrl,
     connectHeaders: {
       Authorization: `Bearer ${token}`
     }
   });
   ```

3. **Check Server Logs**:
   ```bash
   # Check WebSocket connection logs
   docker logs creatorx-backend | grep WebSocket
   ```

4. **Test Connection**:
   ```bash
   # Test WebSocket connection
   wscat -c ws://localhost:8080/ws
   ```

---

## Database Issues

### Issue: Migration Failures

**Symptoms**:
- Application fails to start
- Migration errors in logs

**Solutions**:

1. **Check Migration Status**:
   ```bash
   ./gradlew flywayInfo
   ```

2. **Repair Failed Migrations**:
   ```bash
   ./gradlew flywayRepair
   ```

3. **Manually Run Migration**:
   ```bash
   # Run specific migration
   psql -h localhost -U postgres -d creatorx -f src/main/resources/db/migration/V15__add_performance_indexes.sql
   ```

4. **Check Database Schema**:
   ```sql
   -- Verify tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

### Issue: Slow Queries

**Symptoms**:
- Queries take > 500ms
- Database CPU high

**Solutions**:

1. **Check Missing Indexes**:
   ```sql
   -- Find queries without indexes
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

2. **Analyze Query Plan**:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM campaigns WHERE status = 'ACTIVE';
   ```

3. **Update Statistics**:
   ```sql
   ANALYZE campaigns;
   ```

4. **Check Table Sizes**:
   ```sql
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

---

## Authentication Issues

### Issue: Token Refresh Fails

**Symptoms**:
- 401 errors after token expiration
- Refresh token invalid

**Solutions**:

1. **Check Refresh Token**:
   ```typescript
   // Verify refresh token exists
   const refreshToken = await AsyncStorage.getItem('refresh_token');
   ```

2. **Check Supabase Configuration**:
   ```typescript
   // Verify Supabase client
   const { data, error } = await supabase.auth.refreshSession();
   ```

3. **Check Token Expiration**:
   ```typescript
   // Decode token to check expiration
   const decoded = jwt.decode(token);
   console.log('Expires:', new Date(decoded.exp * 1000));
   ```

---

### Issue: User Not Found After Registration

**Symptoms**:
- User registered but can't login
- 404 errors for user endpoints

**Solutions**:

1. **Check User Creation**:
   ```sql
   -- Verify user exists
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

2. **Check Supabase Link**:
   ```bash
   # Link Supabase user to backend
   curl -X POST http://localhost:8080/api/v1/auth/link-supabase-user \
     -H "Content-Type: application/json" \
     -d '{
       "supabaseUserId": "uuid",
       "email": "user@example.com",
       "name": "User Name",
       "role": "CREATOR"
     }'
   ```

3. **Check User Status**:
   ```sql
   -- User should be ACTIVE
   UPDATE users SET status = 'ACTIVE' WHERE email = 'user@example.com';
   ```

---

## Performance Issues

### Issue: High Memory Usage

**Symptoms**:
- Application uses > 1GB memory
- Out of memory errors

**Solutions**:

1. **Check JVM Settings**:
   ```bash
   # Reduce heap size
   export JAVA_OPTS="-Xms256m -Xmx512m"
   ```

2. **Check Connection Pool**:
   ```yaml
   # Reduce pool size
   spring:
     datasource:
       hikari:
         maximum-pool-size: 10
   ```

3. **Check Cache Size**:
   ```yaml
   # Limit cache size
   spring:
     cache:
       redis:
         time-to-live: 600000
   ```

---

### Issue: Slow File Uploads

**Symptoms**:
- File uploads timeout
- Upload progress slow

**Solutions**:

1. **Check File Size Limits**:
   ```yaml
   # Increase limits
   spring:
     servlet:
       multipart:
         max-file-size: 10MB
         max-request-size: 10MB
   ```

2. **Check Supabase Storage**:
   ```typescript
   // Verify Supabase storage bucket
   const { data, error } = await supabase.storage
     .from('avatars')
     .upload('file.jpg', file);
   ```

3. **Check Network**:
   ```bash
   # Test upload speed
   curl -T largefile.jpg https://your-project.supabase.co/storage/v1/object/avatars/file.jpg
   ```

---

## Deployment Issues

### Issue: Docker Container Won't Start

**Symptoms**:
- Container exits immediately
- Health check fails

**Solutions**:

1. **Check Logs**:
   ```bash
   docker logs creatorx-backend
   ```

2. **Check Environment Variables**:
   ```bash
   docker exec creatorx-backend env | grep SPRING
   ```

3. **Check Dependencies**:
   ```bash
   # Verify postgres and redis are running
   docker-compose ps
   ```

4. **Check Health**:
   ```bash
   # Wait for health check
   docker-compose up -d
   sleep 30
   curl http://localhost:8080/actuator/health
   ```

---

### Issue: Database Migrations Don't Run

**Symptoms**:
- Tables missing
- Application starts but endpoints fail

**Solutions**:

1. **Check Flyway Enabled**:
   ```yaml
   spring:
     flyway:
       enabled: true
   ```

2. **Run Migrations Manually**:
   ```bash
   ./gradlew flywayMigrate
   ```

3. **Check Migration Files**:
   ```bash
   ls -la src/main/resources/db/migration/
   ```

4. **Check Database Connection**:
   ```bash
   # Verify connection before migrations
   psql -h localhost -U postgres -d creatorx -c "SELECT 1;"
   ```

---

## Getting Help

### Logs Location

- **Docker**: `docker logs creatorx-backend`
- **Systemd**: `journalctl -u creatorx -f`
- **Local**: `logs/application.log`

### Debug Mode

Enable debug logging:
```yaml
logging:
  level:
    root: DEBUG
    com.creatorx: DEBUG
```

### Support

- **Documentation**: See other docs in `/docs`
- **Issues**: Create GitHub issue
- **Email**: support@creatorx.com

---

**Last Updated**: [Date]  
**Version**: 1.0.0

