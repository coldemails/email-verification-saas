#!/bin/bash

# Email Verification SaaS - Quick Start Script
# This script helps you set up the project quickly

echo "🚀 Email Verification SaaS - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "🔧 Step 2: Setting up environment variables..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Remember to update JWT_SECRET in backend/.env${NC}"
else
    echo -e "${YELLOW}ℹ️  backend/.env already exists, skipping...${NC}"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}ℹ️  frontend/.env.local already exists, skipping...${NC}"
fi
echo ""

echo "🐳 Step 3: Starting Docker services..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Docker services${NC}"
    echo "Make sure Docker Desktop is running!"
    exit 1
fi
echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🗄️  Step 4: Setting up database..."
cd backend

npm run prisma:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo "init" | npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to run database migrations${NC}"
    exit 1
fi

cd ..
echo -e "${GREEN}✅ Database setup complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start development servers:"
echo ""
echo "  Option 1 - Both at once:"
echo "    npm run dev"
echo ""
echo "  Option 2 - Separately (recommended):"
echo "    Terminal 1: npm run dev:backend"
echo "    Terminal 2: npm run dev:frontend"
echo ""
echo "Access your app:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Health:    http://localhost:3001/health"
echo ""
echo "Happy coding! 🚀"
