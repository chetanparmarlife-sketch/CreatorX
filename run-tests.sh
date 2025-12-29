#!/bin/bash

# CreatorX React Native - Automated Test Runner
# This script helps automate the execution of integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8080"
TEST_RESULTS_FILE="TEST_RESULTS.md"
BUGS_FILE="BUGS.md"
CHECKLIST_FILE="backend/INTEGRATION_CHECKLIST.md"

# Test counters
TOTAL_TESTS=118
PASSED=0
FAILED=0
BLOCKED=0

echo "=========================================="
echo "CreatorX Integration Test Runner"
echo "=========================================="
echo ""

# Function to check backend health
check_backend() {
    echo -n "Checking backend health... "
    if curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null; then
        echo -e "${GREEN}✓ Backend is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Backend is not responding${NC}"
        echo "Please start the backend: docker-compose up -d"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking database connection... "
    if docker exec -it creatorx-postgres psql -U creatorx -d creatorx -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is accessible${NC}"
        return 0
    else
        echo -e "${RED}✗ Database is not accessible${NC}"
        return 1
    fi
}

# Function to check test data
check_test_data() {
    echo -n "Checking test data... "
    USER_COUNT=$(docker exec -it creatorx-postgres psql -U creatorx -d creatorx -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    if [ "$USER_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Test data found (${USER_COUNT} users)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ No test data found${NC}"
        echo "Run: docker exec -it creatorx-postgres psql -U creatorx -d creatorx -f /path/to/test-data-setup.sql"
        return 1
    fi
}

# Function to run API health checks
run_api_health_checks() {
    echo ""
    echo "Running API health checks..."
    echo "----------------------------------------"
    
    # Test authentication endpoint
    echo -n "Testing auth endpoint... "
    if curl -s -f -X POST "${BACKEND_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}' > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (Expected - test credentials may not exist)${NC}"
    fi
    
    # Test campaigns endpoint (requires auth)
    echo -n "Testing campaigns endpoint structure... "
    RESPONSE=$(curl -s -w "%{http_code}" "${BACKEND_URL}/api/v1/campaigns" -o /dev/null)
    if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ (${RESPONSE})${NC}"
    else
        echo -e "${RED}✗ (${RESPONSE})${NC}"
    fi
}

# Function to generate test summary
generate_summary() {
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total Tests: ${TOTAL_TESTS}"
    echo -e "Passed: ${GREEN}${PASSED}${NC}"
    echo -e "Failed: ${RED}${FAILED}${NC}"
    echo -e "Blocked: ${YELLOW}${BLOCKED}${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ] && [ $BLOCKED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed or were blocked${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo "Pre-flight checks..."
    echo "----------------------------------------"
    
    if ! check_backend; then
        exit 1
    fi
    
    if ! check_database; then
        exit 1
    fi
    
    check_test_data
    
    run_api_health_checks
    
    echo ""
    echo "=========================================="
    echo "Manual Testing Required"
    echo "=========================================="
    echo ""
    echo "This script performs automated checks only."
    echo "For complete testing, follow these steps:"
    echo ""
    echo "1. Review TEST_EXECUTION_GUIDE.md"
    echo "2. Open INTEGRATION_CHECKLIST.md"
    echo "3. Execute each test manually"
    echo "4. Mark results in TEST_RESULTS.md"
    echo "5. Document bugs in BUGS.md"
    echo ""
    echo "Test files:"
    echo "  - Checklist: ${CHECKLIST_FILE}"
    echo "  - Results: ${TEST_RESULTS_FILE}"
    echo "  - Bugs: ${BUGS_FILE}"
    echo ""
    
    # Prompt for manual test execution
    read -p "Have you completed manual testing? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please update TEST_RESULTS.md with your results."
        echo "Then run this script again to generate summary."
    else
        echo ""
        echo "Please complete manual testing first."
        echo "See TEST_EXECUTION_GUIDE.md for instructions."
    fi
}

# Run main function
main

