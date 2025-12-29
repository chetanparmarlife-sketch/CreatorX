# Testing Infrastructure Guide

## ✅ Implementation Summary

Complete testing infrastructure for CreatorX backend with unit tests, integration tests, API tests, and performance tests.

## 📁 Test Structure

```
backend/
├── creatorx-service/src/test/
│   ├── java/com/creatorx/service/
│   │   ├── CampaignServiceTest.java (Unit tests)
│   │   └── testdata/
│   │       └── TestDataBuilder.java (Test data builders)
│
├── creatorx-api/src/test/
│   ├── java/com/creatorx/api/
│   │   ├── controller/
│   │   │   └── CampaignControllerTest.java (Controller tests)
│   │   ├── integration/
│   │   │   └── CampaignIntegrationTest.java (Integration tests)
│   │   └── restassured/
│   │       └── CampaignApiTest.java (REST Assured tests)
│   └── resources/
│       └── application-test.yml (Test configuration)
│
├── performance-tests/
│   ├── campaign-load-test.jmx (JMeter load test)
│   └── websocket-stress-test.gatling.scala (Gatling stress test)
│
└── .github/workflows/
    └── backend-tests.yml (CI/CD workflow)
```

## 🧪 Test Types

### 1. Unit Tests (JUnit 5 + Mockito)
- **Location**: `creatorx-service/src/test/java`
- **Example**: `CampaignServiceTest.java`
- **Coverage**: Service layer business logic
- **Dependencies**: Mocked repositories and services

### 2. Controller Tests (MockMvc)
- **Location**: `creatorx-api/src/test/java/controller`
- **Example**: `CampaignControllerTest.java`
- **Coverage**: HTTP endpoints, validation, security
- **Dependencies**: Mocked services

### 3. Integration Tests (TestContainers)
- **Location**: `creatorx-api/src/test/java/integration`
- **Example**: `CampaignIntegrationTest.java`
- **Coverage**: Full request → service → repository → database flow
- **Dependencies**: Real PostgreSQL via TestContainers

### 4. API Tests (REST Assured)
- **Location**: `creatorx-api/src/test/java/restassured`
- **Example**: `CampaignApiTest.java`
- **Coverage**: Full HTTP request/response cycle
- **Dependencies**: Real application server

### 5. Performance Tests
- **JMeter**: Load testing (1000 concurrent users)
- **Gatling**: WebSocket stress testing

## 🔧 Configuration

### Test Profile (`application-test.yml`)
- Uses TestContainers PostgreSQL
- Disables Flyway (uses create-drop)
- Mocks Supabase
- Random server port

### Test Data Builders
- `TestDataBuilder` - Builder pattern for test entities
- Consistent test data creation
- Fluent API for test setup

### JaCoCo Configuration
- 80% coverage threshold
- Excludes DTOs, entities, config
- Generates HTML and XML reports

## 🚀 Running Tests

### Run All Tests
```bash
cd backend
./gradlew test
```

### Run Specific Test Class
```bash
./gradlew test --tests CampaignServiceTest
```

### Run with Coverage
```bash
./gradlew test jacocoTestReport
```

### View Coverage Report
```bash
open build/reports/jacoco/test/html/index.html
```

### Run Integration Tests
```bash
./gradlew test --tests "*IntegrationTest"
```

### Run Performance Tests
```bash
# JMeter
jmeter -n -t performance-tests/campaign-load-test.jmx

# Gatling
./gradlew gatlingRun
```

## 📊 Coverage Requirements

- **Minimum**: 80% line coverage
- **Enforced**: Build fails if below threshold
- **Report**: Generated in `build/reports/jacoco/`

## 🔄 CI/CD Integration

### GitHub Actions Workflow
- Runs on every PR and push
- Uses TestContainers for database
- Generates coverage reports
- Uploads to Codecov
- Fails build if coverage < 80%

### Workflow Steps
1. Checkout code
2. Set up JDK 17
3. Start PostgreSQL and Redis services
4. Run tests
5. Generate JaCoCo report
6. Upload coverage
7. Check coverage threshold

## 📝 Test Examples

### Unit Test Example
```java
@Test
void testGetCampaigns_CreatorSeesOnlyActive() {
    // Given
    when(campaignRepository.findActiveCampaignsByFilters(...))
        .thenReturn(campaignPage);
    
    // When
    Page<CampaignDTO> result = campaignService.getCampaigns(...);
    
    // Then
    assertNotNull(result);
    verify(campaignRepository).findActiveCampaignsByFilters(...);
}
```

### Integration Test Example
```java
@Test
void testCreateAndGetCampaign() {
    // Create via API
    mockMvc.perform(post("/api/v1/campaigns")...)
        .andExpect(status().isCreated());
    
    // Verify in database
    assert campaignRepository.count() > 0;
}
```

## 🎯 Best Practices

1. **Test Data Builders**: Use builders for consistent test data
2. **Test Isolation**: Each test should be independent
3. **Mock External Services**: Mock Supabase, external APIs
4. **Use TestContainers**: For integration tests with real DB
5. **Coverage**: Aim for 80%+ on business logic
6. **Naming**: Use descriptive test names with `@DisplayName`
7. **Arrange-Act-Assert**: Follow AAA pattern

## 🐛 Troubleshooting

### Issue: TestContainers not starting
- **Solution**: Ensure Docker is running
- Check TestContainers configuration

### Issue: Coverage below threshold
- **Solution**: Add more tests for uncovered code
- Check excluded classes in JaCoCo config

### Issue: Tests failing in CI
- **Solution**: Check database connection
- Verify environment variables
- Check service dependencies

---

**Status**: ✅ Complete testing infrastructure ready

