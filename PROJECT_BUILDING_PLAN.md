# VetCare Sri Lanka - Web Application Building Plan

**Version:** 1.0  
**Date:** January 21, 2026  
**Document Type:** Technical Implementation Guide

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Project Structure](#project-structure)
6. [Development Phases](#development-phases)
7. [Setup Instructions](#setup-instructions)
8. [API Design](#api-design)
9. [Security Implementation](#security-implementation)
10. [Deployment Strategy](#deployment-strategy)
11. [Testing Strategy](#testing-strategy)
12. [Development Workflow](#development-workflow)

---

## 1. Project Overview

### 1.1 Project Goals

Build a comprehensive web application for VetCare Sri Lanka that enables:

- Pet owners to find and book veterinary appointments
- Veterinarians to manage their practice digitally
- Telemedicine consultations via video/audio
- Digital health records management
- Integrated payment processing

### 1.2 Initial MVP Scope

For the web application MVP, we'll focus on:

- ✅ User authentication (Pet Owners, Veterinarians, Admin)
- ✅ Profile management (Users + Pets)
- ✅ Veterinarian search and discovery
- ✅ Appointment booking system (In-clinic, Home Visit, Telemedicine)
- ✅ Basic telemedicine (Video/Audio calling)
- ✅ Payment integration (PayHere)
- ✅ Admin dashboard
- ✅ Health records management
- ✅ Digital prescriptions

### 1.3 Development Timeline

- **Phase 1-2:** 6 weeks (Foundation + Core Features)
- **Phase 3-4:** 6 weeks (Telemedicine + Payments)
- **Phase 5-6:** 4 weeks (Admin + Polish)
- **Total:** 16 weeks for MVP

---

## 2. Technology Stack

### 2.1 Frontend Stack

```yaml
Framework: Next.js 14 (App Router)
  - Server-side rendering for SEO
  - API routes for backend
  - Image optimization
  - Built-in routing

UI Framework: Tailwind CSS + shadcn/ui
  - Utility-first CSS
  - Pre-built accessible components
  - Customizable design system

State Management: Zustand
  - Lightweight and simple
  - TypeScript support
  - DevTools integration

Form Handling: React Hook Form + Zod
  - Type-safe validation
  - Performance optimized
  - Schema validation

Data Fetching: TanStack Query (React Query)
  - Caching and synchronization
  - Automatic background refetching
  - Optimistic updates

Real-time: Socket.io Client
  - WebSocket connections
  - Telemedicine chat
  - Real-time notifications

Video Calling: Agora SDK
  - WebRTC video/audio
  - Screen sharing
  - Recording capabilities

Maps: Google Maps API
  - Location search
  - Clinic finding
  - Route directions

Language: TypeScript
  - Type safety
  - Better IDE support
  - Reduced runtime errors
```

### 2.2 Backend Stack

```yaml
Runtime: Node.js 20 LTS
Framework: NestJS
  - Modular architecture
  - Built-in TypeScript
  - Dependency injection
  - Microservices ready

Database: PostgreSQL 16
  - Relational data
  - ACID compliance
  - JSON support
  - Full-text search

ORM: Prisma
  - Type-safe queries
  - Auto-generated types
  - Migration management
  - Admin UI

Cache: Redis
  - Session storage
  - Rate limiting
  - Queue management
  - Real-time pub/sub

File Storage: AWS S3 / Cloudinary
  - Image uploads
  - Document storage
  - CDN delivery
  - Image transformations

Authentication: JWT + Passport
  - Stateless auth
  - Multiple strategies
  - Role-based access

Payments: PayHere SDK
  - Local payment gateway
  - Card payments
  - Mobile wallets

SMS: Dialog SMS API
  - OTP verification
  - Appointment reminders
  - Notifications

Email: Resend / SendGrid
  - Transactional emails
  - Email templates
  - Delivery tracking

Real-time: Socket.io
  - WebSocket server
  - Room management
  - Event broadcasting

Video: Agora Server SDK
  - Token generation
  - Recording management
  - Cloud recording
```

### 2.3 DevOps & Tools

```yaml
Version Control: Git + GitHub
Package Manager: pnpm (faster than npm)
Code Quality: ESLint + Prettier
Testing: Jest + React Testing Library + Playwright
CI/CD: GitHub Actions
Containerization: Docker + Docker Compose
Hosting: Vercel (Frontend) + AWS/DigitalOcean (Backend)
Monitoring: Sentry (Errors) + Vercel Analytics
Database Hosting: Supabase / AWS RDS
```

---

## 3. System Architecture

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>Next.js App]
    end

    subgraph "API Gateway Layer"
        NEXT_API[Next.js API Routes]
        NEST[NestJS Backend<br/>REST + GraphQL]
    end

    subgraph "Service Layer"
        AUTH[Auth Service]
        USER[User Service]
        BOOKING[Booking Service]
        CONSULT[Consultation Service]
        PAYMENT[Payment Service]
        NOTIFY[Notification Service]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Main Database)]
        REDIS[(Redis<br/>Cache & Sessions)]
        S3[S3/Cloudinary<br/>File Storage]
    end

    subgraph "External Services"
        AGORA[Agora<br/>Video/Audio]
        PAYHERE[PayHere<br/>Payments]
        DIALOG[Dialog SMS<br/>OTP & Alerts]
        GOOGLE[Google Maps<br/>Location]
    end

    WEB -->|HTTPS| NEXT_API
    WEB -->|HTTPS| NEST
    WEB -.->|WebSocket| CONSULT

    NEXT_API --> AUTH
    NEXT_API --> USER

    NEST --> AUTH
    NEST --> USER
    NEST --> BOOKING
    NEST --> CONSULT
    NEST --> PAYMENT
    NEST --> NOTIFY

    AUTH --> POSTGRES
    USER --> POSTGRES
    BOOKING --> POSTGRES
    CONSULT --> POSTGRES
    PAYMENT --> POSTGRES

    AUTH --> REDIS
    CONSULT --> REDIS

    USER --> S3
    CONSULT --> S3

    CONSULT -.-> AGORA
    PAYMENT --> PAYHERE
    NOTIFY --> DIALOG
    USER --> GOOGLE
    BOOKING --> GOOGLE
```

### 3.2 Architecture Layers Explained

#### **Client Layer**

- Next.js 14 web application
- Responsive design for desktop, tablet, mobile
- Progressive Web App (PWA) capabilities
- Server-side rendering for SEO

#### **API Gateway Layer**

- Next.js API routes for simple endpoints
- NestJS backend for complex business logic
- GraphQL for flexible data fetching
- REST APIs for standard operations

#### **Service Layer** (Microservices-Ready)

Each service handles specific domain logic:

- **Auth Service:** Registration, login, JWT management, password reset
- **User Service:** Profiles (pet owners, vets, clinics), pet management
- **Booking Service:** Appointments, availability, scheduling, waitlist
- **Consultation Service:** Telemedicine sessions, chat, prescriptions
- **Payment Service:** Transaction processing, refunds, wallet
- **Notification Service:** Email, SMS, push notifications

#### **Data Layer**

- **PostgreSQL:** Primary relational database
- **Redis:** Caching, sessions, real-time queues
- **S3/Cloudinary:** Images, documents, videos

#### **External Services**

- **Agora:** Video/audio calling infrastructure
- **PayHere:** Payment gateway
- **Dialog SMS:** OTP and notifications
- **Google Maps:** Location and routing

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PET_OWNERS : "is_a"
    USERS ||--o{ VETERINARIANS : "is_a"
    USERS ||--o{ ADMINS : "is_a"

    PET_OWNERS ||--o{ PETS : "owns"
    PET_OWNERS ||--o{ ADDRESSES : "has"
    PET_OWNERS ||--o{ APPOINTMENTS : "books"

    VETERINARIANS ||--o{ VET_QUALIFICATIONS : "has"
    VETERINARIANS ||--o{ VET_SPECIALIZATIONS : "has"
    VETERINARIANS }o--o{ CLINICS : "works_at"
    VETERINARIANS ||--o{ AVAILABILITY_SLOTS : "has"
    VETERINARIANS ||--o{ APPOINTMENTS : "conducts"
    VETERINARIANS ||--o{ REVIEWS : "receives"

    PETS ||--o{ HEALTH_RECORDS : "has"
    PETS ||--o{ VACCINATIONS : "receives"
    PETS ||--o{ APPOINTMENTS : "attends"

    APPOINTMENTS ||--o| CONSULTATIONS : "has"
    APPOINTMENTS ||--o| PAYMENTS : "requires"

    CONSULTATIONS ||--o{ PRESCRIPTIONS : "generates"
    CONSULTATIONS ||--o{ CONSULTATION_FILES : "contains"
    CONSULTATIONS ||--o{ CHAT_MESSAGES : "includes"

    USERS {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        enum user_type
        enum status
        timestamp created_at
        timestamp updated_at
    }

    PET_OWNERS {
        uuid id PK
        uuid user_id FK
        string first_name
        string last_name
        string profile_image
        enum language_preference
        json preferences
    }

    VETERINARIANS {
        uuid id PK
        uuid user_id FK
        string license_number UK
        string bio
        decimal consultation_fee_clinic
        decimal consultation_fee_home
        decimal consultation_fee_online
        boolean verified
        decimal rating
        int review_count
    }

    PETS {
        uuid id PK
        uuid owner_id FK
        string name
        enum species
        string breed
        date date_of_birth
        enum gender
        decimal weight
        string microchip_id
        text allergies
        text chronic_conditions
        json medical_notes
    }

    CLINICS {
        uuid id PK
        string name
        string registration_number
        text address
        point location
        string phone
        string email
        json operating_hours
        enum status
    }

    APPOINTMENTS {
        uuid id PK
        uuid pet_id FK
        uuid vet_id FK
        uuid clinic_id FK
        uuid owner_id FK
        enum type
        enum status
        timestamp scheduled_at
        int duration_minutes
        text symptoms
        text notes
    }

    CONSULTATIONS {
        uuid id PK
        uuid appointment_id FK
        timestamp start_time
        timestamp end_time
        text diagnosis
        text treatment_plan
        text vet_notes
        string recording_url
        json agora_session_data
    }

    PRESCRIPTIONS {
        uuid id PK
        uuid consultation_id FK
        json medications
        text instructions
        date valid_until
        string signature_url
        enum status
    }

    PAYMENTS {
        uuid id PK
        uuid appointment_id FK
        uuid user_id FK
        decimal amount
        string currency
        enum payment_method
        enum status
        string transaction_id
        json gateway_response
        timestamp paid_at
    }

    HEALTH_RECORDS {
        uuid id PK
        uuid pet_id FK
        uuid vet_id FK
        enum record_type
        string title
        text description
        date record_date
        json attachments
    }

    VACCINATIONS {
        uuid id PK
        uuid pet_id FK
        uuid vet_id FK
        string vaccine_name
        string batch_number
        date administered_date
        date next_due_date
        string certificate_url
    }

    REVIEWS {
        uuid id PK
        uuid vet_id FK
        uuid user_id FK
        uuid appointment_id FK
        int rating
        text comment
        json photos
        text vet_response
        timestamp created_at
    }
```

### 4.2 Key Database Tables

#### **Core Tables**

**users**

- Primary authentication table
- Stores email, phone, password hash
- user_type: 'pet_owner' | 'veterinarian' | 'clinic_admin' | 'super_admin'

**pet_owners**

- Extended profile for pet owners
- One-to-one with users table

**veterinarians**

- Professional profile for vets
- License verification status
- Consultation fees for each service type

**pets**

- Pet profiles with medical information
- Belongs to pet_owner
- Supports multiple species

**clinics**

- Veterinary clinic information
- PostGIS point for location
- Operating hours in JSON

**appointments**

- Core booking table
- References pet, vet, clinic, owner
- type: 'in_clinic' | 'home_visit' | 'telemedicine' | 'emergency'
- status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

**consultations**

- Session details for each appointment
- Stores Agora session data
- Recording URL when enabled

**payments**

- Transaction records
- PayHere integration data
- status: 'pending' | 'completed' | 'failed' | 'refunded'

#### **Supporting Tables**

**addresses** - Multiple addresses for home visits  
**availability_slots** - Vet schedule management  
**vet_qualifications** - Education and certifications  
**vet_specializations** - Areas of expertise  
**clinic_vets** - Many-to-many relationship  
**prescriptions** - Digital prescriptions  
**health_records** - Medical history  
**vaccinations** - Vaccination tracking  
**chat_messages** - Telemedicine chat  
**consultation_files** - Shared files during consultation  
**reviews** - Vet ratings and reviews  
**notifications** - Notification queue  
**wallet_transactions** - In-app wallet  
**promocodes** - Discount codes

### 4.3 Indexing Strategy

```sql
-- Critical indexes for performance

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);

-- Appointments
CREATE INDEX idx_appointments_scheduled AT ON appointments(scheduled_at);
CREATE INDEX idx_appointments_vet_date ON appointments(vet_id, scheduled_at);
CREATE INDEX idx_appointments_owner ON appointments(owner_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Veterinarians
CREATE INDEX idx_vets_rating ON veterinarians(rating DESC);
CREATE INDEX idx_vets_verified ON veterinarians(verified);

-- Clinics
CREATE INDEX idx_clinics_location ON clinics USING GIST(location);

-- Pets
CREATE INDEX idx_pets_owner ON pets(owner_id);

-- Payments
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 5. Project Structure

### 5.1 Monorepo Structure

```
vetcare-sri-lanka/
├── apps/
│   ├── web/                      # Next.js web application
│   │   ├── src/
│   │   │   ├── app/              # Next.js 14 App Router
│   │   │   │   ├── (auth)/       # Authentication routes
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── verify/
│   │   │   │   ├── (dashboard)/  # Protected routes
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── pets/
│   │   │   │   │   ├── appointments/
│   │   │   │   │   ├── vets/
│   │   │   │   │   └── profile/
│   │   │   │   ├── (veterinarian)/ # Vet routes
│   │   │   │   │   ├── vet-dashboard/
│   │   │   │   │   ├── patients/
│   │   │   │   │   ├── schedule/
│   │   │   │   │   └── earnings/
│   │   │   │   ├── (admin)/      # Admin routes
│   │   │   │   │   └── admin/
│   │   │   │   ├── api/          # API routes
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── users/
│   │   │   │   │   └── webhooks/
│   │   │   │   ├── consultation/ # Telemedicine
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/       # React components
│   │   │   │   ├── ui/           # shadcn/ui components
│   │   │   │   ├── forms/        # Form components
│   │   │   │   ├── layout/       # Layout components
│   │   │   │   ├── booking/      # Booking flow
│   │   │   │   ├── telemedicine/ # Video call UI
│   │   │   │   └── shared/       # Shared components
│   │   │   ├── lib/              # Utilities
│   │   │   │   ├── api.ts        # API client
│   │   │   │   ├── auth.ts       # Auth helpers
│   │   │   │   ├── utils.ts      # General utilities
│   │   │   │   └── validations.ts # Zod schemas
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── store/            # Zustand stores
│   │   │   ├── types/            # TypeScript types
│   │   │   └── styles/           # Global styles
│   │   ├── public/               # Static assets
│   │   ├── prisma/               # Prisma (if using)
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                      # NestJS backend
│       ├── src/
│       │   ├── modules/          # Feature modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── strategies/
│       │   │   │   └── guards/
│       │   │   ├── users/
│       │   │   ├── pets/
│       │   │   ├── veterinarians/
│       │   │   ├── clinics/
│       │   │   ├── appointments/
│       │   │   ├── consultations/
│       │   │   ├── payments/
│       │   │   ├── prescriptions/
│       │   │   ├── health-records/
│       │   │   ├── notifications/
│       │   │   └── reviews/
│       │   ├── common/           # Shared code
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── utils/
│       │   ├── config/           # Configuration
│       │   │   ├── database.config.ts
│       │   │   ├── redis.config.ts
│       │   │   └── app.config.ts
│       │   ├── database/         # Database
│       │   │   ├── prisma/
│       │   │   │   └── schema.prisma
│       │   │   └── migrations/
│       │   ├── gateways/         # WebSocket gateways
│       │   │   ├── consultation.gateway.ts
│       │   │   └── notification.gateway.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/                 # E2E tests
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                     # Shared packages
│   ├── types/                    # Shared TypeScript types
│   ├── constants/                # Shared constants
│   ├── validations/              # Shared Zod schemas
│   └── ui/                       # Shared UI components (future)
│
├── docker/                       # Docker configs
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── .github/                      # GitHub configs
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/                         # Documentation
│   ├── api/                      # API documentation
│   ├── deployment/               # Deployment guides
│   └── development/              # Dev guides
│
├── scripts/                      # Utility scripts
│   ├── setup.sh
│   ├── seed-db.ts
│   └── migrate.sh
│
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
├── turbo.json                    # Turborepo config
├── README.md
└── package.json                  # Root package.json
```

### 5.2 Key Directory Explanations

**apps/web** - Next.js frontend

- Uses App Router for better performance
- Route groups for organization: `(auth)`, `(dashboard)`, `(veterinarian)`, `(admin)`
- API routes for simple backend operations
- Components organized by feature and type

**apps/api** - NestJS backend

- Modular architecture with feature modules
- Each module has controller, service, and module files
- Shared code in `common/`
- Prisma for database access

**packages/** - Shared code between apps

- `types` - TypeScript interfaces used by both frontend and backend
- `validations` - Zod schemas for consistent validation
- `constants` - Enums and constants

**docker/** - Containerization

- Separate Dockerfiles for each app
- docker-compose for local development

---

## 6. Development Phases

### Phase 1: Project Setup & Authentication (Week 1-2)

#### **Setup Tasks**

- [ ] Initialize monorepo with Turborepo/PNPM workspaces
- [ ] Set up Next.js 14 app with TypeScript
- [ ] Set up NestJS backend with TypeScript
- [ ] Configure PostgreSQL database
- [ ] Configure Redis
- [ ] Set up Prisma with schema
- [ ] Configure ESLint, Prettier
- [ ] Set up Docker Compose for local development

#### **Authentication Features**

- [ ] User registration (email + password)
- [ ] Email OTP verification
- [ ] Phone OTP verification (Dialog SMS)
- [ ] Login with JWT
- [ ] Password reset flow
- [ ] Social login (Google, Facebook) - Optional
- [ ] Role-based access control setup

#### **Deliverables**

- Working registration and login
- Protected routes
- User session management
- Database schema v1

---

### Phase 2: User Profiles & Pet Management (Week 3-4)

#### **Pet Owner Features**

- [ ] Complete profile form
- [ ] Profile image upload (S3/Cloudinary)
- [ ] Address management with Google Maps
- [ ] Language preference selection
- [ ] Pet profile creation
- [ ] Pet image upload
- [ ] Pet health information forms
- [ ] Multiple pet support
- [ ] Pet QR code generation

#### **Veterinarian Features**

- [ ] Professional profile setup
- [ ] License verification upload
- [ ] Specialization selection
- [ ] Clinic affiliation
- [ ] Consultation fee configuration
- [ ] Photo gallery upload
- [ ] Availability calendar setup
- [ ] Working hours configuration

#### **Deliverables**

- Complete profile management
- Pet CRUD operations
- Vet profile with verification pending
- File upload system working

---

### Phase 3: Search, Discovery & Booking (Week 5-7)

#### **Search & Discovery**

- [ ] Vet search with filters
- [ ] Location-based search (Google Maps)
- [ ] Filter by specialty, rating, price
- [ ] Sort by distance, rating, price
- [ ] Vet profile page
- [ ] Reviews and ratings display
- [ ] Availability calendar view

#### **Booking System**

- [ ] Appointment type selection
- [ ] Date and time slot picker
- [ ] Pet selection
- [ ] Symptom description form
- [ ] Booking summary
- [ ] Booking confirmation
- [ ] My appointments list
- [ ] Appointment details page
- [ ] Cancel appointment
- [ ] Reschedule appointment

#### **Vet Dashboard**

- [ ] Upcoming appointments view
- [ ] Patient queue
- [ ] Appointment details
- [ ] Accept/reject appointments
- [ ] Mark as completed
- [ ] Earnings overview

#### **Deliverables**

- Full booking flow working
- Vet can manage appointments
- Email/SMS notifications
- Calendar integration

---

### Phase 4: Telemedicine Module (Week 8-10)

#### **Video Consultation Setup**

- [ ] Agora.io integration
- [ ] Token generation (backend)
- [ ] Video call UI
- [ ] Audio-only mode
- [ ] Screen sharing
- [ ] Camera/mic controls
- [ ] Waiting room
- [ ] Connection quality indicator

#### **Chat System**

- [ ] Real-time chat (Socket.io)
- [ ] File sharing
- [ ] Image upload and preview
- [ ] Chat history
- [ ] Typing indicators
- [ ] Read receipts

#### **Consultation Management**

- [ ] Start consultation
- [ ] Consultation timer
- [ ] Consultation notes
- [ ] Save consultation data
- [ ] End consultation
- [ ] Post-consultation summary

#### **Digital Prescriptions**

- [ ] Prescription form
- [ ] Medication database
- [ ] Dosage calculator
- [ ] E-signature
- [ ] Prescription PDF generation
- [ ] Send to pet owner
- [ ] Prescription history

#### **Deliverables**

- Working video/audio calls
- Chat fully functional
- Prescriptions system
- Consultation records saved

---

### Phase 5: Payment Integration (Week 11-12)

#### **PayHere Integration**

- [ ] PayHere SDK setup
- [ ] Payment flow UI
- [ ] Create payment intents
- [ ] Process payments
- [ ] Webhook handling
- [ ] Payment confirmation
- [ ] Receipt generation
- [ ] Refund processing

#### **Wallet System**

- [ ] Create wallet for users
- [ ] Top-up wallet
- [ ] Pay from wallet
- [ ] Wallet transaction history
- [ ] Wallet balance display

#### **Financial Management**

- [ ] Vet earnings dashboard
- [ ] Transaction history
- [ ] Invoice generation
- [ ] Payout configuration
- [ ] Platform commission calculation

#### **Deliverables**

- End-to-end payment working
- Refunds working
- Wallet functional
- Vet can see earnings

---

### Phase 6: Admin Dashboard & Polish (Week 13-16)

#### **Admin Dashboard**

- [ ] User management (list, view, edit, suspend)
- [ ] Vet verification workflow
- [ ] Clinic verification
- [ ] Appointment overview
- [ ] Revenue analytics
- [ ] Platform metrics
- [ ] User growth charts
- [ ] Review moderation

#### **Health Records**

- [ ] View pet health timeline
- [ ] Upload health documents
- [ ] Vaccination tracking
- [ ] Vaccination reminders
- [ ] Export health records
- [ ] Share with vet

#### **Notifications**

- [ ] Email templates
- [ ] SMS templates
- [ ] Push notification setup
- [ ] Notification preferences
- [ ] In-app notification center

#### **Polish & Optimization**

- [ ] Responsive design refinement
- [ ] Loading states
- [ ] Error handling
- [ ] Form validation UX
- [ ] Success messages
- [ ] Empty states
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Accessibility audit

#### **Deliverables**

- Admin can manage platform
- Health records working
- Notification system complete
- Production-ready UI/UX

---

## 7. Setup Instructions

### 7.1 Prerequisites

```bash
# Required software
Node.js >= 20.x
pnpm >= 8.x
PostgreSQL >= 16
Redis >= 7.x
Docker & Docker Compose (for containerized setup)
Git
```

### 7.2 Local Development Setup

#### **Step 1: Clone Repository**

```bash
git clone https://github.com/your-org/vetcare-sri-lanka.git
cd vetcare-sri-lanka
```

#### **Step 2: Install Dependencies**

```bash
pnpm install
```

#### **Step 3: Environment Variables**

Create `.env` files:

**apps/web/.env.local**

```env
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Agora
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# PayHere
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=your_merchant_id
```

**apps/api/.env**

```env
# Application
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vetcare_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# AWS S3 (or Cloudinary)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=vetcare-uploads

# Agora
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# PayHere
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX=true

# Dialog SMS
DIALOG_SMS_API_KEY=your_dialog_api_key
DIALOG_SMS_SENDER_ID=VetCare

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@vetcare.lk

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### **Step 4: Database Setup**

**Option A: Docker (Recommended)**

```bash
docker-compose up -d postgres redis
```

**Option B: Local Installation**

```bash
# PostgreSQL
createdb vetcare_db

# Redis
redis-server
```

#### **Step 5: Run Migrations**

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

#### **Step 6: Seed Database (Optional)**

```bash
pnpm prisma db seed
```

#### **Step 7: Start Development Servers**

From root:

```bash
pnpm dev
```

This starts:

- Next.js at `http://localhost:3000`
- NestJS at `http://localhost:4000`

Or individually:

```bash
# Terminal 1: Frontend
cd apps/web
pnpm dev

# Terminal 2: Backend
cd apps/api
pnpm start:dev
```

### 7.3 Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose up --build

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

---

## 8. API Design

### 8.1 API Architecture

```
Base URL: https://api.vetcare.lk/v1
Authentication: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 8.2 Core API Endpoints

#### **Authentication**

```http
POST   /auth/register              # Register new user
POST   /auth/login                 # Login
POST   /auth/verify-email          # Verify email OTP
POST   /auth/verify-phone          # Verify phone OTP
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset password
POST   /auth/refresh-token         # Refresh JWT
POST   /auth/logout                # Logout
GET    /auth/me                    # Get current user
```

#### **Users**

```http
GET    /users/profile              # Get user profile
PUT    /users/profile              # Update profile
POST   /users/profile/avatar       # Upload avatar
DELETE /users/account              # Delete account
```

#### **Pet Owners**

```http
GET    /pet-owners/:id             # Get pet owner profile
PUT    /pet-owners/:id             # Update pet owner
POST   /pet-owners/addresses       # Add address
PUT    /pet-owners/addresses/:id   # Update address
DELETE /pet-owners/addresses/:id   # Delete address
```

#### **Pets**

```http
GET    /pets                       # List my pets
POST   /pets                       # Create pet
GET    /pets/:id                   # Get pet details
PUT    /pets/:id                   # Update pet
DELETE /pets/:id                   # Delete pet
POST   /pets/:id/image             # Upload pet image
GET    /pets/:id/health-timeline   # Health timeline
GET    /pets/:id/qr-code           # Generate QR code
```

#### **Veterinarians**

```http
GET    /veterinarians              # Search vets (public)
GET    /veterinarians/:id          # Get vet profile
PUT    /veterinarians/:id          # Update vet profile
POST   /veterinarians/documents    # Upload verification docs
GET    /veterinarians/:id/reviews  # Get reviews
GET    /veterinarians/:id/availability # Get availability
PUT    /veterinarians/availability # Update availability
```

#### **Clinics**

```http
GET    /clinics                    # List clinics
GET    /clinics/:id                # Get clinic details
POST   /clinics                    # Create clinic (admin)
PUT    /clinics/:id                # Update clinic
GET    /clinics/nearby             # Find nearby clinics
```

#### **Appointments**

```http
GET    /appointments               # List appointments
POST   /appointments               # Create appointment
GET    /appointments/:id           # Get appointment
PUT    /appointments/:id           # Update appointment
DELETE /appointments/:id           # Cancel appointment
POST   /appointments/:id/confirm   # Confirm (vet)
POST   /appointments/:id/complete  # Complete (vet)
GET    /appointments/upcoming      # Upcoming appointments
GET    /appointments/past          # Past appointments
```

#### **Consultations**

```http
POST   /consultations/:appointmentId/start  # Start consultation
PUT    /consultations/:id/notes             # Update notes
POST   /consultations/:id/end               # End consultation
GET    /consultations/:id                   # Get consultation
POST   /consultations/:id/files             # Upload file
POST   /consultations/:id/agora-token       # Get Agora token
```

#### **Prescriptions**

```http
POST   /prescriptions                       # Create prescription
GET    /prescriptions/:id                   # Get prescription
GET    /prescriptions/:id/pdf               # Download PDF
GET    /pets/:petId/prescriptions           # Pet prescriptions
```

#### **Payments**

```http
POST   /payments/initiate                   # Initiate payment
POST   /payments/confirm                    # Confirm payment
GET    /payments/:id                        # Get payment
POST   /payments/:id/refund                 # Refund
GET    /payments/history                    # Payment history
POST   /payments/webhook/payhere            # PayHere webhook
```

#### **Reviews**

```http
POST   /reviews                             # Create review
GET    /reviews/:id                         # Get review
PUT    /reviews/:id                         # Update review
DELETE /reviews/:id                         # Delete review
POST   /reviews/:id/response                # Vet response
```

#### **Chat**

```http
WebSocket /ws/consultation/:consultationId  # Chat WebSocket
GET    /chat/:consultationId/messages       # Get chat history
```

#### **Admin**

```http
GET    /admin/users                # List all users
PUT    /admin/users/:id/verify     # Verify veterinarian
PUT    /admin/users/:id/suspend    # Suspend user
GET    /admin/analytics            # Platform analytics
GET    /admin/appointments         # All appointments
```

### 8.3 Request/Response Examples

#### **Create Appointment**

**Request:**

```http
POST /v1/appointments
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "petId": "uuid-123",
  "veterinarianId": "uuid-456",
  "clinicId": "uuid-789",
  "type": "telemedicine",
  "scheduledAt": "2026-01-25T10:00:00Z",
  "symptoms": "Pet has been coughing for 3 days",
  "notes": "First time consultation"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-appointment",
    "petId": "uuid-123",
    "veterinarianId": "uuid-456",
    "clinicId": "uuid-789",
    "type": "telemedicine",
    "status": "pending",
    "scheduledAt": "2026-01-25T10:00:00Z",
    "durationMinutes": 30,
    "symptoms": "Pet has been coughing for 3 days",
    "createdAt": "2026-01-21T13:30:00Z",
    "pet": {
      "id": "uuid-123",
      "name": "Max",
      "species": "dog",
      "breed": "Golden Retriever"
    },
    "veterinarian": {
      "id": "uuid-456",
      "name": "Dr. Silva",
      "specialization": "General Practice"
    }
  }
}
```

### 8.4 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "scheduledAt",
        "message": "Appointment time must be in the future"
      }
    ]
  },
  "timestamp": "2026-01-21T13:30:00Z"
}
```

### 8.5 WebSocket Events

#### **Consultation Chat**

```javascript
// Client -> Server
socket.emit("message:send", {
  consultationId: "uuid",
  message: "Hello doctor",
  type: "text",
});

// Server -> Client
socket.on("message:received", {
  id: "msg-uuid",
  senderId: "user-uuid",
  senderName: "John Doe",
  message: "Hello",
  type: "text",
  timestamp: "2026-01-21T13:30:00Z",
});

// Typing indicator
socket.emit("typing:start", { consultationId: "uuid" });
socket.emit("typing:stop", { consultationId: "uuid" });
```

---

## 9. Security Implementation

### 9.1 Authentication & Authorization

#### **JWT Strategy**

```typescript
// Token payload structure
{
  sub: userId,
  email: user.email,
  role: user.userType,
  iat: timestamp,
  exp: timestamp
}

// Token expiration
Access Token: 15 minutes
Refresh Token: 7 days
```

#### **Role-Based Access Control**

```typescript
// Decorators for route protection
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('veterinarian', 'admin')
async getVetDashboard() { }

// Roles hierarchy
- super_admin > clinic_admin > veterinarian > pet_owner
```

### 9.2 Data Security

#### **Password Hashing**

```typescript
// Using bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

#### **Data Encryption**

```typescript
// Sensitive data encryption at rest
- Social Security Numbers
- Payment information
- Medical records

// Use AES-256-GCM
```

#### **API Security**

```typescript
// Rate limiting
@Throttle(10, 60) // 10 requests per minute
async login() { }

// CORS configuration
cors: {
  origin: process.env.FRONTEND_URL,
  credentials: true
}

// Helmet for security headers
app.use(helmet());
```

### 9.3 Input Validation

```typescript
// Using Zod for validation
const CreatePetSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.enum(['dog', 'cat', 'bird', 'other']),
  breed: z.string().max(100),
  dateOfBirth: z.coerce.date().max(new Date()),
  weight: z.number().positive().max(500)
});

// Automatic validation
@Body(new ZodValidationPipe(CreatePetSchema))
```

### 9.4 File Upload Security

```typescript
// File type validation
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// File size limits
const maxFileSize = 10 * 1024 * 1024; // 10MB

// Sanitize filenames
const sanitizedFilename = sanitizeFilename(originalFilename);

// Scan for malware (ClamAV integration)
await scanFile(fileBuffer);
```

### 9.5 SQL Injection Prevention

```typescript
// Prisma uses parameterized queries
await prisma.user.findMany({
  where: {
    email: userInput, // Safe, parameterized
  },
});

// Never use raw SQL unless absolutely necessary
```

### 9.6 XSS Prevention

```typescript
// Sanitize HTML input
import DOMPurify from "isomorphic-dompurify";

const clean = DOMPurify.sanitize(userInput);

// Set CSP headers
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
});
```

---

## 10. Deployment Strategy

### 10.1 Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        CLOUDFLARE[CloudFlare CDN]

        subgraph "Frontend"
            VERCEL[Vercel<br/>Next.js App]
        end

        subgraph "Backend"
            LB[Load Balancer]
            API1[NestJS Instance 1]
            API2[NestJS Instance 2]
        end

        subgraph "Data Layer"
            RDS[(AWS RDS<br/>PostgreSQL)]
            ELASTICACHE[(ElastiCache<br/>Redis)]
            S3[S3 Storage]
        end

        subgraph "Monitoring"
            SENTRY[Sentry<br/>Error Tracking]
            DATADOG[DataDog<br/>APM]
        end
    end

    CLOUDFLARE --> VERCEL
    CLOUDFLARE --> LB
    LB --> API1
    LB --> API2
    API1 --> RDS
    API2 --> RDS
    API1 --> ELASTICACHE
    API2 --> ELASTICACHE
    API1 --> S3
    API2 --> S3

    API1 -.-> SENTRY
    API2 -.-> SENTRY
    VERCEL -.-> SENTRY
    API1 -.-> DATADOG
    API2 -.-> DATADOG
```

### 10.2 Frontend Deployment (Vercel)

**Why Vercel:**

- Optimized for Next.js
- Automatic HTTPS
- Global CDN
- Zero-config deployments
- Preview deployments for PRs

**Setup:**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd apps/web
vercel --prod
```

**Environment Variables:**
Set in Vercel dashboard or via CLI:

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

### 10.3 Backend Deployment Options

#### **Option A: AWS EC2 + Docker**

**Setup:**

```bash
# On EC2 instance
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo
git clone https://github.com/your-org/vetcare.git
cd vetcare

# Build and run
docker-compose -f docker-compose.prod.yml up -d
```

**docker-compose.prod.yml:**

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=${REDIS_HOST}
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - api
    restart: always
```

#### **Option B: DigitalOcean App Platform**

**Setup:**

```yaml
# app.yaml
name: vetcare-api
region: sgp

services:
  - name: api
    github:
      repo: your-org/vetcare
      branch: main
      deploy_on_push: true
    build_command: cd apps/api && pnpm install && pnpm build
    run_command: cd apps/api && pnpm start:prod
    environment_slug: node-js
    instance_size_slug: professional-xs
    instance_count: 2

databases:
  - name: vetcare-db
    engine: PG
    version: "16"

  - name: vetcare-redis
    engine: REDIS
    version: "7"
```

### 10.4 Database Deployment

#### **PostgreSQL on AWS RDS**

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier vetcare-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16 \
  --master-username postgres \
  --master-user-password <password> \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxxxx

# Connection string
postgresql://postgres:<password>@vetcare-prod.xxxxx.rds.amazonaws.com:5432/vetcare
```

#### **Redis on ElastiCache**

```bash
# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id vetcare-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 10.5 CI/CD Pipeline

**GitHub Actions Workflow:**

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          working-directory: ./apps/web

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -f docker/Dockerfile.api -t vetcare-api:latest .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag vetcare-api:latest ${{ secrets.DOCKER_REGISTRY }}/vetcare-api:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/vetcare-api:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/vetcare
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

### 10.6 Environment Management

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**Never commit .env files to git!**

Use secrets management:

- AWS Secrets Manager
- HashiCorp Vault
- Vercel Environment Variables
- GitHub Secrets

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
                 /\
                /  \
               / E2E \          5% - End-to-End Tests
              /______\
             /        \
            /Integration\       15% - Integration Tests
           /____________\
          /              \
         /  Unit  Tests   \    80% - Unit Tests
        /__________________\
```

### 11.2 Unit Tests

**Frontend (Jest + React Testing Library):**

```typescript
// components/PetCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PetCard } from './PetCard';

describe('PetCard', () => {
  it('renders pet name', () => {
    const pet = { id: '1', name: 'Max', species: 'dog' };
    render(<PetCard pet={pet} />);
    expect(screen.getByText('Max')).toBeInTheDocument();
  });
});
```

**Backend (Jest):**

```typescript
// modules/appointments/appointments.service.spec.ts
describe("AppointmentsService", () => {
  it("creates appointment successfully", async () => {
    const appointment = await service.create(createAppointmentDto);
    expect(appointment).toBeDefined();
    expect(appointment.status).toBe("pending");
  });
});
```

### 11.3 Integration Tests

```typescript
// test/appointments.e2e-spec.ts
describe("Appointments API (e2e)", () => {
  it("/POST appointments", () => {
    return request(app.getHttpServer())
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(createAppointmentDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.data.id).toBeDefined();
      });
  });
});
```

### 11.4 E2E Tests (Playwright)

```typescript
// e2e/booking-flow.spec.ts
import { test, expect } from "@playwright/test";

test("complete booking flow", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill("[name=email]", "test@example.com");
  await page.fill("[name=password]", "password");
  await page.click("button[type=submit]");

  // Search vet
  await page.goto("/vets");
  await page.fill("[name=search]", "Dr. Silva");
  await page.click("text=Search");

  // Book appointment
  await page.click("text=Book Appointment");
  await page.selectOption("[name=appointmentType]", "telemedicine");
  await page.click("text=Confirm Booking");

  // Verify success
  await expect(page.locator("text=Booking Confirmed")).toBeVisible();
});
```

### 11.5 Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Critical paths
- E2E Tests: Main user flows

---

## 12. Development Workflow

### 12.1 Git Workflow

**Branching Strategy:**

```
main (production)
  ├── staging
  └── development
      ├── feature/user-authentication
      ├── feature/booking-system
      └── bugfix/payment-validation
```

**Commit Convention:**

```bash
feat: add user registration
fix: resolve payment gateway timeout
docs: update API documentation
refactor: optimize database queries
test: add unit tests for booking service
chore: update dependencies
```

### 12.2 Code Review Process

1. Create feature branch
2. Implement feature with tests
3. Push and create Pull Request
4. Automated CI runs (lint, test, build)
5. Code review by team member
6. Address feedback
7. Merge to development
8. Deploy to staging
9. QA testing
10. Merge to main
11. Deploy to production

### 12.3 Development Best Practices

**Code Style:**

- Use ESLint + Prettier
- Follow TypeScript strict mode
- Write self-documenting code
- Add comments for complex logic

**Component Design:**

- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries
- Handle loading and error states

**API Design:**

- RESTful conventions
- Consistent response format
- Proper HTTP status codes
- Comprehensive error messages

**Database:**

- Use migrations for schema changes
- Index frequently queried columns
- Avoid N+1 queries
- Use transactions for data integrity

---

## Summary & Next Steps

### What We've Defined

✅ **Complete Technology Stack** - Modern, scalable technologies  
✅ **System Architecture** - Microservices-ready design  
✅ **Database Design** - Comprehensive ER diagram with 20+ tables  
✅ **Project Structure** - Organized monorepo with clear separation  
✅ **Development Phases** - 16-week roadmap with clear deliverables  
✅ **API Design** - RESTful endpoints with WebSocket support  
✅ **Security Strategy** - Authentication, authorization, data protection  
✅ **Deployment Plan** - Cloud-native with CI/CD  
✅ **Testing Strategy** - Unit, integration, E2E testing  
✅ **Development Workflow** - Git branching and code review process

### Immediate Next Steps

1. **Setup Development Environment**
   - Install prerequisites
   - Initialize Git repository
   - Set up monorepo structure

2. **Phase 1 Development Start**
   - Initialize Next.js and NestJS
   - Set up PostgreSQL and Redis
   - Implement authentication

3. **Team Coordination**
   - Assign developers to modules
   - Set up project management (Jira/Linear)
   - Schedule daily standups

### Recommended Team Structure

**For MVP (16 weeks):**

- 2 Frontend Developers
- 2 Backend Developers
- 1 Full-Stack Developer
- 1 UI/UX Designer
- 1 QA Engineer
- 1 DevOps Engineer
- 1 Project Manager

**Alternatively (Solo/Small Team):**

- Follow phases sequentially
- Use managed services (Supabase, Vercel)
- Leverage AI coding assistants
- Focus on MVP features first

---

**Document Status:** Ready for Implementation  
**Last Updated:** January 21, 2026  
**Version:** 1.0

_This document should be treated as a living guide and updated as the project evolves._
