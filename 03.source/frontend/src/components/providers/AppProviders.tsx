"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { PaletteMode } from "@mui/material";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ColorModeProvider } from "@/contexts/ColorModeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeWarmup } from "@/components/providers/ThemeWarmup";
import { MuiThemeShell } from "@/components/providers/MuiThemeShell";
import { MuiDatePickersProvider } from "@/components/providers/MuiDatePickersProvider";
import { agGridLicenseKey, agGridModules } from "@/components/grid/register-ag-grid";
import { AgGridProvider } from "ag-grid-react";

export function AppProviders({
  children,
  initialColorMode = "light",
}: {
  children: React.ReactNode;
  initialColorMode?: PaletteMode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <AppRouterCacheProvider options={{ key: "css", prepend: true }}>
      <ThemeWarmup />
      <ColorModeProvider initialMode={initialColorMode}>
        <LocaleProvider>
          <AgGridProvider modules={agGridModules} licenseKey={agGridLicenseKey}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <MuiThemeShell>
                  <MuiDatePickersProvider>{children}</MuiDatePickersProvider>
                </MuiThemeShell>
              </AuthProvider>
            </QueryClientProvider>
          </AgGridProvider>
        </LocaleProvider>
      </ColorModeProvider>
    </AppRouterCacheProvider>
  );
}
