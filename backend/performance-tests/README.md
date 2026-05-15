# Performance Tests

## Enterprise Workspace Queue Load Test

### Setup
1. Install k6: https://k6.io/docs/get-started/installation/
2. Start the CreatorX backend with representative data.
3. Export a brand token and admin token.

### Run Test
```bash
BASE_URL=http://localhost:8080 \
BRAND_TOKEN=<brand-jwt> \
ADMIN_TOKEN=<admin-jwt> \
k6 run workspace-queue-load-test.js
```

### Test Configuration
- **Users**: ramps from 25 to 100 virtual users
- **Duration**: 5 minutes
- **Endpoints**:
  - `GET /api/v1/brand/workspace-summary`
  - `GET /api/v1/brand/action-queue?page=0&size=20`
  - `GET /api/v1/admin/workspace-summary`
  - `GET /api/v1/admin/action-queue?page=0&size=20`

### SLA Thresholds
- Workspace summary APIs: p95 < 500ms
- Action queue APIs: p95 < 800ms
- Error rate: < 1%

## JMeter Load Test

### Setup
1. Install JMeter: https://jmeter.apache.org/download_jmeter.cgi
2. Open `campaign-load-test.jmx` in JMeter GUI

### Run Test
```bash
# Non-GUI mode
jmeter -n -t campaign-load-test.jmx -l results.jtl -e -o report/

# GUI mode
jmeter -t campaign-load-test.jmx
```

### Test Configuration
- **Users**: 1000 concurrent users
- **Ramp-up**: 60 seconds
- **Duration**: 300 seconds (5 minutes)
- **Endpoint**: GET /api/v1/campaigns

### Metrics
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Server resource usage

## Gatling Stress Test

### Setup
1. Add Gatling plugin to `build.gradle`:
```gradle
plugins {
    id 'io.gatling.gradle' version '3.9.5'
}
```

2. Run test:
```bash
./gradlew gatlingRun
```

### Test Configuration
- **Users**: 500 concurrent WebSocket connections
- **Ramp-up**: 60 seconds
- **Duration**: 300 seconds
- **Endpoint**: WebSocket /ws

### Metrics
- Connection success rate
- Message latency
- Throughput (messages/second)
- Error rate
