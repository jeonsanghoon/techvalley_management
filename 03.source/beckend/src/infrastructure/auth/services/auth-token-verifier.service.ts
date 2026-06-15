import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_CONFIG } from '../auth.config';
import { CognitoAuthService } from './cognito-auth.service';
import { LocalTokenService } from './local-token.service';
import type { AuthPayload } from '../types/auth-payload.types';

/**
 * Bearer 토큰 검증 통합 진입점.
 * AUTH_PROVIDER=aws → Cognito JWT, local → 자체 JWT.
 */
@Injectable()
export class AuthTokenVerifierService {
  constructor(
    private readonly localToken: LocalTokenService,
    private readonly cognito: CognitoAuthService,
  ) {}

  async verifyBearerToken(token: string): Promise<AuthPayload> {
    if (AUTH_CONFIG.provider === 'aws') {
      return this.cognito.verifyAccessToken(token);
    }
    try {
      return this.localToken.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
