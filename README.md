# Email Verification SaaS

A professional bulk email verification platform built with Node.js, Next.js, PostgreSQL, and Redis.

## 🎯 Project Overview

- **Target Market**: 90% Gmail/Outlook users
- **Performance**: 2,500+ emails/minute
- **Success Rate**: 85-95% on major providers
- **Pricing**: 20-30% cheaper than competitors

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Queue**: Bull (Redis-based)
- **Real-time**: Socket.IO
- **Storage**: AWS S3 / DigitalOcean Spaces
- **Payments**: Stripe

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.IO Client

### Infrastructure
- **Compute**: 9× Hetzner CPX32 servers
- **Proxies**: Decodo Residential (25GB)
- **Database**: DigitalOcean PostgreSQL
- **Cache/Queue**: DigitalOcean Redis
- **Storage**: DigitalOcean Spaces
- **Load Balancer**: Hetzner LB

## 📋 Prerequisites

Make sure you have these installed:

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Git**: Latest version
- **Docker Desktop**: For local development
- **VS Code**: Recommended editor

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd ~/projects
git clone <your-repo-url>
cd email-verification-saas
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
npm install --workspace=backend

# Install frontend dependencies
npm install --workspace=frontend
```

### 3. Set Up Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 4. Start Docker Services

```bash
# From project root
docker compose up -d

# Verify services are running
docker compose ps
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 5. Set Up Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 6. Start Development Servers

**Option A: Start both backend and frontend together**
```bash
# From project root
npm run dev
```

**Option B: Start separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Terminal 3 - Worker (optional, for processing jobs)
cd backend
npm run worker
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555

## 📁 Project Structure

```
email-verification-saas/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration (database, redis, etc.)
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models (Prisma)
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   ├── workers/        # Background job workers
│   │   └── index.ts        # Main entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── tests/              # Tests
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # Frontend Next.js app
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and helpers
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables template
│   └── package.json
│
├── docker-compose.yml      # Docker services (PostgreSQL, Redis)
├── .gitignore
├── package.json           # Root package.json (monorepo)
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build both projects
- `npm run test` - Run all tests

### Backend
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build TypeScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run worker` - Start background worker

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

Key models:
- **User**: User accounts with credits
- **VerificationJob**: Email verification jobs
- **VerificationResult**: Individual email results
- **Transaction**: Payment history
- **ApiKey**: API access keys

See `backend/prisma/schema.prisma` for full schema.

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Remove volumes (fresh start)
docker compose down -v
```

## 🔐 Environment Variables

### Required Backend Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `AWS_ACCESS_KEY_ID` - S3/Spaces access key
- `AWS_SECRET_ACCESS_KEY` - S3/Spaces secret key

### Required Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## 📦 Next Steps

1. **Build Core Verification Engine**
   - SMTP verification logic
   - DNS validation
   - Proxy rotation
   - Result classification

2. **Implement Queue System**
   - Job creation and distribution
   - Progress tracking
   - Worker processes

3. **Build API Endpoints**
   - Authentication
   - File upload
   - Job management
   - Results download

4. **Create Frontend Dashboard**
   - File upload interface
   - Job history
   - Real-time progress
   - Results display

5. **Payment Integration**
   - Stripe setup
   - Credit system
   - Webhook handling

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Docker Issues
```bash
# Reset Docker services
docker compose down -v
docker compose up -d
```

### Database Connection Issues
- Check if PostgreSQL is running: `docker compose ps`
- Verify DATABASE_URL in .env
- Check logs: `docker compose logs postgres`

### Redis Connection Issues
- Check if Redis is running: `docker compose ps`
- Verify REDIS_HOST and REDIS_PORT in .env
- Check logs: `docker compose logs redis`

## 📚 Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Stripe API Documentation](https://stripe.com/docs/api)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📝 License

Private - All rights reserved

---

**Built with ❤️ by Sunny Newar**
