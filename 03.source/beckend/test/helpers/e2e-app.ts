import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/** E2E 테스트용 Nest 앱 — main.ts 와 동일한 파이프·prefix */
export async function createE2eApp(): Promise<INestApplication> {
  process.env.AUTH_ENABLED = 'true';
  process.env.AUTH_PROVIDER = 'local';
  process.env.AUTH_ALLOW_DEMO_LOGIN = 'true';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-jwt-secret';

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api', { exclude: ['health'] });
  await app.init();
  return app;
}
