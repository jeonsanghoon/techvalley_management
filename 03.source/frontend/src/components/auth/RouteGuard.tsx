"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { findNavItem, resolveNavMenuId } from "@/lib/navigation";

function GuardSpinner({ message }: { message: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
      <CircularProgress size={32} />
      <Typography variant="caption" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { can, ready, user } = useAuth();

  /** hash 서브라우트는 pathname 기준 권한만 검사 (metric-stream#periodic 등) */
  const navItem = findNavItem(pathname);
  const menuId = navItem ? resolveNavMenuId(navItem.id) : undefined;
  const allowed = !menuId || can(menuId, "view");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (menuId && !can(menuId, "view")) {
      router.replace("/forbidden");
    }
  }, [ready, user, menuId, can, router]);

  if (!ready) {
    return <GuardSpinner message="권한 확인 중…" />;
  }

  if (!user) {
    return <GuardSpinner message="로그인 화면으로 이동 중…" />;
  }

  if (!allowed) {
    return <GuardSpinner message="접근 권한을 확인하는 중…" />;
  }

  return <>{children}</>;
}
