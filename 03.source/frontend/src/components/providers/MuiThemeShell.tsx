"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { useColorMode } from "@/contexts/ColorModeContext";
import { getTechvalleyTheme } from "@/lib/theme-registry";

/** MUI ThemeProvider — remount key 없이 테마·라우트 전환 시 emotion 스타일 유지 */
export function MuiThemeShell({ children }: { children: ReactNode }) {
  const { mode } = useColorMode();
  const theme = getTechvalleyTheme(mode);

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
