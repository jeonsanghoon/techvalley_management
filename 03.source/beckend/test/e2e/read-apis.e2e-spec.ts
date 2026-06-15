/// <reference types="jest" />

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { unwrapItems } from '../helpers/http.helper';

/** 프론트엔드 read API — GET 목록·집계 */
describe('Read APIs (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const authGet = (path: string) =>
    request(app.getHttpServer()).get(path).set(bearer(token));

  it('GET /api/dashboard/summary', async () => {
    const res = await authGet('/api/dashboard/summary').expect(200);
    expect(res.body.data?.kpis ?? res.body.kpis).toBeDefined();
  });

  it('GET /api/dashboard/trends', async () => {
    await authGet('/api/dashboard/trends').expect(200);
  });

  it('GET /api/alarms', async () => {
    const res = await authGet('/api/alarms').expect(200);
    expect(Array.isArray(unwrapItems(res))).toBe(true);
  });

  it('GET /api/alarm-rules', async () => {
    await authGet('/api/alarm-rules').expect(200);
  });

  it('GET /api/equipment', async () => {
    const res = await authGet('/api/equipment').expect(200);
    expect(unwrapItems(res).length).toBeGreaterThan(0);
  });

  it('GET /api/fleet/live', async () => {
    await authGet('/api/fleet/live').expect(200);
  });

  it('GET /api/pipeline/live', async () => {
    await authGet('/api/pipeline/live').expect(200);
  });

  it('GET /api/pipeline/collection-stats', async () => {
    await authGet('/api/pipeline/collection-stats').expect(200);
  });

  it('GET /api/metric-stream/latest', async () => {
    await authGet('/api/metric-stream/latest').expect(200);
  });

  it('GET /api/installation', async () => {
    await authGet('/api/installation').expect(200);
  });

  it('GET /api/service/as-records', async () => {
    await authGet('/api/service/as-records').expect(200);
  });

  it('GET /api/firmware/configs', async () => {
    await authGet('/api/firmware/configs').expect(200);
  });

  it('GET /api/iot/things', async () => {
    await authGet('/api/iot/things').expect(200);
  });

  it('GET /api/inspection/yields', async () => {
    await authGet('/api/inspection/yields').expect(200);
  });

  it('GET /api/inspection/algorithms', async () => {
    await authGet('/api/inspection/algorithms').expect(200);
  });

  it('GET /api/reports', async () => {
    await authGet('/api/reports').expect(200);
  });

  it('GET /api/remote/diagnostics', async () => {
    await authGet('/api/remote/diagnostics').expect(200);
  });

  it('GET /api/equipment-logs', async () => {
    await authGet('/api/equipment-logs').expect(200);
  });

  it('GET /api/sla/snapshots', async () => {
    await authGet('/api/sla/snapshots').expect(200);
  });

  it('GET /api/sla/definitions', async () => {
    await authGet('/api/sla/definitions').expect(200);
  });
});
