# VetCare API - Complete Documentation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## 📚 API Documentation

**Swagger UI**: http://localhost:4000/api/docs

## 🏗️ Architecture

### Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (in-memory for dev)
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payments**: PayHere
- **Email**: Nodemailer

### Project Structure

```
src/
├── common/           # Shared utilities
│   ├── decorators/   # Custom decorators
│   ├── dto/          # Common DTOs
│   ├── filters/      # Exception filters
│   ├── guards/       # Auth guards
│   ├── interceptors/ # Response interceptors
│   └── services/     # Shared services
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── users/        # User management
│   ├── pets/         # Pet profiles
│   ├── appointments/ # Booking system
│   ├── payments/     # Payment processing
│   └── ...
└── prisma/           # Database schema
```

## 🔐 Authentication

All protected endpoints require JWT token:

```
Authorization: Bearer <token>
```

### User Roles

- `PET_OWNER`: Regular users
- `VETERINARIAN`: Vet professionals
- `ADMIN`: Platform administrators

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token

### Pets

- `GET /api/v1/pets` - List user's pets
- `POST /api/v1/pets` - Add new pet
- `GET /api/v1/pets/:id` - Get pet details
- `PATCH /api/v1/pets/:id` - Update pet
- `DELETE /api/v1/pets/:id` - Remove pet

### Appointments

- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Book appointment
- `PATCH /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Veterinarians

- `GET /api/v1/veterinarians` - Search vets
- `GET /api/v1/veterinarians/:id` - Vet profile
- `GET /api/v1/veterinarians/:id/availability` - Check availability

### Payments

- `POST /api/v1/payments/initiate` - Start payment
- `POST /api/v1/payments/webhook` - PayHere webhook
- `POST /api/v1/payments/refund` - Process refund

### Admin

- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/analytics/revenue` - Revenue analytics
- `GET /api/v1/admin/users` - User management

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker

```bash
docker build -t vetcare-api .
docker run -p 4000:4000 vetcare-api
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

### Environment Variables

See `.env.example` for all required variables.

## 📈 Monitoring

- **Health Check**: `/health`
- **Detailed Health**: `/health/detailed`
- **Metrics**: Integrated with performance interceptor

## 🔧 Development

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Code Generation

```bash
# Generate Prisma client
npx prisma generate

# Generate module
nest g module module-name

# Generate service
nest g service module-name
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
