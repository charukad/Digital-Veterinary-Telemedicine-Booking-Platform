# VetCare API - Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] Run all tests
- [ ] Check for TypeScript errors
- [ ] Review security settings
- [ ] Update environment variables
- [ ] Review database migrations
- [ ] Backup current database

### Environment Variables (Production)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/vetcare_prod"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Email (Resend/SendGrid)
EMAIL_SERVICE="resend"
EMAIL_API_KEY="your-email-api-key"
EMAIL_FROM="noreply@vetcare.lk"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# PayHere
PAYHERE_MERCHANT_ID="your-merchant-id"
PAYHERE_MERCHANT_SECRET="your-merchant-secret"
PAYHERE_MODE="LIVE"

# Application
NODE_ENV="production"
PORT=4000
API_PREFIX="api/v1"
FRONTEND_URL="https://vetcare.lk"

# Redis (if using)
REDIS_URL="redis://host:6379"
```

### Build Commands

```bash
# Install dependencies
npm install --production

# Build the application
npm run build

# Database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Start Commands

```bash
# Production mode
npm run start:prod

# With PM2 (recommended)
pm2 start dist/main.js --name vetcare-api
pm2 save
pm2 startup
```

### Health Checks

After deployment, verify:

- `GET /health` - Basic health
- `GET /health/detailed` - Detailed with DB check
- `GET /health/ready` - Kubernetes readiness
- `GET /health/live` - Kubernetes liveness
- `GET /api/docs` - Swagger documentation

### Monitoring

Set up monitoring for:

- API response times
- Error rates
- Database connections
- Memory usage
- Active users
- Background jobs

### Scaling

Horizontal scaling recommendations:

- Use load balancer (Nginx/AWS ALB)
- Database connection pooling
- Redis for session management
- CDN for static assets
- Separate worker processes for cron jobs

### Security

Production security checklist:

- ✅ HTTPS enabled
- ✅ Rate limiting active
- ✅ Helmet security headers
- ✅ Input sanitization
- ✅ JWT secrets strong
- ✅ Database encrypted
- ✅ Environment variables secured
- ✅ CORS properly configured

### Backup Strategy

Daily backups:

- Database (automated)
- Uploaded files (Cloudinary handles)
- Environment configurations
- SSL certificates

### Rollback Plan

In case of issues:

1. Keep previous deployment
2. Database migration rollback ready
3. Load balancer quick switch
4. Monitor error logs

## 📊 Performance Targets

- API response time: < 200ms (95th percentile)
- Database query time: < 50ms
- Uptime: 99.9%
- Concurrent users: 1000+

## 🔧 Troubleshooting

Common issues and solutions documented in `/docs/troubleshooting.md`
