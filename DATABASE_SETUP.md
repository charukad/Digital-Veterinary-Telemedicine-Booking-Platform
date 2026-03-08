# Database Connection Configuration Fix

## Issue

The `.env` file in `apps/api/` has incorrect database connection settings.

## Solution

1. **Open the file:** `apps/api/.env`

2. **Update the DATABASE_URL** to:

```env
DATABASE_URL="postgresql://vetcare_user:vetcare_password@localhost:5432/vetcare_db"
```

3. **Verify other settings** are present:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
```

## After Updating

Run this command to apply database migrations:

```bash
cd apps/api
pnpm prisma migrate dev --name init
```

This will create all database tables from the Prisma schema.

## Current Status

✅ Docker containers running (postgres + redis)
✅ Database `vetcare_db` created  
✅ PostgreSQL ready on port 5432
❌ Waiting for correct DATABASE_URL in .env file

## Database Credentials

- **Host:** localhost
- **Port:** 5432
- **Database:** vetcare_db
- **User:** vetcare_user
- **Password:** vetcare_password
