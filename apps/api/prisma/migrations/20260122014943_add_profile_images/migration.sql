-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "refresh_token" TEXT;

-- AlterTable
ALTER TABLE "veterinarians" ADD COLUMN     "profile_image" TEXT;
