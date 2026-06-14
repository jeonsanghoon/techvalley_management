import type { LocalizableText } from "@/lib/locale/types";
import type { UserRole } from "@/lib/types";

/** RBAC 역할 키 (메뉴 권한 매트릭스 컬럼과 1:1) */
export type AppRole = "admin" | "engineer" | "cs" | "customer";

export type PermissionAction = "view" | "create" | "update" | "delete" | "export" | "execute";

export interface RoleAccess {
  admin: boolean;
  engineer: boolean;
  cs: boolean;
  customer: boolean;
}

export interface MenuActionPermission {
  menuId: string;
  menuName: LocalizableText;
  view: RoleAccess;
  create: RoleAccess;
  update: RoleAccess;
  delete: RoleAccess;
  export: RoleAccess;
  execute: RoleAccess;
}

/** 기능 권한 그리드용 플랫 행 */
export interface MenuActionPermRow {
  id: string;
  menuId: string;
  menuName: LocalizableText;
  groupLabel?: LocalizableText;
  lifecyclePhase?: string;
  action: PermissionAction;
  actionLabel: string;
  admin: boolean;
  engineer: boolean;
  cs: boolean;
  customer: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  appRole: AppRole;
  region: string;
}

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "조회",
  create: "등록",
  update: "수정",
  delete: "삭제",
  export: "보내기",
  execute: "실행",
};

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: "시스템 관리자",
  engineer: "서비스 엔지니어",
  cs: "상담·CS",
  customer: "고객사·대리점",
};
