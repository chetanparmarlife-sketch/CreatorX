# Performance Tests

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

