"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { findNavItem, resolveNavMenuId } from "@/lib/navigation";
import { useLocationHash } from "@/hooks/useHashTab";
import { canPerform } from "@/lib/auth/permissions";
import { userRoleToAppRole } from "@/lib/auth/role-map";
import { clearSession, loadSession, onSessionInvalidated, saveSession } from "@/lib/auth/session";
import type { AuthUser, PermissionAction } from "@/lib/auth/types";
import type { UserAccount } from "@/lib/types";
import { api } from "@/lib/api/endpoints";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (
    userId: string,
    options?: { persist?: boolean; password?: string; email?: string },
  ) => Promise<void>;
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

export const DEMO_LOGIN_USER_ID = "USR-TV-OPS";
export const DEMO_PASSWORD = "demo-password";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => onSessionInvalidated(() => setUser(null)), []);

  useLayoutEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const session = loadSession();
      if (!session?.tokens?.accessToken) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const me = await api.me();
        const authUser = toAuthUser(me.user);
        if (!cancelled) {
          saveSession({ user: authUser, tokens: session.tokens });
          setUser(authUser);
        }
      } catch {
        clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      userId: string,
      options?: { persist?: boolean; password?: string; email?: string },
    ) => {
      const result = await api.login({
        userId,
        email: options?.email,
        password: options?.password ?? DEMO_PASSWORD,
      });
      const authUser = toAuthUser(result.user);
      const session = { user: authUser, tokens: result.tokens };
      if (options?.persist !== false) {
        saveSession(session);
      }
      setUser(authUser);
    },
    [],
  );

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
