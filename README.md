# VetCare Sri Lanka

A comprehensive digital veterinary telemedicine and booking platform for Sri Lanka.

## 🎯 Project Overview

VetCare Sri Lanka connects pet owners with licensed veterinarians through both in-person appointments and remote telemedicine consultations, making quality veterinary care accessible across Sri Lanka.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- PostgreSQL >= 16
- Redis >= 7.x
- Docker & Docker Compose (optional)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
docker-compose up -d postgres redis

# Run migrations
cd apps/api
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

## 📁 Project Structure

```
vetcare-sri-lanka/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── constants/    # Shared constants
│   └── validations/  # Shared Zod schemas
├── docker/           # Docker configurations
├── scripts/          # Utility scripts
└── docs/             # Documentation
```

## 🛠️ Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- React Query (Data Fetching)

### Backend

- NestJS
- PostgreSQL + Prisma
- Redis
- Socket.io (Real-time)
- Agora (Video Calling)

## 📚 Documentation

- [Project Building Plan](./PROJECT_BUILDING_PLAN.md)
- [Task List](./TASK_LIST.md)
- [Project Analysis](./VetCare_Project_Analysis_and_Improvements.md)
- [Project Information](./information.md)

## 🔗 Links

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api

## 👥 Team

- Development Team: VetCare Development Team
- Project Manager: TBD

## 📄 License

Proprietary - VetCare Sri Lanka © 2026

---

**Status:** 🚧 In Development (Phase 1: Week 1)
# Digital-Veterinary-Telemedicine-Booking-Platform
