Development:
Start Docker (if not running):
bash
docker-compose up -d
Run Database Migration:
bash
cd apps/api
pnpm prisma migrate dev --name init
Start Development:
bash
pnpm dev
Frontend: http://localhost:3000
Backend: http://localhost:4000
Ready to proceed with Phase 1 Week 2: Authentication System!

Endpoints Created:

POST /api/v1/pets - Add new pet
GET /api/v1/pets - List all user's pets
GET /api/v1/pets/:id - Get pet details (with health records & vaccinations)
PATCH /api/v1/pets/:id - Update pet info
DELETE /api/v1/pets/:id - Delete pet
GET /api/v1/veterinarians/profile - Get own profile
PATCH /api/v1/veterinarians/profile - Update profile
GET /api/v1/veterinarians - Search vets (with filters)
GET /api/v1/veterinarians/:id - Public vet profile
POST /reviews - Submit review
GET /reviews/veterinarian/:id - Get vet reviews + avg rating
GET /reviews/my-reviews - Get own reviews
PATCH /reviews/:id - Update review
DELETE /reviews/:id - Delete review
POST /reviews - Submit review
GET /reviews/veterinarian/:id - Get vet reviews + avg rating
GET /reviews/my-reviews - Get own reviews
PATCH /reviews/:id - Update review
DELETE /reviews/:id - Delete review