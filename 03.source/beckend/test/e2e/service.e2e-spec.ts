import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { serviceTicketPkByTicketNo } from '../helpers/db.helper';
import { uniqueCode, unwrapData, unwrapItems } from '../helpers/http.helper';

describe('Service Desk CRUD (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let ticketNo: string;
  let ticketPk: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/service/tickets → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/service/tickets')
      .set(bearer(token))
      .expect(200);

    expect(Array.isArray(unwrapItems(res))).toBe(true);
  });

  it('POST /api/service/tickets → create', async () => {
    ticketNo = uniqueCode('E2E-TKT');
    const res = await request(app.getHttpServer())
      .post('/api/service/tickets')
      .set(bearer(token))
      .send({
        ticket_no: ticketNo,
        device_code: 'HK-2024-00158',
        title: 'E2E test ticket',
        description: 'Automated test',
        priority_type: 2,
      })
      .expect(201);

    const data = unwrapData<{ id: string; equipmentSn: string }>(res);
    expect(data.id).toBe(ticketNo);
    expect(data.equipmentSn).toBe('HK-2024-00158');

    ticketPk = await serviceTicketPkByTicketNo(ticketNo);
    expect(ticketPk).toBeTruthy();
  });

  it('GET /api/service/tickets/:id → get one', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/service/tickets/${ticketPk}`)
      .set(bearer(token))
      .expect(200);

    expect(unwrapData<{ id: string }>(res).id).toBe(ticketNo);
  });

  it('PUT /api/service/tickets/:id → update status', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/service/tickets/${ticketPk}`)
      .set(bearer(token))
      .send({ ticket_status: 'assigned', title: 'E2E updated' })
      .expect(200);

    expect(unwrapData<{ id: string }>(res).id).toBe(ticketNo);
  });

  it('GET /api/service/engineers → list', async () => {
    await request(app.getHttpServer())
      .get('/api/service/engineers')
      .set(bearer(token))
      .expect(200);
  });

  it('DELETE /api/service/tickets/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/api/service/tickets/${ticketPk}`)
      .set(bearer(token))
      .expect(200);
  });
});
