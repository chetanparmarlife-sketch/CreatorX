# CreatorX React Native - Test Execution Guide

## Prerequisites

### 1. Backend Setup
```bash
cd backend
docker-compose up -d
# Wait for all services to be healthy
docker-compose ps
```

### 2. Load Test Data
```bash
# Connect to Postgres
docker exec -it creatorx-postgres psql -U creatorx -d creatorx

# Run test data script
\i test-data-setup.sql
```

### 3. React Native App Setup
```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on device/emulator
npm run android  # or npm run ios
```

### 4. Environment Configuration
Ensure `.env.development` is configured:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## Test Execution Workflow

### Step 1: Pre-Test Verification
- [ ] Backend services running (check `http://localhost:8080/actuator/health`)
- [ ] Database has test data
- [ ] React Native app builds and runs
- [ ] Network connectivity verified
- [ ] Feature flags enabled in AppContext

### Step 2: Execute Tests by Category

Follow the checklist in `INTEGRATION_CHECKLIST.md` and mark each test:

1. **Authentication Flow** (RN-001 to RN-015)
2. **Campaign Discovery** (RN-016 to RN-038)
3. **Application Submission** (RN-039 to RN-049)
4. **File Upload** (RN-050 to RN-059)
5. **Messaging** (RN-060 to RN-074)
6. **Wallet** (RN-075 to RN-088)
7. **Notifications** (RN-089 to RN-101)
8. **Error Handling** (RN-102 to RN-113)
9. **Performance & UX** (RN-114 to RN-118)

### Step 3: Document Results

For each test:
- Mark `[x]` if PASSED
- Mark `[ ]` if FAILED
- Mark `[B]` if BLOCKED
- Add notes in TEST_RESULTS.md
- Create bug entry in BUGS.md if failed

## Test Execution Commands

### Quick Health Check
```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check database connection
docker exec -it creatorx-postgres psql -U creatorx -d creatorx -c "SELECT COUNT(*) FROM users;"
```

### Network Monitoring
```bash
# Monitor API calls (React Native Debugger)
# Enable Network tab in React Native Debugger
# Or use Flipper Network plugin
```

### Database Verification
```bash
# Check user created
docker exec -it creatorx-postgres psql -U creatorx -d creatorx -c \
  "SELECT id, email, role FROM users WHERE email = 'test@example.com';"

# Check application submitted
docker exec -it creatorx-postgres psql -U creatorx -d creatorx -c \
  "SELECT id, campaign_id, status FROM applications ORDER BY applied_at DESC LIMIT 5;"
```

## Test Data Reference

### Test Users
- **Creator**: `creator1@test.com` / `Test123!`
- **Brand**: `brand1@test.com` / `Test123!`

### Test Campaigns
- Campaign IDs are UUIDs - check database for actual IDs
- Use campaign titles to identify: "Summer Fashion Campaign", "Tech Product Launch"

## Screenshot Guidelines

Take screenshots for:
- Failed tests (error messages, wrong UI state)
- Critical flows (registration, application submission)
- Error states (network errors, validation errors)

Save screenshots in `test-results/screenshots/` with naming:
- `RN-001-registration-success.png`
- `RN-016-campaign-list.png`
- `RN-039-application-error.png`

## Common Issues & Solutions

### Issue: Backend not responding
**Solution**: Check Docker containers, restart if needed
```bash
docker-compose restart
```

### Issue: 401 Unauthorized errors
**Solution**: Check token storage, re-login
```bash
# Clear AsyncStorage in React Native Debugger
# Or reinstall app
```

### Issue: WebSocket connection fails
**Solution**: Check WS_URL in env, verify backend WebSocket endpoint
```bash
# Test WebSocket manually
wscat -c ws://localhost:8080/ws
```

### Issue: Database queries fail
**Solution**: Verify test data loaded, check table names
```bash
docker exec -it creatorx-postgres psql -U creatorx -d creatorx -c "\dt"
```

## Test Completion Checklist

After executing all tests:
- [ ] All 118 tests executed
- [ ] TEST_RESULTS.md completed
- [ ] BUGS.md created for failures
- [ ] Screenshots saved
- [ ] Test summary generated
- [ ] Results reviewed with team

