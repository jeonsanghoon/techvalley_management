import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginAsOps(app: INestApplication): Promise<LoginTokens> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ userId: 'USR-TV-OPS', password: 'demo-password' });

  if (res.status >= 400) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const tokens = res.body.tokens ?? res.body.data?.tokens;
  if (!tokens?.accessToken) {
    throw new Error(`Login response missing tokens: ${JSON.stringify(res.body)}`);
  }
  return tokens;
}

export function bearer(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}
