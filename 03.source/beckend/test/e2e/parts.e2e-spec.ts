import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { partsOrderPkByOrderNo } from '../helpers/db.helper';
import { uniqueCode, unwrapData, unwrapItems } from '../helpers/http.helper';

describe('Parts CRUD (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let orderNo: string;
  let orderPk: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/parts/orders → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/parts/orders')
      .set(bearer(token))
      .expect(200);

    expect(Array.isArray(unwrapItems(res))).toBe(true);
  });

  it('POST /api/parts/orders → create', async () => {
    orderNo = uniqueCode('E2E-PO');
    const res = await request(app.getHttpServer())
      .post('/api/parts/orders')
      .set(bearer(token))
      .send({
        order_no: orderNo,
        device_code: 'HK-2024-00158',
        part_type_code: 'TUBE',
        quantity: 1,
        order_status: 'requested',
      })
      .expect(201);

    const data = unwrapData<{ id: string }>(res);
    expect(data.id).toBe(orderNo);

    orderPk = await partsOrderPkByOrderNo(orderNo);
    expect(orderPk).toBeTruthy();
  });

  it('PUT /api/parts/orders/:id → update', async () => {
    await request(app.getHttpServer())
      .put(`/api/parts/orders/${orderPk}`)
      .set(bearer(token))
      .send({ order_status: 'confirmed' })
      .expect(200);
  });

  it('GET /api/parts/schedules → list', async () => {
    await request(app.getHttpServer())
      .get('/api/parts/schedules')
      .set(bearer(token))
      .expect(200);
  });

  it('DELETE /api/parts/orders/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/api/parts/orders/${orderPk}`)
      .set(bearer(token))
      .expect(200);
  });
});
