"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { PermissionAction } from "@/lib/auth/types";

export function PermissionGate({
  menuId,
  action = "view",
  fallback = null,
  children,
}: {
  menuId: string;
  action?: PermissionAction;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can, ready } = useAuth();
  if (!ready) return null;
  if (!can(menuId, action)) return <>{fallback}</>;
  return <>{children}</>;
}
