#!/bin/bash

# EmpChartIO - Start Backend Server
# Starts the backend development server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Starting EmpChartIO Backend         ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL...${NC}"
cd deployment
if ! docker-compose ps postgres | grep -q "Up"; then
    echo -e "${YELLOW}PostgreSQL is not running. Starting...${NC}"
    docker-compose up -d postgres
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 5

    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            echo -e "${GREEN}PostgreSQL is ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}PostgreSQL failed to start${NC}"
            exit 1
        fi
        sleep 1
    done
else
    echo -e "${GREEN}PostgreSQL is already running${NC}"
fi
cd ..

echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}backend/.env not found. Please run ./setup-local.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}Starting backend server...${NC}\n"

# Start backend
echo -e "${BLUE}Backend will be available at: ${GREEN}http://localhost:3000${NC}\n"
cd backend
npm run dev
