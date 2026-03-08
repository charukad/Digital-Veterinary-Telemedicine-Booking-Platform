import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security - Helmet middleware
  app.use(helmet());

  // Enable CORS with enhanced configuration
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001', // Admin panel
      'http://localhost:3002', // Mobile dev server
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe with sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('VetCare Sri Lanka API')
    .setDescription('Comprehensive veterinary care management platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('Pets', 'Pet profile and management')
    .addTag('Veterinarians', 'Veterinarian profiles and services')
    .addTag('Appointments', 'Appointment booking and management')
    .addTag('Medical Records', 'Pet medical records and history')
    .addTag('Prescriptions', 'Digital prescriptions')
    .addTag('Payments', 'Payment processing and billing')
    .addTag('Reviews', 'Reviews and ratings')
    .addTag('Notifications', 'Notification management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 VetCare API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📚 API Prefix: ${process.env.API_PREFIX || 'api/v1'}}`);
}
bootstrap();
