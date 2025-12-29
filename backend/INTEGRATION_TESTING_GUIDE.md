# CreatorX Phase 0 - Integration Testing Guide

Complete guide for end-to-end integration testing of CreatorX Phase 0.

## Quick Start

1. **Start Backend**
   ```bash
   cd backend
   ./gradlew :creatorx-api:bootRun
   ```

2. **Setup Test Data**
   ```bash
   psql -d creatorx -f test-data-setup.sql
   ```

3. **Run Automated Tests**
   ```bash
   ./run-integration-tests.sh
   ```

4. **Run Manual Tests**
   - Follow [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
   - Use [TESTING_SCRIPT.md](./TESTING_SCRIPT.md) for step-by-step instructions

---

## Test Documentation

### 1. Integration Checklist
**File**: [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)

Comprehensive checklist with 118 test cases covering:
- Authentication Flow (15 tests)
- Campaign Discovery (23 tests)
- Application Submission (11 tests)
- File Upload (10 tests)
- Messaging (15 tests)
- Wallet (14 tests)
- Notifications (13 tests)
- Error Handling (12 tests)
- Performance & UX (5 tests)

**Usage**: Mark items as complete `[x]` when verified.

### 2. Testing Script
**File**: [TESTING_SCRIPT.md](./TESTING_SCRIPT.md)

Step-by-step instructions for each test scenario:
- Prerequisites
- Test steps
- Expected results
- Verification queries
- Pass/Fail tracking

**Usage**: Follow step-by-step for detailed testing.

### 3. Automated Test Runner
**File**: [run-integration-tests.sh](./run-integration-tests.sh)

Bash script that automates API testing:
- Health check
- Authentication flow
- Campaign discovery
- Application submission
- Wallet operations
- Notifications

**Usage**: 
```bash
./run-integration-tests.sh
```

### 4. Test Data Setup
**File**: [test-data-setup.sql](./test-data-setup.sql)

SQL script to populate database with test data:
- Test users (creators, brands)
- Test campaigns
- Test applications
- Test transactions
- Test conversations
- Test notifications

**Usage**:
```bash
psql -d creatorx -f test-data-setup.sql
```

---

## Test Execution Workflow

### Phase 1: Setup
1. Start backend services
2. Run database migrations
3. Load test data
4. Start React Native app

### Phase 2: Automated API Tests
1. Run `run-integration-tests.sh`
2. Review test results
3. Fix any failures

### Phase 3: Manual UI Tests
1. Follow [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
2. Use [TESTING_SCRIPT.md](./TESTING_SCRIPT.md) for detailed steps
3. Mark items as complete
4. Document any issues

### Phase 4: End-to-End Flows
1. Test complete user journeys:
   - Register → Browse → Apply → Submit → Withdraw
   - Login → Message → Receive → Respond
   - Upload → View → Update → Delete

### Phase 5: Error Scenarios
1. Test error handling:
   - Network failures
   - Invalid tokens
   - Server errors
   - Offline mode

---

## Test Data

### Test Users

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `creator1@test.com` | `Test123!` | CREATOR | Main creator for testing |
| `creator2@test.com` | `Test123!` | CREATOR | Secondary creator |
| `brand1@test.com` | `Test123!` | BRAND | Main brand for testing |
| `brand2@test.com` | `Test123!` | BRAND | Secondary brand |

### Test Campaigns

| ID | Title | Status | Platform | Budget |
|----|-------|--------|----------|--------|
| `aaaaaaaa-...` | Summer Fashion Campaign | ACTIVE | INSTAGRAM | ₹50,000 |
| `bbbbbbbb-...` | Tech Product Launch | ACTIVE | YOUTUBE | ₹75,000 |
| `cccccccc-...` | Winter Collection (Draft) | DRAFT | INSTAGRAM | ₹60,000 |

---

## Verification Queries

### Check User Created
```sql
SELECT * FROM users WHERE email = 'creator1@test.com';
```

### Check Application Submitted
```sql
SELECT * FROM applications 
WHERE creator_id = (SELECT id FROM users WHERE email = 'creator1@test.com')
ORDER BY applied_at DESC LIMIT 1;
```

### Check Message Sent
```sql
SELECT * FROM messages 
WHERE sender_id = (SELECT id FROM users WHERE email = 'creator1@test.com')
ORDER BY created_at DESC LIMIT 1;
```

### Check Wallet Balance
```sql
SELECT balance, pending_balance FROM wallets 
WHERE user_id = (SELECT id FROM users WHERE email = 'creator1@test.com');
```

---

## Common Issues & Solutions

### Issue: Backend not running
**Solution**: 
```bash
cd backend
./gradlew :creatorx-api:bootRun
```

### Issue: Database connection failed
**Solution**: 
- Check PostgreSQL is running
- Verify connection string in `application.yml`
- Check database exists: `CREATE DATABASE creatorx;`

### Issue: Test data not loaded
**Solution**:
```bash
psql -d creatorx -f test-data-setup.sql
```

### Issue: Token expired
**Solution**: 
- Re-run authentication tests
- Or manually login and get new token

### Issue: WebSocket connection failed
**Solution**:
- Check WebSocket URL: `ws://localhost:8080/ws`
- Verify JWT token is valid
- Check CORS configuration

---

## Test Report Template

### Test Execution Report

**Date**: _______________  
**Tester**: _______________  
**Environment**: Development / Staging / Production  
**Duration**: _______________

**Summary**:
- Total Tests: 118
- Passed: ___
- Failed: ___
- Blocked: ___
- Pass Rate: ___%

**Test Coverage**:
- Authentication: ___ / 15
- Campaign Discovery: ___ / 23
- Application Submission: ___ / 11
- File Upload: ___ / 10
- Messaging: ___ / 15
- Wallet: ___ / 14
- Notifications: ___ / 13
- Error Handling: ___ / 12
- Performance & UX: ___ / 5

**Failed Tests**:
1. Test ID: ______
   - Description: ______
   - Error: ______
   - Status: ______

**Blocked Tests**:
1. Test ID: ______
   - Description: ______
   - Reason: ______

**Notes**:
_________________________________  
_________________________________  
_________________________________

**Sign-off**:
- [ ] All critical tests passed
- [ ] No blocking issues
- [ ] Ready for next phase

---

## Next Steps

After completing Phase 0 testing:

1. **Fix Issues**: Address all failed tests
2. **Re-test**: Re-run failed tests after fixes
3. **Documentation**: Update documentation with findings
4. **Phase 1 Planning**: Plan testing for Brand Dashboard
5. **Performance Testing**: Run load tests (JMeter/Gatling)

---

**Happy Testing! 🚀**

