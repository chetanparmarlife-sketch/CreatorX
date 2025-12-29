#!/bin/bash

# Smoke tests for CreatorX backend
# Usage: ./smoke-tests.sh <base-url>

set -e

BASE_URL=$1
MAX_RETRIES=5
RETRY_DELAY=10

if [ -z "$BASE_URL" ]; then
    echo "Error: Base URL is required"
    echo "Usage: ./smoke-tests.sh <base-url>"
    exit 1
fi

echo "🧪 Running smoke tests against: $BASE_URL"

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local retries=0
    
    echo "Waiting for service to be ready..."
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s "$url/actuator/health" > /dev/null 2>&1; then
            echo "✅ Service is ready"
            return 0
        fi
        retries=$((retries + 1))
        echo "Attempt $retries/$MAX_RETRIES failed, retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done
    
    echo "❌ Service failed to become ready after $MAX_RETRIES attempts"
    return 1
}

# Test health endpoint
test_health() {
    echo "Testing health endpoint..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/actuator/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Health check passed"
        echo "Response: $body"
        return 0
    else
        echo "❌ Health check failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Test API info endpoint
test_info() {
    echo "Testing info endpoint..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/actuator/info")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Info endpoint accessible"
        return 0
    else
        echo "❌ Info endpoint failed with status $http_code"
        return 1
    fi
}

# Test Swagger UI
test_swagger() {
    echo "Testing Swagger UI..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/swagger-ui.html")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 302 ]; then
        echo "✅ Swagger UI accessible"
        return 0
    else
        echo "⚠️  Swagger UI returned status $http_code (may not be critical)"
        return 0
    fi
}

# Test OpenAPI docs
test_openapi() {
    echo "Testing OpenAPI docs..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/v3/api-docs")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ OpenAPI docs accessible"
        return 0
    else
        echo "❌ OpenAPI docs failed with status $http_code"
        return 1
    fi
}

# Test campaigns endpoint (public, may require auth)
test_campaigns() {
    echo "Testing campaigns endpoint..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/campaigns?page=0&size=1")
    http_code=$(echo "$response" | tail -n1)
    
    # 200 or 401 (unauthorized) are acceptable
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
        echo "✅ Campaigns endpoint accessible (status: $http_code)"
        return 0
    else
        echo "❌ Campaigns endpoint failed with status $http_code"
        return 1
    fi
}

# Run all tests
main() {
    local failed=0
    
    wait_for_service "$BASE_URL" || failed=$((failed + 1))
    test_health || failed=$((failed + 1))
    test_info || failed=$((failed + 1))
    test_swagger || failed=$((failed + 1))
    test_openapi || failed=$((failed + 1))
    test_campaigns || failed=$((failed + 1))
    
    echo ""
    echo "=========================================="
    if [ $failed -eq 0 ]; then
        echo "✅ All smoke tests passed!"
        exit 0
    else
        echo "❌ $failed smoke test(s) failed"
        exit 1
    fi
}

main

