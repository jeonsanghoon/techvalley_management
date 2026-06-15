/**
 * @file auth.config.ts
 * @description 인증 환경 변수 — 로컬 JWT vs AWS Cognito 분기.
 *
 * | 변수 | 기본값 | 설명 |
 * |------|--------|------|
 * | AUTH_ENABLED | true | false 시 JWT Guard 비활성(로컬 디버그) |
 * | AUTH_PROVIDER | local | `local` \| `aws` (Cognito) |
 * | JWT_SECRET | dev-only | 로컬 JWT 서명 키 (운영 필수 변경) |
 * | JWT_EXPIRES_IN | 8h | access token TTL |
 * | JWT_REFRESH_EXPIRES_IN | 7d | refresh token TTL |
 * | AUTH_ALLOW_DEMO_LOGIN | true | password_hash 없을 때 userId-only 로그인 허용 |
 * | COGNITO_* | — | AWS Cognito User Pool 설정 |
 */

export type AuthProvider = 'local' | 'aws';

export interface AuthConfig {
  enabled: boolean;
  provider: AuthProvider;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  allowDemoLogin: boolean;
  cognito: {
    region: string;
    userPoolId: string;
    clientId: string;
  };
}

function envBool(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return defaultValue;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export function loadAuthConfig(): AuthConfig {
  const provider = (process.env.AUTH_PROVIDER ?? 'local').toLowerCase() as AuthProvider;
  if (provider !== 'local' && provider !== 'aws') {
    throw new Error(`AUTH_PROVIDER must be 'local' or 'aws', got: ${provider}`);
  }

  return {
    enabled: envBool('AUTH_ENABLED', true),
    provider,
    jwtSecret: process.env.JWT_SECRET ?? 'techvalley-dev-jwt-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    allowDemoLogin: envBool('AUTH_ALLOW_DEMO_LOGIN', true),
    cognito: {
      region: process.env.COGNITO_REGION ?? process.env.AWS_REGION ?? 'ap-northeast-2',
      userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
      clientId: process.env.COGNITO_CLIENT_ID ?? '',
    },
  };
}

export const AUTH_CONFIG = loadAuthConfig();
