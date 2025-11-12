# 🚀 Setup Guide - Email Verification SaaS

Follow these steps IN ORDER to get your development environment running.

## ✅ Step 1: Navigate to Project Directory

```bash
cd ~/projects/email-verification-saas
```

## ✅ Step 2: Install All Dependencies

This will install dependencies for root, backend, and frontend:

```bash
npm install
```

**Expected output:**
- You'll see npm installing packages
- Should take 2-3 minutes
- You might see some warnings (that's okay)

## ✅ Step 3: Set Up Environment Variables

### Backend Environment:

```bash
cd backend
cp .env.example .env
```

Now open `backend/.env` in VS Code and update these CRITICAL values:

```env
# Keep these as-is for local development:
DATABASE_URL=postgresql://emailverify:dev_password_change_in_production@localhost:5432/email_verification
REDIS_HOST=localhost
REDIS_PORT=6379

# Generate a random secret (use this command):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here

# Leave these empty for now (we'll fill them later):
STRIPE_SECRET_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DECODO_PROXY_HOST=
```

### Frontend Environment:

```bash
cd ../frontend
cp .env.example .env.local
```

The defaults are fine for local development!

## ✅ Step 4: Start Docker Services

**From project root:**

```bash
cd ~/projects/email-verification-saas
docker compose up -d
```

**Verify services are running:**

```bash
docker compose ps
```

You should see:
- `email-verification-postgres` - running
- `email-verification-redis` - running

**Troubleshooting:**
If ports are already in use:
```bash
# Check what's using the ports
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop Docker and try again
docker compose down
docker compose up -d
```

## ✅ Step 5: Set Up Database

```bash
cd ~/projects/email-verification-saas/backend

# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

**You'll be asked to name the migration - just type:** `init`

**Expected output:**
- Prisma will create all database tables
- You should see "Migration applied successfully"

## ✅ Step 6: Start Development Servers

**Open 2 terminal windows:**

### Terminal 1 - Backend:
```bash
cd ~/projects/email-verification-saas
npm run dev:backend
```

**Expected output:**
```
🚀 Server running on port 3001
📝 Environment: development
🔗 API URL: http://localhost:3001
✅ Database connected successfully
✅ Redis connected successfully
```

### Terminal 2 - Frontend:
```bash
cd ~/projects/email-verification-saas
npm run dev:frontend
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info  Loaded env from /path/to/frontend/.env.local
```

## ✅ Step 7: Test Everything Works

Open your browser and visit:

1. **Frontend**: http://localhost:3000
   - You should see the homepage with "Email Verification SaaS"

2. **Backend Health Check**: http://localhost:3001/health
   - You should see JSON: `{"status":"ok","timestamp":"...","uptime":...}`

## 🎉 Success!

If all the above works, you're ready to start building!

## 🐛 Common Issues & Solutions

### Issue: "Port 3000 is already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Try starting frontend again
```

### Issue: "Port 3001 is already in use"
```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9
# Try starting backend again
```

### Issue: "Cannot connect to database"
```bash
# Check if Docker is running
docker compose ps

# Restart Docker services
docker compose down
docker compose up -d

# Wait 10 seconds, then try again
```

### Issue: "Cannot connect to Redis"
```bash
# Same as database issue - restart Docker
docker compose restart redis
```

### Issue: "Prisma Client is not generated"
```bash
cd backend
npm run prisma:generate
```

## 📝 Daily Development Workflow

Every day when you start working:

```bash
# 1. Start Docker services
docker compose up -d

# 2. Start backend (Terminal 1)
npm run dev:backend

# 3. Start frontend (Terminal 2)
npm run dev:frontend

# 4. Start coding! 🚀
```

When you're done for the day:

```bash
# Stop servers: Ctrl+C in both terminals

# Stop Docker (optional - saves resources)
docker compose down
```

## 🎯 What's Next?

Now that everything is set up, you can start building:

1. **Email Verification Logic** - Core SMTP verification
2. **API Endpoints** - User auth, file upload, job creation
3. **Queue System** - Background job processing
4. **Frontend Components** - Upload interface, job history
5. **Payment Integration** - Stripe setup

Ready to build? Let's go! 🚀
