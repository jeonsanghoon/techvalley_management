"use client";

import { Box, Container, GlobalStyles } from "@mui/material";
import { PageContextHeader } from "@/components/layout/PageContextHeader";
import { PageActionsProvider } from "@/contexts/PageActionsContext";
import { DEVIAS_SIDE_NAV_WIDTH, SideNav } from "./SideNav";
import { MainNav } from "./MainNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            "--MainNav-height": "48px",
            "--SideNav-width": `${DEVIAS_SIDE_NAV_WIDTH}px`,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: DEVIAS_SIDE_NAV_WIDTH,
            minHeight: 0,
            overflow: "hidden",
            zIndex: (t) => t.zIndex.drawer,
          }}
        >
          <SideNav />
        </Box>

        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            pl: { lg: `${DEVIAS_SIDE_NAV_WIDTH}px` },
            minWidth: 0,
          }}
        >
          <PageActionsProvider>
            <MainNav />
            <Box component="main" sx={{ flex: 1, minWidth: 0, bgcolor: "background.default" }}>
              <PageContextHeader />
              <Container maxWidth="xl" sx={{ py: { xs: 1.25, md: 1.5 }, px: { xs: 2, md: 3 } }}>
                {children}
              </Container>
            </Box>
          </PageActionsProvider>
        </Box>
      </Box>
    </>
  );
}
