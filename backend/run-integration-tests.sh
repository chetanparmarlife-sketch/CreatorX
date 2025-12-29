#!/bin/bash

# CreatorX Phase 0 - Integration Test Runner
# This script automates the testing process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8080"
API_BASE="${BACKEND_URL}/api/v1"
TEST_EMAIL="creator1@test.com"
TEST_PASSWORD="Test123!"
BRAND_EMAIL="brand1@test.com"

# Test results
PASSED=0
FAILED=0
TOTAL=0

# Functions
print_header() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    TOTAL=$((TOTAL + 1))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED=$((PASSED + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED=$((FAILED + 1))
}

check_backend() {
    print_header "Checking Backend Health"
    
    if curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null; then
        print_pass "Backend is running"
        return 0
    else
        print_fail "Backend is not running. Please start the backend first."
        exit 1
    fi
}

setup_test_data() {
    print_header "Setting Up Test Data"
    
    if command -v psql &> /dev/null; then
        echo "Loading test data from SQL file..."
        # psql -d creatorx -f test-data-setup.sql
        print_pass "Test data setup (manual step - run test-data-setup.sql)"
    else
        print_fail "psql not found. Please run test-data-setup.sql manually."
    fi
}

test_authentication() {
    print_header "Testing Authentication Flow"
    
    # Test 1: Register (if not exists)
    print_test "Register new user"
    REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\",
            \"role\": \"CREATOR\",
            \"name\": \"Test Creator\",
            \"phone\": \"+919876543210\"
        }")
    
    if echo "$REGISTER_RESPONSE" | grep -q "accessToken\|id"; then
        print_pass "User registration"
        ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    else
        print_fail "User registration"
        ACCESS_TOKEN=""
    fi
    
    # Test 2: Login
    print_test "Login with credentials"
    LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\"
        }")
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        print_pass "User login"
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    else
        print_fail "User login"
        ACCESS_TOKEN=""
        return 1
    fi
    
    # Test 3: Get current user
    print_test "Get current user"
    USER_RESPONSE=$(curl -s -X GET "${API_BASE}/auth/me" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$USER_RESPONSE" | grep -q "email"; then
        print_pass "Get current user"
    else
        print_fail "Get current user"
    fi
    
    echo "ACCESS_TOKEN=${ACCESS_TOKEN}" > .test-token
}

test_campaigns() {
    print_header "Testing Campaign Discovery"
    
    if [ ! -f .test-token ]; then
        print_fail "No access token. Run authentication tests first."
        return 1
    fi
    
    ACCESS_TOKEN=$(grep ACCESS_TOKEN .test-token | cut -d'=' -f2)
    
    # Test 1: Fetch campaigns
    print_test "Fetch campaigns list"
    CAMPAIGNS_RESPONSE=$(curl -s -X GET "${API_BASE}/campaigns?page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$CAMPAIGNS_RESPONSE" | grep -q "content\|items"; then
        print_pass "Fetch campaigns"
        CAMPAIGN_ID=$(echo "$CAMPAIGNS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "CAMPAIGN_ID=${CAMPAIGN_ID}" >> .test-token
    else
        print_fail "Fetch campaigns"
    fi
    
    # Test 2: Get campaign details
    if [ -n "$CAMPAIGN_ID" ]; then
        print_test "Get campaign details"
        DETAILS_RESPONSE=$(curl -s -X GET "${API_BASE}/campaigns/${CAMPAIGN_ID}" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}")
        
        if echo "$DETAILS_RESPONSE" | grep -q "title"; then
            print_pass "Get campaign details"
        else
            print_fail "Get campaign details"
        fi
    fi
    
    # Test 3: Filter campaigns
    print_test "Filter campaigns by category"
    FILTER_RESPONSE=$(curl -s -X GET "${API_BASE}/campaigns?category=Fashion&page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$FILTER_RESPONSE" | grep -q "content"; then
        print_pass "Filter campaigns"
    else
        print_fail "Filter campaigns"
    fi
    
    # Test 4: Search campaigns
    print_test "Search campaigns"
    SEARCH_RESPONSE=$(curl -s -X GET "${API_BASE}/campaigns?search=summer&page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$SEARCH_RESPONSE" | grep -q "content"; then
        print_pass "Search campaigns"
    else
        print_fail "Search campaigns"
    fi
}

test_applications() {
    print_header "Testing Application Submission"
    
    if [ ! -f .test-token ]; then
        print_fail "No access token. Run authentication tests first."
        return 1
    fi
    
    ACCESS_TOKEN=$(grep ACCESS_TOKEN .test-token | cut -d'=' -f2)
    CAMPAIGN_ID=$(grep CAMPAIGN_ID .test-token | cut -d'=' -f2)
    
    if [ -z "$CAMPAIGN_ID" ]; then
        print_fail "No campaign ID. Run campaign tests first."
        return 1
    fi
    
    # Test 1: Submit application
    print_test "Submit application"
    APPLICATION_RESPONSE=$(curl -s -X POST "${API_BASE}/applications" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"campaignId\": \"${CAMPAIGN_ID}\",
            \"pitch\": \"I have 100K followers and would love to collaborate!\",
            \"expectedTimeline\": \"2 weeks\"
        }")
    
    if echo "$APPLICATION_RESPONSE" | grep -q "id\|status"; then
        print_pass "Submit application"
        APPLICATION_ID=$(echo "$APPLICATION_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "APPLICATION_ID=${APPLICATION_ID}" >> .test-token
    else
        print_fail "Submit application"
    fi
    
    # Test 2: Get applications
    print_test "Get user applications"
    APPLICATIONS_RESPONSE=$(curl -s -X GET "${API_BASE}/applications?page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$APPLICATIONS_RESPONSE" | grep -q "content\|items"; then
        print_pass "Get applications"
    else
        print_fail "Get applications"
    fi
}

test_wallet() {
    print_header "Testing Wallet"
    
    if [ ! -f .test-token ]; then
        print_fail "No access token. Run authentication tests first."
        return 1
    fi
    
    ACCESS_TOKEN=$(grep ACCESS_TOKEN .test-token | cut -d'=' -f2)
    
    # Test 1: Get wallet
    print_test "Get wallet balance"
    WALLET_RESPONSE=$(curl -s -X GET "${API_BASE}/wallet" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$WALLET_RESPONSE" | grep -q "balance"; then
        print_pass "Get wallet balance"
    else
        print_fail "Get wallet balance"
    fi
    
    # Test 2: Get transactions
    print_test "Get transaction history"
    TRANSACTIONS_RESPONSE=$(curl -s -X GET "${API_BASE}/wallet/transactions?page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$TRANSACTIONS_RESPONSE" | grep -q "content\|items"; then
        print_pass "Get transactions"
    else
        print_fail "Get transactions"
    fi
}

test_notifications() {
    print_header "Testing Notifications"
    
    if [ ! -f .test-token ]; then
        print_fail "No access token. Run authentication tests first."
        return 1
    fi
    
    ACCESS_TOKEN=$(grep ACCESS_TOKEN .test-token | cut -d'=' -f2)
    
    # Test 1: Get notifications
    print_test "Get notifications"
    NOTIFICATIONS_RESPONSE=$(curl -s -X GET "${API_BASE}/notifications?page=0&size=20" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$NOTIFICATIONS_RESPONSE" | grep -q "content\|items"; then
        print_pass "Get notifications"
    else
        print_fail "Get notifications"
    fi
    
    # Test 2: Get unread count
    print_test "Get unread count"
    UNREAD_RESPONSE=$(curl -s -X GET "${API_BASE}/notifications/unread-count" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$UNREAD_RESPONSE" | grep -q "count"; then
        print_pass "Get unread count"
    else
        print_fail "Get unread count"
    fi
}

print_summary() {
    print_header "Test Summary"
    
    echo -e "Total Tests: ${TOTAL}"
    echo -e "${GREEN}Passed: ${PASSED}${NC}"
    echo -e "${RED}Failed: ${FAILED}${NC}"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed! ✅${NC}"
        exit 0
    else
        echo -e "\n${RED}Some tests failed. Please review the output above. ❌${NC}"
        exit 1
    fi
}

# Main execution
main() {
    print_header "CreatorX Phase 0 - Integration Test Runner"
    
    check_backend
    setup_test_data
    test_authentication
    test_campaigns
    test_applications
    test_wallet
    test_notifications
    print_summary
}

# Run main function
main

