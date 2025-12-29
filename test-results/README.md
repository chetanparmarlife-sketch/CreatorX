# Test Results Directory

This directory contains test execution artifacts.

## Structure

```
test-results/
├── README.md           # This file
├── screenshots/        # Screenshots of test execution
│   ├── passed/        # Screenshots for passed tests
│   └── failed/        # Screenshots for failed tests
├── logs/              # Test execution logs
│   ├── api-logs/      # API request/response logs
│   └── app-logs/      # React Native app logs
└── reports/           # Test reports
    └── summary.json   # Automated test summary
```

## Screenshot Naming Convention

Screenshots should be named using the test case ID:
- `RN-001-registration-success.png`
- `RN-016-campaign-list.png`
- `RN-039-application-error.png`

## Log Files

### API Logs
Capture network requests/responses using:
- React Native Debugger Network tab
- Flipper Network plugin
- Charles Proxy / mitmproxy

### App Logs
Capture React Native logs using:
- `react-native log-android` or `react-native log-ios`
- Flipper Logs plugin
- Device logs (adb logcat for Android)

## Reports

### Summary JSON Format
```json
{
  "testDate": "2024-01-01",
  "tester": "John Doe",
  "totalTests": 118,
  "passed": 100,
  "failed": 15,
  "blocked": 3,
  "categories": {
    "authentication": { "total": 15, "passed": 15, "failed": 0 },
    "campaigns": { "total": 23, "passed": 20, "failed": 3 }
  }
}
```

