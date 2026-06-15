import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health → 200 ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({ ok: true, service: 'techvalley-backend' });
  });
});
