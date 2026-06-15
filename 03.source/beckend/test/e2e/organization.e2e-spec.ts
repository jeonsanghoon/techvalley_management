import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { companyPkByCode } from '../helpers/db.helper';
import { uniqueCode, unwrapData, unwrapItems } from '../helpers/http.helper';

describe('Organization CRUD (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let companyCode: string;
  let companyPk: number;

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/companies → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/companies')
      .set(bearer(token))
      .expect(200);

    const items = unwrapItems(res);
    expect(items.length).toBeGreaterThan(0);
  });

  it('POST /api/companies → create', async () => {
    companyCode = uniqueCode('E2E-CO');
    const res = await request(app.getHttpServer())
      .post('/api/companies')
      .set(bearer(token))
      .send({
        code: companyCode,
        company_name: `E2E Test Company ${companyCode}`,
        company_type: 'enterprise',
        region_label: '경기',
      })
      .expect(201);

    const data = unwrapData<{ id: string; name: string }>(res);
    expect(data.id).toBe(companyCode);
    expect(data.name).toContain('E2E Test Company');

    companyPk = await companyPkByCode(companyCode);
    expect(companyPk).toBeGreaterThan(0);
  });

  it('GET /api/companies/:id → get one', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/companies/${companyPk}`)
      .set(bearer(token))
      .expect(200);

    const data = unwrapData<{ id: string }>(res);
    expect(data.id).toBe(companyCode);
  });

  it('PUT /api/companies/:id → update', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/companies/${companyPk}`)
      .set(bearer(token))
      .send({ region_label: '서울' })
      .expect(200);

    const data = unwrapData<{ region: string }>(res);
    expect(data.region).toBe('서울');
  });

  it('DELETE /api/companies/:id → soft delete', async () => {
    await request(app.getHttpServer())
      .delete(`/api/companies/${companyPk}`)
      .set(bearer(token))
      .expect(200);
  });

  it('GET /api/sites → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/sites')
      .set(bearer(token))
      .expect(200);

    expect(unwrapItems(res).length).toBeGreaterThan(0);
  });
});
