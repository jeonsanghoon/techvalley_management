import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG } from '../auth.config';
import type { AuthPayload } from '../types/auth-payload.types';

export interface LocalTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

@Injectable()
export class LocalTokenService {
  constructor(private readonly jwt: JwtService) {}

  /** access + refresh JWT 발급 */
  issueTokens(payload: Omit<AuthPayload, 'provider'>): LocalTokenPair {
    const base = { ...payload, provider: 'local' as const };
    const accessToken = this.jwt.sign(
      { ...base, type: 'access' },
      { expiresIn: AUTH_CONFIG.jwtExpiresIn as `${number}h` | `${number}d` },
    );
    const refreshToken = this.jwt.sign(
      { sub: payload.sub, type: 'refresh', provider: 'local' },
      { expiresIn: AUTH_CONFIG.jwtRefreshExpiresIn as `${number}h` | `${number}d` },
    );
    const decoded = this.jwt.decode(accessToken) as { exp?: number; iat?: number };
    const expiresIn =
      decoded.exp && decoded.iat ? decoded.exp - decoded.iat : 8 * 3600;

    return { accessToken, refreshToken, expiresIn, tokenType: 'Bearer' };
  }

  /** access JWT 검증 */
  verifyAccessToken(token: string): AuthPayload {
    const payload = this.jwt.verify<AuthPayload & { type?: string }>(token);
    if (payload.type && payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return { ...payload, provider: 'local' };
  }

  /** refresh JWT payload 검증 */
  verifyRefreshToken(refreshToken: string): { sub: string } {
    const payload = this.jwt.verify<{ sub: string; type?: string }>(refreshToken);
    if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
    return { sub: payload.sub };
  }

  /** refresh JWT → 새 access token */
  refreshAccessToken(refreshToken: string, user: Omit<AuthPayload, 'provider'>): LocalTokenPair {
    const { sub } = this.verifyRefreshToken(refreshToken);
    if (sub !== user.sub) throw new Error('Invalid refresh token subject');
    return this.issueTokens(user);
  }
}
