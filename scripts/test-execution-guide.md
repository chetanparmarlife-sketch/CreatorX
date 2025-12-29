# Test Execution Guide

## Quick Start

1. **Setup Environment**:
   ```bash
   chmod +x scripts/run-integration-tests.sh
   ./scripts/run-integration-tests.sh
   ```

2. **Start React Native App**:
   ```bash
   npm run ios  # or npm run android
   ```

3. **Execute Tests**:
   - Follow INTEGRATION_CHECKLIST.md
   - Document results in TEST_RESULTS.md
   - Log bugs in BUGS.md

## Test Execution Workflow

### Step 1: Pre-Test Setup
- [ ] Backend services running
- [ ] Database migrations complete
- [ ] Seed data loaded
- [ ] React Native app running
- [ ] Test accounts created

### Step 2: Execute Tests
- [ ] Authentication Flow (15 tests)
- [ ] Campaign Discovery (23 tests)
- [ ] Application Submission (11 tests)
- [ ] File Upload (10 tests)
- [ ] Messaging (15 tests)
- [ ] Wallet (14 tests)
- [ ] Notifications (13 tests)
- [ ] Error Handling (12 tests)
- [ ] Performance & UX (5 tests)

### Step 3: Document Results
- [ ] Update TEST_RESULTS.md
- [ ] Log bugs in BUGS.md
- [ ] Capture screenshots
- [ ] Record performance metrics

### Step 4: Review & Analysis
- [ ] Review all test results
- [ ] Prioritize bugs
- [ ] Create performance report
- [ ] Collect UAT feedback

## Test Data Requirements

### Test Users
- Creator account: creator@test.com
- Brand account: brand@test.com
- Admin account: admin@test.com

### Test Campaigns
- At least 50 campaigns with various statuses
- Different categories and platforms
- Various budget ranges

### Test Files
- Avatar images (JPEG, PNG)
- Portfolio items (images, videos)
- KYC documents (PDF, images)

## Performance Testing Tools

### API Testing
- Postman (Collection provided)
- curl scripts
- Apache Bench (for load testing)

### Frontend Testing
- Xcode Instruments (iOS)
- Android Profiler (Android)
- React Native Debugger

### Network Testing
- Charles Proxy (for network monitoring)
- Network Link Conditioner (iOS)

## Reporting

After test execution, ensure:
1. All test results documented
2. All bugs logged with severity
3. Performance metrics recorded
4. UAT feedback collected
5. Reports generated and reviewed


