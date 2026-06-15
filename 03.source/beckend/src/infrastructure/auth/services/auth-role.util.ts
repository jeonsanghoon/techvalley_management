import type { AuthRole } from '../types/auth-payload.types';

/** user.auth_type → JWT role (mapUser·userRoleToAppRole 과 정렬) */
export function authTypeToRole(authType?: number): AuthRole {
  if (authType === 10) return 'admin';
  if (authType === 9) return 'engineer';
  if (authType === 4) return 'customer';
  return 'cs';
}

/** Cognito custom attribute 또는 그룹명 → role */
export function cognitoClaimToRole(claims: Record<string, unknown>): AuthRole {
  const custom =
    (claims['custom:role'] as string | undefined) ??
    (claims.role as string | undefined) ??
    (claims['cognito:groups'] as string[] | undefined)?.[0];

  switch (custom?.toLowerCase()) {
    case 'system_admin':
    case 'system-admin':
      return 'system_admin';
    case 'admin':
      return 'admin';
    case 'engineer':
      return 'engineer';
    case 'customer':
      return 'customer';
    case 'cs':
      return 'cs';
    default:
      return 'cs';
  }
}
