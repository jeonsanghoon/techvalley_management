"use client";

import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Logo } from "@/components/devias/Logo";
import { NavLocaleSettings } from "@/components/layout/NavLocaleSettings";
import { ThemeModeToggle } from "@/components/layout/ThemeModeToggle";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { kepple, neonBlue } from "@/theme/devias/colors";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { translate, language } = useLocale();

  const featureRows = useMemo(
    () => [
      {
        label: translate("auth.feature.monitoring" as TranslationKey),
        value: translate("auth.feature.monitoringDesc" as TranslationKey),
      },
      {
        label: translate("auth.feature.alarmRemote" as TranslationKey),
        value: translate("auth.feature.alarmRemoteDesc" as TranslationKey),
      },
      {
        label: translate("auth.feature.service" as TranslationKey),
        value: translate("auth.feature.serviceDesc" as TranslationKey),
      },
    ],
    [translate, language],
  );

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "grid" },
        flexDirection: "column",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column" }}>
        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Logo color="auto" height={40} href="/login" />
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexShrink: 0 }}>
            <NavLocaleSettings />
            <ThemeModeToggle />
          </Stack>
        </Box>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flex: "1 1 auto",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Box sx={{ maxWidth: 420, width: "100%" }}>{children}</Box>
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: "center",
          background: "radial-gradient(50% 50% at 50% 50%, #1e1650 0%, #090a0b 100%)",
          color: "#fff",
          display: { xs: "none", lg: "flex" },
          justifyContent: "center",
          p: 4,
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 480 }}>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 600, textAlign: "center", color: "#fff" }}>
              {translate("auth.heroTitle" as TranslationKey)}{" "}
              <Box component="span" sx={{ color: kepple[500] }}>
                {translate("auth.heroHighlight" as TranslationKey)}
              </Box>
            </Typography>
            <Typography align="center" variant="body1" sx={{ color: "rgba(255,255,255,0.72)" }}>
              {translate("auth.heroSubtitle" as TranslationKey)}
            </Typography>
          </Stack>
          <Box
            sx={{
              borderRadius: 4,
              p: 3,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Stack spacing={2}>
              {featureRows.map((row) => (
                <Box key={row.label}>
                  <Typography variant="caption" sx={{ color: neonBlue[400], fontWeight: 700 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
