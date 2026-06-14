"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import { useLocationHash } from "@/hooks/useHashTab";
import { ROUTE_CHANGE_EVENT, buildRouteKey } from "@/lib/route-key";

type RouteNavigationContextValue = {
  routeMountKey: string;
  routeKey: string;
  /** 동일 메뉴 재클릭 시 화면 상태 초기화 */
  resetRoute: () => void;
  /** 같은 pathname, 다른 hash 메뉴 링크 클릭 시 remount 예약 */
  markPendingHashNavigation: (targetRouteKey: string) => void;
};

const RouteNavigationContext = createContext<RouteNavigationContextValue | null>(null);

export function RouteNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const routeKey = buildRouteKey(pathname, hash);
  const [resetEpoch, setResetEpoch] = useState(0);
  const pendingHashNavRef = useRef<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  const routeMountKey = useMemo(
    () => (resetEpoch > 0 ? `${pathname}::${resetEpoch}` : pathname),
    [pathname, resetEpoch],
  );

  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      pendingHashNavRef.current = null;
      // pathname 변경만으로 remount — epoch 증가는 동일 메뉴 재클릭·hash 전환에만 사용
      setResetEpoch(0);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    const pending = pendingHashNavRef.current;
    if (pending && pending === routeKey) {
      pendingHashNavRef.current = null;
      setResetEpoch((epoch) => epoch + 1);
    }
  }, [routeKey]);

  const resetRoute = useCallback(() => {
    setResetEpoch((epoch) => epoch + 1);
  }, []);

  const markPendingHashNavigation = useCallback((targetRouteKey: string) => {
    pendingHashNavRef.current = targetRouteKey;
  }, []);

  const value = useMemo(
    () => ({
      routeMountKey,
      routeKey,
      resetRoute,
      markPendingHashNavigation,
    }),
    [routeMountKey, routeKey, resetRoute, markPendingHashNavigation],
  );

  return <RouteNavigationContext.Provider value={value}>{children}</RouteNavigationContext.Provider>;
}

/** 페이지 영역만 remount — 사이드바·헤더는 유지 */
export function RouteResetMount({ children }: { children: ReactNode }) {
  const { routeMountKey, routeKey } = useRouteNavigation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    window.dispatchEvent(
      new CustomEvent(ROUTE_CHANGE_EVENT, { detail: { routeKey, routeMountKey } }),
    );
  }, [routeMountKey, routeKey]);

  return (
    <Box key={routeMountKey} sx={{ minWidth: 0, width: "100%" }}>
      {children}
    </Box>
  );
}

export function useRouteNavigation() {
  const ctx = useContext(RouteNavigationContext);
  if (!ctx) {
    throw new Error("useRouteNavigation must be used within RouteNavigationProvider");
  }
  return ctx;
}
