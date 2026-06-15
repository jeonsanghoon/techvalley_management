import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { siteIdByDeviceCode } from '../helpers/db.helper';
import { unwrapData, unwrapItems } from '../helpers/http.helper';

describe('Installation CRUD (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let installationId: string;
  const deviceCode = 'HK-2024-00158';

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/installation → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/installation')
      .set(bearer(token))
      .expect(200);

    expect(unwrapItems(res).length).toBeGreaterThan(0);
  });

  it('POST /api/installation → create', async () => {
    const siteId = await siteIdByDeviceCode(deviceCode);
    const res = await request(app.getHttpServer())
      .post('/api/installation')
      .set(bearer(token))
      .send({
        device_code: deviceCode,
        site_id: siteId,
        installed_at: new Date().toISOString(),
        installer_note: 'E2E install test',
      })
      .expect(201);

    const data = unwrapData<{ id: string; equipmentSn: string }>(res);
    installationId = data.id;
    expect(data.equipmentSn).toBe(deviceCode);
  });

  it('GET /api/installation/:id → get one', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/installation/${installationId}`)
      .set(bearer(token))
      .expect(200);

    expect(unwrapData<{ id: string }>(res).id).toBe(installationId);
  });

  it('PUT /api/installation/:id → update', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/installation/${installationId}`)
      .set(bearer(token))
      .send({ installer_note: 'E2E updated note' })
      .expect(200);

    expect(unwrapData<{ id: string }>(res).id).toBe(installationId);
  });

  it('DELETE /api/installation/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/api/installation/${installationId}`)
      .set(bearer(token))
      .expect(200);
  });
});
