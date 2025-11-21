#!/bin/bash

# EmpChartIO - Local Development Setup Script
# This script sets up the entire application for local development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   EmpChartIO - Local Setup Script     ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js 20 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}ERROR: npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"

if ! command_exists docker; then
    echo -e "${RED}ERROR: Docker is not installed. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"

if ! command_exists docker-compose; then
    echo -e "${RED}ERROR: docker-compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose installed: $(docker-compose --version)${NC}"

echo ""

# Step 1: Setup environment files
echo -e "${BLUE}Step 1: Setting up environment files...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from .env.example...${NC}"
    cp backend/.env.example backend/.env

    # Update for local Docker PostgreSQL
    sed -i.bak 's|SUPABASE_DB_URL=.*|# For local Docker PostgreSQL:\nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/happy_fox_db|' backend/.env

    echo -e "${YELLOW}IMPORTANT: Update backend/.env with your configuration:${NC}"
    echo -e "   - Set JWT_SECRET to a strong random value"
    echo -e "   - If using Supabase, update SUPABASE_* values"
    echo -e "   - If using local Docker, DATABASE_URL is already set"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env...${NC}"
    cat > frontend/.env << 'EOF'
# API Base URL
VITE_API_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ frontend/.env created${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"

# Backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""

# Step 3: Start PostgreSQL
echo -e "${BLUE}Step 3: Starting PostgreSQL with Docker...${NC}"
docker-compose up -d postgres
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Wait for PostgreSQL to be healthy
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}ERROR: PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 1
done

echo ""

# Step 4: Setup database
echo -e "${BLUE}Step 4: Setting up database schema and seed data...${NC}"

read -p "Do you want to setup database schema and seed data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    echo -e "${YELLOW}Creating database schema...${NC}"
    npm run db:create
    echo -e "${GREEN}✓ Database schema created${NC}"

    echo -e "${YELLOW}Seeding database with initial data...${NC}"
    npm run db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
    cd ..
fi

echo ""

# Step 5: Build backend
echo -e "${BLUE}Step 5: Building backend...${NC}"
cd backend
npm run build
echo -e "${GREEN}✓ Backend built${NC}"
cd ..

echo ""

# Final instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup Complete!                     ${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Review and update ${YELLOW}backend/.env${NC} with your configuration"
echo -e "2. Start the development servers:\n"
echo -e "   ${GREEN}# Terminal 1 - Start Backend${NC}"
echo -e "   cd backend && npm run dev\n"
echo -e "   ${GREEN}# Terminal 2 - Start Frontend${NC}"
echo -e "   cd frontend && npm run dev\n"

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  ${YELLOW}./start-dev.sh${NC}           - Start both backend and frontend"
echo -e "  ${YELLOW}./stop-local.sh${NC}          - Stop PostgreSQL"
echo -e "  ${YELLOW}npm run db:seed${NC}          - Re-seed database (from backend/)"
echo -e "  ${YELLOW}docker-compose logs -f${NC}   - View PostgreSQL logs (from deployment/)\n"

echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  PostgreSQL: ${GREEN}localhost:5432${NC}\n"

echo -e "${YELLOW}Note: If using Supabase instead of local PostgreSQL:${NC}"
echo -e "  1. Stop local PostgreSQL: ${GREEN}cd deployment && docker-compose down${NC}"
echo -e "  2. Update ${YELLOW}backend/.env${NC} with Supabase credentials"
echo -e "  3. Remove or comment out DATABASE_URL in backend/.env\n"
