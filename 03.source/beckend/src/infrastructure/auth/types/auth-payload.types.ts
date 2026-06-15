/**
 * @file auth-payload.types.ts
 * @description JWT·Cognito 토큰 검증 후 request.user 에 실어지는 인증 컨텍스트.
 *              14-backend-frontend-design.md §14.5 claim 과 정렬.
 */

/** API RBAC 역할 — Cognito custom:role 또는 auth_type 매핑 */
export type AuthRole = 'admin' | 'engineer' | 'cs' | 'customer' | 'system_admin';

/** 로컬·Cognito 공통 JWT payload (검증 후) */
export interface AuthPayload {
  /** user.id (PG) 또는 Cognito sub */
  sub: string;
  code?: string;
  email?: string;
  name?: string;
  role: AuthRole;
  companyId?: number;
  branchId?: number;
  siteId?: number;
  scope?: string;
  /** local | cognito */
  provider: 'local' | 'cognito';
}

/** Express request 확장 */
export interface AuthenticatedRequest {
  user: AuthPayload;
}
