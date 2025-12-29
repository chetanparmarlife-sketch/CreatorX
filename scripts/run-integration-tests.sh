#!/bin/bash

# CreatorX Integration Test Execution Script
# This script automates the test environment setup and test execution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
TEST_RESULTS_DIR="test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${GREEN}=== CreatorX Integration Test Suite ===${NC}\n"

# Step 1: Check Prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ Prerequisites check passed${NC}\n"

# Step 2: Start Backend Services
echo -e "${YELLOW}Step 2: Starting backend services...${NC}"
cd $BACKEND_DIR
docker-compose up -d
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
docker-compose ps

# Wait for Spring Boot to be ready
echo "Waiting for Spring Boot application..."
timeout=60
counter=0
while ! curl -s http://localhost:8080/actuator/health > /dev/null; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}Spring Boot failed to start within $timeout seconds${NC}"
        exit 1
    fi
    echo "Waiting for Spring Boot... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done
echo -e "${GREEN}✓ Backend services are running${NC}\n"

# Step 3: Verify Database
echo -e "${YELLOW}Step 3: Verifying database...${NC}"
docker exec creatorx-postgres pg_isready -U postgres
echo -e "${GREEN}✓ Database is ready${NC}\n"

# Step 4: Check Migrations
echo -e "${YELLOW}Step 4: Checking database migrations...${NC}"
docker-compose logs spring-boot-app | grep -i "flyway" | tail -5
echo -e "${GREEN}✓ Migrations checked${NC}\n"

# Step 5: Create Test Results Directory
cd ..
mkdir -p $TEST_RESULTS_DIR
mkdir -p $TEST_RESULTS_DIR/$TIMESTAMP

echo -e "${GREEN}=== Test Environment Ready ===${NC}\n"
echo "Backend API: http://localhost:8080"
echo "Swagger UI: http://localhost:8080/swagger-ui.html"
echo "Test results will be saved to: $TEST_RESULTS_DIR/$TIMESTAMP"
echo ""
echo -e "${YELLOW}You can now:${NC}"
echo "1. Run API tests using Postman or curl"
echo "2. Start React Native app: npm run ios/android"
echo "3. Execute manual test cases from INTEGRATION_CHECKLIST.md"
echo ""
echo "To stop services: cd backend && docker-compose down"


