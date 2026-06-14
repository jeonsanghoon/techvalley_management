"use client";

import { useMediaQuery, useTheme } from "@mui/material";

export type GridViewport = "minimal" | "compact" | "full";

/** 모바일(sm 미만) · 태블릿(lg 미만) · 데스크톱 구간 */
export function useViewport() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));

  const gridViewport: GridViewport = isMobile ? "minimal" : isCompact ? "compact" : "full";

  return { isMobile, isTablet: isCompact && !isMobile, isCompact, gridViewport };
}
