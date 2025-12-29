#!/bin/bash

# E2E tests for CreatorX backend
# Usage: ./e2e-tests.sh <base-url>

set -e

BASE_URL=$1

if [ -z "$BASE_URL" ]; then
    echo "Error: Base URL is required"
    echo "Usage: ./e2e-tests.sh <base-url>"
    exit 1
fi

echo "🧪 Running E2E tests against: $BASE_URL"

# Test data
TEST_EMAIL="e2e-test@creatorx.com"
TEST_PASSWORD="Test123!@#"

# Helper function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local headers=(-H "Content-Type: application/json")
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    if [ "$method" = "GET" ]; then
        curl -s -w "\n%{http_code}" "${headers[@]}" "$BASE_URL$endpoint"
    else
        curl -s -w "\n%{http_code}" -X "$method" "${headers[@]}" -d "$data" "$BASE_URL$endpoint"
    fi
}

# Test 1: Health check
test_health() {
    echo "Test 1: Health check"
    response=$(api_call GET "/actuator/health")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Health check passed"
        return 0
    else
        echo "❌ Health check failed"
        return 1
    fi
}

# Test 2: Register user
test_register() {
    echo "Test 2: User registration"
    data="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"CREATOR\",\"name\":\"E2E Test User\"}"
    response=$(api_call POST "/api/v1/auth/register" "$data")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 409 ]; then
        echo "✅ Registration test passed (user may already exist)"
        # Extract token if available
        if echo "$body" | grep -q "accessToken"; then
            TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        fi
        return 0
    else
        echo "❌ Registration failed with status $http_code"
        return 1
    fi
}

# Test 3: Get campaigns (may require auth)
test_campaigns() {
    echo "Test 3: Get campaigns"
    response=$(api_call GET "/api/v1/campaigns?page=0&size=5" "" "$TOKEN")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
        echo "✅ Campaigns endpoint accessible"
        return 0
    else
        echo "❌ Campaigns endpoint failed"
        return 1
    fi
}

# Test 4: API documentation
test_api_docs() {
    echo "Test 4: API documentation"
    response=$(api_call GET "/v3/api-docs")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ API docs accessible"
        return 0
    else
        echo "❌ API docs failed"
        return 1
    fi
}

# Run all tests
main() {
    local failed=0
    
    test_health || failed=$((failed + 1))
    test_register || failed=$((failed + 1))
    test_campaigns || failed=$((failed + 1))
    test_api_docs || failed=$((failed + 1))
    
    echo ""
    echo "=========================================="
    if [ $failed -eq 0 ]; then
        echo "✅ All E2E tests passed!"
        exit 0
    else
        echo "❌ $failed E2E test(s) failed"
        exit 1
    fi
}

main

