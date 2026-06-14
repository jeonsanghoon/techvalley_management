"use client";

import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { ContentCard } from "@/components/devias/ContentCard";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { useLocale } from "@/contexts/LocaleContext";
import type { DataSourceMeta } from "@/lib/data/scope";

export { FleetMapPanel } from "./FleetMapPanel";
export { DashboardFleetMap } from "./DashboardFleetMap";

export function DashboardChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  tone?: string;
}) {
  return (
    <ContentCard title={title} subheader={subtitle} action={action} sx={{ height: "100%", mb: 0 }}>
      {children}
    </ContentCard>
  );
}

export function DashboardKpiStrip({
  items,
  dataMeta,
  alarmCount,
}: {
  items: { label: string; value: ReactNode; highlight?: "error" | "warning" | "success" | "default" }[];
  dataMeta: DataSourceMeta;
  alarmCount: number;
}) {
  const { translate } = useLocale();
  return (
    <Paper variant="outlined" sx={{ mb: 2.5, borderRadius: 1.5, overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "grey.50",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <DataScopeBadge meta={dataMeta} compact />
          {alarmCount > 0 && (
            <Chip
              label={`${translate("dashboard.kpi.alarm")} ${alarmCount}`}
              size="small"
              color="error"
              variant="filled"
            />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          EMG 1588-0000
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          px: 2,
          py: 1.5,
          gap: { xs: 2, md: 3 },
        }}
      >
        {items.map((item) => {
          const color =
            item.highlight === "error"
              ? "error.main"
              : item.highlight === "warning"
                ? "warning.dark"
                : item.highlight === "success"
                  ? "success.dark"
                  : "text.primary";
          return (
            <Box key={item.label} sx={{ minWidth: 88, flex: "1 1 88px" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2, color }}>
                {item.value}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

export function DashboardQuickLinks({
  links,
  maxHeight = 200,
}: {
  links: { label: string; href: string; desc: string; color?: "primary" | "error" | "warning" | "info" }[];
  maxHeight?: number | string;
}) {
  return (
    <Stack
      spacing={1}
      sx={{
        maxHeight,
        overflowY: "auto",
        pr: 0.5,
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "action.disabled" },
      }}
    >
      {links.map((link) => (
        <Paper
          key={link.href}
          component={Link}
          href={link.href}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            textDecoration: "none",
            color: "inherit",
            display: "block",
            "&:hover": {
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.32)" : "divider",
              bgcolor: "action.hover",
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {link.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {link.desc}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}
