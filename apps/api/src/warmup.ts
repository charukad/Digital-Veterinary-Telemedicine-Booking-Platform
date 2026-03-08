import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function warmup() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);

  console.log('🔄 Warming up database connections...');

  // Test database connection
  await prisma.$queryRaw`SELECT 1`;

  // Preload commonly used data
  await Promise.all([
    prisma.user.findFirst(),
    prisma.pet.findFirst(),
    prisma.appointment.findFirst(),
  ]);

  console.log('✅ Warmup complete');

  await app.close();
}

// Run warmup if this file is executed directly
if (require.main === module) {
  warmup()
    .catch((error) => {
      console.error('❌ Warmup failed:', error);
      process.exit(1);
    })
    .then(() => {
      process.exit(0);
    });
}

export { warmup };
