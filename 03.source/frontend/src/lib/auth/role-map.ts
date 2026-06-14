import type { UserRole } from "@/lib/types";
import type { AppRole } from "./types";

export function userRoleToAppRole(role: UserRole): AppRole {
  switch (role) {
    case "시스템 관리자":
      return "admin";
    case "서비스 엔지니어":
      return "engineer";
    case "상담·CS":
      return "cs";
    case "고객사·대리점":
      return "customer";
    default:
      return "customer";
  }
}
