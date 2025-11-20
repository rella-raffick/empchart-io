# EmpChartIO - Interactive Employee Organization Chart

A full-stack application for visualizing and managing organizational hierarchies with drag-and-drop functionality and role-based access control.

![Tech Stack](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Database Options](#database-options)
- [API Documentation](#api-documentation)

---

## Features

### Core Features
- **Interactive Organization Chart** - Visual hierarchy with React Flow
- **Drag & Drop Reorganization** - Real-time employee reassignment
- **Role-Based Access Control (RBAC)** - 5-level permission system
- **Dual View Modes** - "All Employees" and "My Reporting Line"
- **Theme Support** - Dark/Light mode with persistence
- **Responsive Design** - Works on desktop and mobile

### Technical Features
- **Real-time Updates** - Instant hierarchy changes
- **JWT Authentication** - Secure token-based auth
- **Multi-step Registration** - Department and designation selection
- **Analytics Dashboard** - Employee and department statistics
- **Profile Image Upload** - Base64 image storage
- **Input Validation** - Client and server-side validation

---

## Tech Stack

### Frontend
- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 7.2.2
- **State Management:** Redux Toolkit 2.10.1
- **UI Library:** TailwindCSS 4.1.17 + Radix UI
- **Visualization:** @xyflow/react 12.9.3
- **HTTP Client:** Axios 1.13.2
- **Routing:** React Router DOM 7.9.6

### Backend
- **Runtime:** Node.js 20
- **Framework:** Fastify 4.28.1
- **Language:** TypeScript 5.5.3
- **ORM:** Sequelize 6.37.3
- **Database:** PostgreSQL 16 (Supabase or Docker)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcrypt 6.0.0
- **Caching:** node-cache 5.1.2

### DevOps
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher ([Download](https://nodejs.org/))
- **npm** 10 or higher (comes with Node.js)
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

**Optional:**
- **Supabase Account** (if not using local PostgreSQL)

---

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd empchartio

# Run the setup script
./setup-local.sh

# Start development servers
./start-dev.sh
```

That's it! The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Option 2: Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. Clone Repository
```bash
git clone <repository-url>
cd empchartio
```

#### 2. Setup Database (Docker PostgreSQL)
```bash
cd deployment
cp .env.example .env  # Edit if needed
docker-compose up -d postgres
cd ..
```

#### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with local PostgreSQL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happy_fox_db
# JWT_SECRET=your-strong-secret-here

# Create database schema
npm run db:create

# Seed initial data
npm run db:seed

# Build backend
npm run build

cd ..
```

#### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000
NODE_ENV=development
EOF

cd ..
```

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

</details>

---

## Project Structure

```
empchartio/
├── backend/                    # Backend Node.js application
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── config/            # Database & Supabase config
│   │   ├── controllers/       # Route handlers
│   │   ├── dao/               # Data Access Objects
│   │   ├── middleware/        # Auth & RBAC middleware
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # DB setup & seed scripts
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React TypeScript application
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── pages/             # Route pages
│   │   ├── components/        # React components
│   │   │   ├── org-chart/    # Org chart components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── slices/           # Redux state slices
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store config
│   │   ├── utils/            # Utilities
│   │   ├── types/            # TypeScript types
│   │   ├── constants/        # App constants
│   │   └── styles/           # CSS files
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── deployment/                 # Deployment configurations
│   ├── docker-compose.yml     # PostgreSQL container
│   ├── backend/               # EC2 deployment scripts
│   │   ├── deploy-ec2.sh
│   │   ├── setup-nginx-ssl.sh
│   │   └── docker-compose.yml
│   └── .env.example
│
├── setup-local.sh             # Automated local setup
├── start-dev.sh               # Start dev servers
├── stop-local.sh              # Stop local environment
├── README.md                  # This file
└── FRONTEND_TECHNICAL_DOCUMENTATION.md
```

---

## Development

### Available Scripts

#### Backend (`backend/`)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run db:create    # Create database schema
npm run db:seed      # Seed database with sample data
npm run db:setup     # Create schema + seed data
```

#### Frontend (`frontend/`)
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Root Scripts
```bash
./setup-local.sh     # Initial setup (run once)
./start-dev.sh       # Start both backend and frontend
./stop-local.sh      # Stop PostgreSQL and cleanup
```

### Development Workflow

1. **Start PostgreSQL** (if not already running):
   ```bash
   cd deployment && docker-compose up -d postgres
   ```

2. **Start Backend**:
   ```bash
   cd backend && npm run dev
   ```

3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend && npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/health

### Database Management

#### View PostgreSQL Logs
```bash
cd deployment
docker-compose logs -f postgres
```

#### Connect to PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d happy_fox_db
```

#### Reset Database
```bash
cd backend
npm run db:create  # Recreates all tables
npm run db:seed    # Re-seeds data
```

#### Stop PostgreSQL
```bash
cd deployment
docker-compose down
```

#### Remove PostgreSQL Data (Complete Reset)
```bash
cd deployment
docker-compose down -v  # Removes volumes
docker-compose up -d postgres
```

---

## Database Options

### Option 1: Local PostgreSQL with Docker (Default)

**Pros:**
- No external dependencies
- Fast local development
- Complete control
- Offline development

**Setup:**
```bash
# Already configured by setup-local.sh
cd deployment
docker-compose up -d postgres
```

**Backend .env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happy_fox_db
```

### Option 2: Supabase (Cloud PostgreSQL)

**Pros:**
- No local database needed
- Built-in auth features
- Dashboard for data management
- Automatic backups

**Setup:**

1. Create a Supabase project at https://supabase.com

2. Get credentials from Supabase Dashboard:
   - Project Settings → API → Project URL & Keys
   - Project Settings → Database → Connection String

3. Update `backend/.env`:
   ```env
   # Comment out or remove DATABASE_URL
   # DATABASE_URL=postgresql://...

   # Add Supabase credentials
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_DB_URL=postgresql://postgres.your-project-ref:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. Stop local PostgreSQL:
   ```bash
   cd deployment && docker-compose down
   ```

5. Run database setup:
   ```bash
   cd backend
   npm run db:create
   npm run db:seed
   ```

### Switching Between Options

**To Docker:**
```bash
# Start Docker PostgreSQL
cd deployment && docker-compose up -d postgres

# Update backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happy_fox_db
# Comment out SUPABASE_* variables
```

**To Supabase:**
```bash
# Stop Docker PostgreSQL
cd deployment && docker-compose down

# Update backend/.env
# Comment out DATABASE_URL
SUPABASE_URL=https://...
SUPABASE_DB_URL=postgresql://...
```

---

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1-555-0100",
  "department": "TECHNOLOGY",
  "designation": "Software Engineer",
  "profileImage": "data:image/jpeg;base64,..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Employee Endpoints

#### Get Hierarchy
```http
GET /api/employees/hierarchy
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "CEO Name",
    "children": [ ... ]
  }
}
```

#### Get My Reporting Line
```http
GET /api/employees/:employeeId/path
GET /api/employees/:employeeId/hierarchy
Authorization: Bearer <token>
```

#### Update Manager
```http
PATCH /api/employees/:employeeId/manager
Authorization: Bearer <token>
Content-Type: application/json

{
  "managerId": 5
}
```

### Department & Designation Endpoints

#### Get Departments
```http
GET /api/designations/departments
```

#### Get Designations by Department
```http
GET /api/designations/department/:departmentCode
```

**Full API documentation:** See Postman collection (if available)

---

## Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database (Choose one)
# Option 1: Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/happy_fox_db

# Option 2: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres.your-project:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# JWT Configuration
JWT_SECRET=your-very-strong-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Database Seeding (set to true only for first run)
SEED_DATABASE=false
```

#### Frontend (`frontend/.env`)
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

#### Docker PostgreSQL (`deployment/.env`)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=happy_fox_db
POSTGRES_PORT=5432
```
