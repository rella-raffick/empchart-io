#!/bin/bash

# EmpChartIO - Start Frontend Server
# Starts the frontend development server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Starting EmpChartIO Frontend        ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if .env file exists
if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}frontend/.env not found. Please run ./setup-local.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}Starting frontend server...${NC}\n"

# Start frontend
echo -e "${BLUE}Frontend will be available at: ${GREEN}http://localhost:5173${NC}\n"
cd frontend
npm run dev
