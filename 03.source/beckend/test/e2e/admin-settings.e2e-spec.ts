import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/e2e-app';
import { bearer, loginAsOps } from '../helpers/auth.helper';
import { commonCodePk, notificationChannelPkByCode } from '../helpers/db.helper';
import { uniqueCode, unwrapData, unwrapItems } from '../helpers/http.helper';

describe('Admin & Settings CRUD (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let mainCode: string;
  let subCode: number;
  let codePk: number;
  let channelCode: string;
  let channelPk: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const tokens = await loginAsOps(app);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/admin/users → list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/users')
      .set(bearer(token))
      .expect(200);

    expect(unwrapItems(res).length).toBeGreaterThan(0);
  });

  it('POST /api/admin/codes → create common code', async () => {
    mainCode = 'E2ET';
    subCode = Math.floor(Date.now() % 1_000_000);
    const res = await request(app.getHttpServer())
      .post('/api/admin/codes')
      .set(bearer(token))
      .send({
        main_code: mainCode,
        sub_code: subCode,
        code_name: 'E2E Test Code',
        order_seq: 99,
      })
      .expect(201);

    const data = unwrapData<{ id: string }>(res);
    expect(data.id).toBe(`${mainCode}-${subCode}`);

    codePk = await commonCodePk(mainCode, subCode);
    expect(codePk).toBeGreaterThan(0);
  });

  it('PUT /api/admin/codes/:id → update', async () => {
    await request(app.getHttpServer())
      .put(`/api/admin/codes/${codePk}`)
      .set(bearer(token))
      .send({ code_name: 'E2E Updated' })
      .expect(200);
  });

  it('GET /api/settings/notification-channels → list', async () => {
    await request(app.getHttpServer())
      .get('/api/settings/notification-channels')
      .set(bearer(token))
      .expect(200);
  });

  it('POST /api/settings/notification-channels → create', async () => {
    channelCode = uniqueCode('E2E-CH');
    const res = await request(app.getHttpServer())
      .post('/api/settings/notification-channels')
      .set(bearer(token))
      .send({
        channel_code: channelCode,
        channel_name: 'E2E Test Channel',
        channel_type: 'SNS',
        target: 'arn:aws:sns:ap-northeast-2:123456789012:e2e-test',
        enabled: true,
      })
      .expect(201);

    const data = unwrapData<{ id: string }>(res);
    expect(data.id).toBe(channelCode);

    channelPk = await notificationChannelPkByCode(channelCode);
    expect(channelPk).toBeTruthy();
  });

  it('DELETE /api/settings/notification-channels/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/api/settings/notification-channels/${channelPk}`)
      .set(bearer(token))
      .expect(200);
  });

  it('DELETE /api/admin/codes/:id → soft delete', async () => {
    await request(app.getHttpServer())
      .delete(`/api/admin/codes/${codePk}`)
      .set(bearer(token))
      .expect(200);
  });
});
