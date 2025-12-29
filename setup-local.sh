#!/bin/bash

# CreatorX Local Development Setup Script
# This script sets up the local development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CreatorX Local Development Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js version
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
    else
        echo -e "${RED}✗ Node.js 18+ required (found $(node -v))${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check Docker (optional, for backend)
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker is running${NC}"
        DOCKER_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠ Docker installed but not running${NC}"
        DOCKER_AVAILABLE=false
    fi
else
    echo -e "${YELLOW}⚠ Docker not found (optional for backend)${NC}"
    DOCKER_AVAILABLE=false
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}  node_modules exists, skipping npm install${NC}"
    echo "  Run 'npm install' manually if needed"
else
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Create .env.local from .env.example if it doesn't exist
echo ""
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}.env.local already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CREATE_ENV=true
    else
        CREATE_ENV=false
    fi
else
    CREATE_ENV=true
fi

if [ "$CREATE_ENV" = true ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}  ⚠ Please edit .env.local with your Supabase credentials${NC}"
    else
        cat > .env.local << EOF
# CreatorX Local Development Environment
EXPO_PUBLIC_ENV=dev
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
        echo -e "${GREEN}✓ Created .env.local${NC}"
        echo -e "${YELLOW}  ⚠ Please edit .env.local with your Supabase credentials${NC}"
    fi
fi

# Check backend connectivity (if Docker is available)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "Checking backend services..."
    
    # Check if backend is running
    if curl -s -f http://localhost:8080/actuator/health &> /dev/null; then
        echo -e "${GREEN}✓ Backend is running on http://localhost:8080${NC}"
    else
        echo -e "${YELLOW}⚠ Backend not running${NC}"
        echo "  Start backend with: cd backend && docker-compose up -d"
        echo "  Or run: npm run start:backend"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Start backend: npm run start:backend"
echo "3. Start app: npm run dev:local"
echo ""
echo "For physical device testing:"
echo "- Ensure device is on same WiFi"
echo "- Replace localhost with your computer's IP in .env.local"
echo "  Example: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api/v1"
echo ""
echo "See LOCAL_DEVELOPMENT.md for detailed instructions"



