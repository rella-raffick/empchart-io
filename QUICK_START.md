# EmpChartIO - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### For Developers (First Time Setup)

```bash
# 1. Clone the repository
git clone <repository-url>
cd empchartio

# 2. Run the automated setup
./setup-local.sh

# 3. Start development
./start-dev.sh
```

**That's it!** 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📝 What the Setup Script Does

The `setup-local.sh` script automatically:

1. ✅ Checks prerequisites (Node.js, Docker, npm)
2. ✅ Creates `.env` files from examples
3. ✅ Installs all dependencies (backend + frontend)
4. ✅ Starts PostgreSQL in Docker
5. ✅ Creates database schema
6. ✅ Seeds sample data
7. ✅ Builds backend TypeScript

---

## 🎯 Common Commands

### Start Everything
```bash
./start-dev.sh
```
Starts PostgreSQL + Backend + Frontend

### Stop Everything
```bash
./stop-local.sh
```
Stops PostgreSQL and cleans up logs

### Reset Database
```bash
cd backend
npm run db:create  # Recreate tables
npm run db:seed    # Add sample data
```

### View Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log

# PostgreSQL logs
cd deployment && docker-compose logs -f postgres
```

---

## 🗄️ Database Options

### Option 1: Docker PostgreSQL (Default)
Already configured by `setup-local.sh`!

### Option 2: Supabase
1. Create Supabase project at https://supabase.com
2. Update `backend/.env`:
   ```env
   # Comment out DATABASE_URL
   # Add Supabase credentials
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_DB_URL=postgresql://...
   ```
3. Stop Docker: `cd deployment && docker-compose down`
4. Run: `cd backend && npm run db:create && npm run db:seed`

---

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

### "PostgreSQL connection failed"
```bash
cd deployment
docker-compose restart postgres
```

### "Module not found" errors
```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules && npm install
```

### Complete Reset
```bash
./stop-local.sh
cd deployment && docker-compose down -v
./setup-local.sh
```

---

## 📂 Project Structure

```
empchartio/
├── backend/          # Node.js + TypeScript + Fastify
├── frontend/         # React + TypeScript + Vite
├── deployment/       # Docker configs
├── setup-local.sh    # 🎯 Run this first
├── start-dev.sh      # Start dev servers
└── stop-local.sh     # Stop services
```

---

## 🎓 Default Users (After Seeding)

After running `npm run db:seed`, you can login with:

**CEO:**
- Email: `ceo@company.com`
- Password: `password123`

**Manager:**
- Email: `manager@company.com`
- Password: `password123`

**Or register a new account** at http://localhost:5173/register

---

## 🔧 Manual Commands

If you prefer manual control:

### Backend
```bash
cd backend
npm install
npm run build
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### PostgreSQL
```bash
cd deployment
docker-compose up -d postgres
```

---

## 📚 Full Documentation

- **Complete Guide:** [README.md](./README.md)
- **Frontend Docs:** [FRONTEND_TECHNICAL_DOCUMENTATION.md](./FRONTEND_TECHNICAL_DOCUMENTATION.md)
- **Deployment:** [deployment/backend/EC2_DEPLOYMENT.md](./deployment/backend/EC2_DEPLOYMENT.md)

---

## 🆘 Still Having Issues?

1. Check the main [README.md](./README.md) for detailed troubleshooting
2. Ensure Docker is running: `docker ps`
3. Check Node version: `node --version` (should be 20+)
4. Review logs: `tail -f backend.log frontend.log`

---

**Happy Coding! 🚀**
