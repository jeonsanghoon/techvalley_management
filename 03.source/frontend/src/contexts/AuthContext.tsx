"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { findNavItem, resolveNavMenuId } from "@/lib/navigation";
import { useLocationHash } from "@/hooks/useHashTab";
import { canPerform } from "@/lib/auth/permissions";
import { userRoleToAppRole } from "@/lib/auth/role-map";
import { clearSession, loadSession, saveSession } from "@/lib/auth/session";
import type { AuthUser, PermissionAction } from "@/lib/auth/types";
import { users } from "@/lib/mock-data";
import type { UserAccount } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (userId: string, options?: { persist?: boolean }) => void;
  logout: () => void;
  can: (menuId: string, action: PermissionAction) => boolean;
  currentMenuId: string | undefined;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(account: UserAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    appRole: userRoleToAppRole(account.role),
    region: account.region,
  };
}

/** 데모 자동 로그인 기본 계정 (로그인 버튼 클릭 시) */
export const DEMO_LOGIN_USER_ID = "usr-002";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setUser(loadSession());
    setReady(true);
  }, []);

  const login = useCallback((userId: string, options?: { persist?: boolean }) => {
    const account = users.find((u) => u.id === userId);
    if (!account) return;
    const authUser = toAuthUser(account);
    if (options?.persist !== false) {
      saveSession(authUser);
    }
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const currentMenuId = findNavItem(pathname, hash)?.id;

  const can = useCallback(
    (menuId: string, action: PermissionAction) => {
      if (!user) return false;
      return canPerform(resolveNavMenuId(menuId), action, user.appRole);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, ready, login, logout, can, currentMenuId }),
    [user, ready, login, logout, can, currentMenuId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function usePermission(menuId?: string) {
  const { can, currentMenuId, user } = useAuth();
  const resolvedMenuId = menuId ?? currentMenuId ?? "";

  return useMemo(
    () => ({
      menuId: resolvedMenuId,
      user,
      canView: can(resolvedMenuId, "view"),
      canCreate: can(resolvedMenuId, "create"),
      canUpdate: can(resolvedMenuId, "update"),
      canDelete: can(resolvedMenuId, "delete"),
      canExport: can(resolvedMenuId, "export"),
      canExecute: can(resolvedMenuId, "execute"),
      can: (action: PermissionAction, targetMenuId?: string) =>
        can(targetMenuId ?? resolvedMenuId, action),
    }),
    [can, resolvedMenuId, user],
  );
}
