# VetCare Sri Lanka - Getting Started Guide

This guide will help you set up and run the VetCare Sri Lanka web application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0 (Install: `npm install -g pnpm`)
- **Docker Desktop** (for PostgreSQL and Redis)
- **Git**

## 🚀 Quick Start

### 1. Start Database Services

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL and Redis in the background
docker-compose up -d

# Check if containers are running
docker ps

# You should see vetcare-postgres and vetcare-redis running
```

**Option B: Local Installation**

If you prefer to install PostgreSQL and Redis locally:

- PostgreSQL: Download from https://www.postgresql.org/download/
- Redis: Download from https://redis.io/download

### 2. Configure Environment Variables

**Backend (.env file)**

```bash
# Navigate to backend directory
cd apps/api

# The .env file should already exist with this content:
DATABASE_URL="postgresql://vetcare_user:vetcare_password@localhost:5432/vetcare_db"
NODE_ENV=development
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-this
# ... other variables
```

> **Note:** The .env file is gitignored for security. Update the values as needed for your environment.

**Frontend Environment**

```bash
# Create .env.local in apps/web
cd apps/web
cp ../.env.example .env.local

# Edit .env.local with:
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
# Navigate to API directory
cd apps/api

# Run Prisma migrations to create database tables
pnpm prisma migrate dev --name init

# This will:
# - Create all tables based on schema.prisma
# - Generate Prisma Client
# - Create the first migration
```

### 4. Install Dependencies (if not already done)

```bash
# From project root
pnpm install
```

### 5. Start Development Servers

**Option A: Start All Services (from root)**

```bash
pnpm dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

**Option B: Start Services Individually**

Terminal 1 - Backend:

```bash
cd apps/api
pnpm start:dev
```

Terminal 2 - Frontend:

```bash
cd apps/web
pnpm dev
```

## 🔍 Verify Installation

### Check Backend

```bash
curl http://localhost:4000
# Should return: Hello World! or similar
```

### Check Frontend

Open browser to: http://localhost:3000

### Check Database

```bash
cd apps/api
pnpm prisma studio
```

This opens Prisma Studio in your browser at http://localhost:5555 where you can view and edit database records.

## 📦 Installed Dependencies

### Frontend (`apps/web`)

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Zustand (State Management)
- ✅ React Query (Data Fetching)
- ✅ React Hook Form + Zod (Forms & Validation)
- ✅ Socket.io Client (Real-time Chat)
- ✅ Agora SDK (Video Calling)
- ✅ Axios (HTTP Client)

### Backend (`apps/api`)

- ✅ NestJS
- ✅ Prisma ORM
- ✅ PostgreSQL
- ✅ JWT Authentication
- ✅ Passport.js
- ✅ bcrypt (Password Hashing)
- ✅ class-validator & class-transformer
- ✅ Socket.io (WebSocket Server)
- ✅ @nestjs/config

## 🗄️ Database Schema

The Prisma schema includes:

**Core Models:**

- `User` - Main user authentication table
- `PetOwner` - Pet owner profiles
- `Veterinarian` - Vet professional profiles
- `Pet` - Pet information
- `Clinic` - Veterinary clinics
- `Appointment` - Booking system
- `Consultation` - Telemedicine sessions
- `Prescription` - Digital prescriptions
- `Payment` - Payment transactions
- `HealthRecord` - Pet medical history
- `Vaccination` - Vaccination tracking
- `Review` - Vet ratings and reviews
- `Notification` - User notifications

**Supporting Models:**

- `VetQualification`, `VetSpecialization`, `AvailabilitySlot`
- `Address`, `ChatMessage`, `ConsultationFile`
- `Admin`, `ClinicVeterinarian`

## 🔧 Common Commands

```bash
# Install new dependency
pnpm add <package-name>

# Run linter
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build

# Database migrations
cd apps/api
pnpm prisma migrate dev          # Create & apply migration
pnpm prisma migrate reset        # Reset database
pnpm prisma generate             # Regenerate Prisma Client
pnpm prisma studio               # Open database GUI

# Docker commands
docker-compose up -d             # Start services
docker-compose down              # Stop services
docker-compose logs postgres     # View PostgreSQL logs
docker-compose logs redis        # View Redis logs
```

## 🐛 Troubleshooting

### Docker not starting

```bash
# Make sure Docker Desktop is running
open -a Docker

# Check Docker status
docker --version
```

### Port already in use

```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 4000 (backend)
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database connection error

```bash
# Check if PostgreSQL is running
docker ps

# Check PostgreSQL logs
docker logs vetcare-postgres

# Verify connection string in apps/api/.env
DATABASE_URL="postgresql://vetcare_user:vetcare_password@localhost:5432/vetcare_db"
```

### Prisma errors

```bash
# Regenerate Prisma Client
cd apps/api
pnpm prisma generate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

## 📚 Next Steps

After setup is complete, you can:

1. **Explore the Code Structure**
   - Check `apps/web/src/app/` for Next.js pages
   - Check `apps/api/src/` for NestJS modules

2. **Start Development**
   - Begin with authentication system (Week 2 tasks)
   - Create user registration and login features

3. **Read Documentation**
   - [PROJECT_BUILDING_PLAN.md](../PROJECT_BUILDING_PLAN.md) - Technical architecture
   - [TASK_LIST.md](../TASK_LIST.md) - Development tasks

## 🆘 Need Help?

- Review the [Project Building Plan](../PROJECT_BUILDING_PLAN.md)
- Check the [Task List](../TASK_LIST.md) for detailed implementation steps
- Review Prisma documentation: https://www.prisma.io/docs
- Review NestJS documentation: https://docs.nestjs.com
- Review Next.js documentation: https://nextjs.org/docs

---

**Project Status:** ✅ Phase 1 Week 1 Complete - Ready for Development!
