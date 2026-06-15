/**
 * @file main.ts
 * @description NestJS 애플리케이션 부트스트랩 진입점.
 *
 * - 전역 prefix: `/api` (health 제외)
 * - ValidationPipe: DTO class-validator 검증 + whitelist/transform
 * - CORS: 프론트엔드(localhost:3000 등) cross-origin 허용
 * - 기본 포트: 3002 (`PORT` env로 변경 가능)
 */
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api', { exclude: ['health'] });
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
  console.log(`techvalley-backend (NestJS) http://localhost:${port}`);
}

bootstrap();
