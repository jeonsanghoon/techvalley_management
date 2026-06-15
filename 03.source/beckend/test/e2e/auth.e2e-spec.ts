/// <reference types="jest" />

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/auth/config → local provider', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/config').expect(200);
    expect(res.body.provider).toBe('local');
  });

  it('GET /api/auth/users → demo accounts', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/users').expect(200);
    const items = res.body.data?.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login → tokens + user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ userId: 'USR-TV-OPS', password: 'demo-password' })
      .expect(201);

    const payload = res.body.data ?? res.body;
    expect(payload.user).toBeDefined();
    expect(payload.user.id).toBe('USR-TV-OPS');
    expect(payload.tokens.accessToken).toBeTruthy();
    expect(payload.tokens.refreshToken).toBeTruthy();
    expect(payload.provider).toBe('local');
  });

  it('GET /api/dashboard/summary without token → 401', async () => {
    await request(app.getHttpServer()).get('/api/dashboard/summary').expect(401);
  });

  it('GET /api/auth/me with token → current user', async () => {
    const tokens = await loginAsOps(app);
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set(bearer(tokens.accessToken))
      .expect(200);

    expect(res.body.user.id).toBe('USR-TV-OPS');
    expect(res.body.claims.sub).toBeTruthy();
  });

  it('POST /api/auth/refresh → new access token', async () => {
    const tokens = await loginAsOps(app);
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(201);

    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });
});
