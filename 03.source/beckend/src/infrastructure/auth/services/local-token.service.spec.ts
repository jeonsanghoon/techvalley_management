import { JwtService } from '@nestjs/jwt';
import { LocalTokenService } from './local-token.service';

describe('LocalTokenService', () => {
  const jwt = new JwtService({ secret: 'unit-test-secret' });
  const service = new LocalTokenService(jwt);

  const payload = {
    sub: '42',
    code: 'USR-TEST',
    role: 'cs' as const,
  };

  it('issues and verifies access token', () => {
    const { accessToken } = service.issueTokens(payload);
    const verified = service.verifyAccessToken(accessToken);
    expect(verified.sub).toBe('42');
    expect(verified.provider).toBe('local');
  });

  it('refreshes access token', () => {
    const { refreshToken } = service.issueTokens(payload);
    const pair = service.refreshAccessToken(refreshToken, payload);
    expect(pair.accessToken).toBeTruthy();
    expect(service.verifyAccessToken(pair.accessToken).sub).toBe('42');
  });
});
