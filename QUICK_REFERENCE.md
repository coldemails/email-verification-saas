# ⚡ Quick Reference Card

## 🚀 Common Commands

### Start Development
```bash
# Start both backend and frontend
npm run dev

# OR start separately:
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

### Docker
```bash
docker compose up -d        # Start services
docker compose down         # Stop services
docker compose ps           # Check status
docker compose logs -f      # View logs
docker compose restart      # Restart services
```

### Database (Prisma)
```bash
cd backend
npm run prisma:generate     # Generate Prisma Client
npm run prisma:migrate      # Run migrations
npm run prisma:studio       # Open Prisma Studio
```

### Kill Ports (if already in use)
```bash
lsof -ti:3000 | xargs kill -9    # Kill frontend port
lsof -ti:3001 | xargs kill -9    # Kill backend port
lsof -ti:5432 | xargs kill -9    # Kill PostgreSQL port
lsof -ti:6379 | xargs kill -9    # Kill Redis port
```

## 📁 Key Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables
- `docker-compose.yml` - Docker services
- `backend/prisma/schema.prisma` - Database schema

### Entry Points
- `backend/src/index.ts` - Backend server
- `frontend/src/app/page.tsx` - Frontend homepage
- `frontend/src/app/layout.tsx` - Frontend layout

### Important Folders
- `backend/src/routes/` - API routes
- `backend/src/controllers/` - Request handlers
- `backend/src/services/` - Business logic
- `backend/src/workers/` - Background workers
- `frontend/src/components/` - React components

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health
- Prisma Studio: http://localhost:5555

## 📦 Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- Prisma ORM
- Bull Queue
- Socket.IO

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- shadcn/ui

**Infrastructure:**
- PostgreSQL
- Redis
- Docker

## 🔑 Environment Variables

### Backend (backend/.env)
```env
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
JWT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🐛 Common Issues

**"Port already in use"**
```bash
lsof -ti:PORT | xargs kill -9
```

**"Cannot connect to database"**
```bash
docker compose restart postgres
```

**"Cannot connect to Redis"**
```bash
docker compose restart redis
```

**"Prisma Client not generated"**
```bash
cd backend && npm run prisma:generate
```

## 📊 Development Phases

1. ✅ Setup (CURRENT)
2. 🔧 Core Verification Engine
3. 📦 Queue System
4. 🔐 Authentication & API
5. 💾 File Storage
6. 🎨 Frontend Dashboard
7. 💳 Payment Integration
8. 📊 Monitoring
9. 🚀 Deployment
10. 🎉 Launch

## 🎯 Next Steps

1. Run setup: `./setup.sh`
2. Start servers: `npm run dev`
3. Open browser: http://localhost:3000
4. Follow CHECKLIST.md
5. Build features!

## 💰 Cost Structure

**Monthly:** $215.25
- Break-even: 27 users
- Target: 1,000 users ($7,990/mo)

## 📚 Documentation

- README.md - Full docs
- SETUP_GUIDE.md - Setup instructions
- CHECKLIST.md - Development roadmap
- GETTING_STARTED.md - Quick start guide

---

**Keep this card handy while developing!** 🚀
