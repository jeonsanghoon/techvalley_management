import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_CONFIG } from '../auth.config';
import { cognitoClaimToRole } from './auth-role.util';
import type { AuthPayload } from '../types/auth-payload.types';

export interface CognitoTokenPair {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

@Injectable()
export class CognitoAuthService {
  private client: CognitoIdentityProviderClient | null = null;
  private accessVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

  private ensureConfigured(): void {
    const { userPoolId, clientId, region } = AUTH_CONFIG.cognito;
    if (!userPoolId || !clientId) {
      throw new UnauthorizedException(
        'Cognito is not configured (COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID)',
      );
    }
    if (!this.client) {
      this.client = new CognitoIdentityProviderClient({ region });
      this.accessVerifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'access',
        clientId,
      });
    }
  }

  /** USER_PASSWORD_AUTH — Cognito 로그인 */
  async loginWithPassword(username: string, password: string): Promise<CognitoTokenPair> {
    this.ensureConfigured();
    const { clientId } = AUTH_CONFIG.cognito;

    let result: InitiateAuthCommandOutput;
    try {
      result = await this.client!.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: clientId,
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cognito authentication failed';
      throw new UnauthorizedException(message);
    }

    const auth = result.AuthenticationResult;
    if (!auth?.AccessToken || !auth.IdToken || !auth.RefreshToken) {
      throw new UnauthorizedException('Cognito did not return tokens');
    }

    return {
      accessToken: auth.AccessToken,
      idToken: auth.IdToken,
      refreshToken: auth.RefreshToken,
      expiresIn: auth.ExpiresIn ?? 3600,
      tokenType: 'Bearer',
    };
  }

  /** refresh token → 새 access/id token */
  async refreshTokens(refreshToken: string): Promise<CognitoTokenPair> {
    this.ensureConfigured();
    const { clientId } = AUTH_CONFIG.cognito;

    const result = await this.client!.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: clientId,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      }),
    );

    const auth = result.AuthenticationResult;
    if (!auth?.AccessToken || !auth.IdToken) {
      throw new UnauthorizedException('Cognito refresh failed');
    }

    return {
      accessToken: auth.AccessToken,
      idToken: auth.IdToken,
      refreshToken: refreshToken,
      expiresIn: auth.ExpiresIn ?? 3600,
      tokenType: 'Bearer',
    };
  }

  /** Cognito access token 검증 → AuthPayload */
  async verifyAccessToken(token: string): Promise<AuthPayload> {
    this.ensureConfigured();
    const payload = await this.accessVerifier!.verify(token);
    const claims = payload as Record<string, unknown>;

    return {
      sub: String(payload.sub),
      email: payload.username ? String(payload.username) : undefined,
      name: (claims.name as string | undefined) ?? (payload.username ? String(payload.username) : undefined),
      role: cognitoClaimToRole(claims),
      companyId: claims['custom:companyId']
        ? Number(claims['custom:companyId'])
        : undefined,
      branchId: claims['custom:branchId']
        ? Number(claims['custom:branchId'])
        : undefined,
      siteId: claims['custom:siteId'] ? Number(claims['custom:siteId']) : undefined,
      scope: claims['custom:scope'] as string | undefined,
      provider: 'cognito',
    };
  }

  /** 프론트 Cognito Hosted UI 연동용 공개 설정 */
  getPublicConfig() {
    const { region, userPoolId, clientId } = AUTH_CONFIG.cognito;
    return {
      region,
      userPoolId,
      clientId,
      enabled: Boolean(userPoolId && clientId),
    };
  }
}
