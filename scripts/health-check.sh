#!/bin/bash

# Health check script for production deployment
# Usage: ./health-check.sh <base-url>

set -e

BASE_URL=$1
MAX_RETRIES=10
RETRY_DELAY=15
TIMEOUT=5

if [ -z "$BASE_URL" ]; then
    echo "Error: Base URL is required"
    echo "Usage: ./health-check.sh <base-url>"
    exit 1
fi

echo "🏥 Running health check for: $BASE_URL"

check_health() {
    local url="$BASE_URL/actuator/health"
    local response
    local http_code
    
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        # Check if health status is UP
        if echo "$body" | grep -q '"status":"UP"'; then
            echo "✅ Health check passed"
            echo "Response: $body"
            return 0
        else
            echo "⚠️  Health endpoint returned 200 but status is not UP"
            echo "Response: $body"
            return 1
        fi
    else
        echo "❌ Health check failed with HTTP $http_code"
        return 1
    fi
}

# Retry logic
retries=0
while [ $retries -lt $MAX_RETRIES ]; do
    if check_health; then
        echo "✅ Health check successful after $retries retries"
        exit 0
    fi
    
    retries=$((retries + 1))
    if [ $retries -lt $MAX_RETRIES ]; then
        echo "Retry $retries/$MAX_RETRIES in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1

