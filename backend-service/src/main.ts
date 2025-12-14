import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'firebase-admin';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import 'dotenv/config';
import { CookieOptions } from 'express';
import { GlobalExceptionFilter } from './common/filters';

// Initialize Firebase Admin
export const admin = fs.initializeApp({
  credential: fs.credential.cert('serviceAccount.json'),
});

// Cookie configuration
export const duration = 1000 * 3600 * 24 * parseInt(process.env.COOKIES_EXP || '7');
export const cookieOptions: CookieOptions = {
  maxAge: duration,
  httpOnly: true,
  signed: true,
  expires: new Date(Date.now() + duration),
  secure: process.env.ENV_TYPE === 'PROD',
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // API prefix for all routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', '/health'], // Exclude root and health check
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GeoTsuiseki API')
    .setDescription(`
## Product Tracking & Partner Management API

This API provides endpoints for:
- **Authentication** - User login, registration, password reset
- **Partners** - Partner management and approval workflow
- **Products** - Product CRUD operations
- **QR Scanning** - Product scanning and history tracking
- **Users** - User management (admin only)

### Authentication
Most endpoints require authentication via session cookie. Use the \`/api/v1/auth/login\` endpoint to authenticate.
    `)
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management (Admin only)')
    .addTag('partners', 'Partner management')
    .addTag('products', 'Product operations')
    .addTag('history', 'Scan history')
    .addCookieAuth('session')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'GeoTsuiseki API Documentation',
  });

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  // Middleware
  app.use(cookieParser(process.env.COOKIE_SECRET ?? 'secret'));
  app.use(
    session({
      secret: process.env.COOKIE_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(helmet());

  // Global filters and pipes
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

