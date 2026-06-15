"use client";

import { useMemo } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import {
  ApexFleetDonut,
  ApexAlarmTrend,
  ApexTicketStages,
  ApexYieldGauge,
} from "@/components/charts/ApexDashboardCharts";
import {
  DashboardChartCard,
  DashboardFleetMap,
  DashboardKpiStrip,
  DashboardQuickLinks,
} from "@/components/dashboard/DashboardBoard";
import { PageToolbar, SectionCard, StatusBadge } from "@/components/ui/PageComponents";
import { ListPanel, PrimaryButton } from "@/components/ui/mui-primitives";
import { fallbackMeta, useDashboardSummary, useDashboardTrends } from "@/lib/api/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { findNavItem } from "@/lib/navigation";

export default function DashboardPage() {
  const { can } = useAuth();
  const { translate, language, formatAsOf } = useLocale();
  const { data: dashboard, isLoading } = useDashboardSummary();
  const { data: trend } = useDashboardTrends();

  const dataMeta = dashboard?.meta ?? fallbackMeta("/dashboard/summary");
  const batchAsOf = formatAsOf(dataMeta.asOf);
  const localeTag = language === "en" ? "en-US" : "ko-KR";

  const kpiStripItems = useMemo(() => {
    if (!dashboard) return [];
    const { kpis } = dashboard;
    const onlinePct = kpis.onlinePct ?? (kpis.totalFleet > 0 ? Math.round((kpis.online / kpis.totalFleet) * 100) : 0);
    return [
      {
        label: translate("dashboard.kpi.online" as TranslationKey),
        value: `${kpis.online} / ${kpis.totalFleet}`,
        highlight: "success" as const,
      },
      {
        label: translate("dashboard.kpi.uptimeRate" as TranslationKey),
        value: `${onlinePct}%`,
        highlight: "default" as const,
      },
      {
        label: translate("dashboard.kpi.alarm" as TranslationKey),
        value: kpis.alarm,
        highlight: kpis.alarm > 0 ? ("error" as const) : ("default" as const),
      },
      {
        label: translate("dashboard.kpi.maintenance" as TranslationKey),
        value: kpis.maintenance,
        highlight: "warning" as const,
      },
      {
        label: translate("dashboard.kpi.ticket" as TranslationKey),
        value:
          kpis.slaAtRisk > 0
            ? `${kpis.openTickets} (SLA ${kpis.slaAtRisk})`
            : kpis.openTickets,
        highlight: kpis.slaAtRisk > 0 ? ("warning" as const) : ("default" as const),
      },
      {
        label: translate("dashboard.kpi.yield" as TranslationKey),
        value: `${kpis.avgYield}%`,
        highlight: "success" as const,
      },
    ];
  }, [dashboard, translate]);

  const quickLinks = useMemo(
    () =>
      [
        {
          label: translate("dashboard.quickLink.equipment" as TranslationKey),
          href: "/equipment",
          desc: translate("dashboard.quickLink.equipmentDesc" as TranslationKey),
          color: "primary" as const,
        },
        {
          label: translate("dashboard.quickLink.equipmentLogs" as TranslationKey),
          href: "/equipment-logs",
          desc: translate("dashboard.quickLink.equipmentLogsDesc" as TranslationKey),
          color: "info" as const,
        },
        {
          label: translate("dashboard.quickLink.alarms" as TranslationKey),
          href: "/alarms",
          desc: translate("dashboard.quickLink.alarmsDesc" as TranslationKey),
          color: "warning" as const,
        },
        {
          label: translate("dashboard.quickLink.serviceTickets" as TranslationKey),
          href: "/service-tickets",
          desc: translate("dashboard.quickLink.serviceTicketsDesc" as TranslationKey),
          color: "primary" as const,
        },
      ].filter((link) => {
        const item = findNavItem(link.href);
        return !item || can(item.id, "view");
      }),
    [translate, can],
  );

  if (isLoading || !dashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{translate("common.loading" as TranslationKey)}</Typography>
      </Box>
    );
  }

  const { kpis, fleet, recentAlarms, openTickets, mapAlarms, mapTickets, charts } = dashboard;
  const unackedAlarms = recentAlarms.filter((a) => !a.acknowledged);
  const DASHBOARD_LIST_HEIGHT = 260;
  const DASHBOARD_GRID_HEIGHT = 300;

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton href="/alarms" color="error" menuId="alarms" perm="view" startIcon={<WarningAmberIcon />}>
          {translate("dashboard.toolbar.alarms" as TranslationKey)} {unackedAlarms.length}
        </PrimaryButton>
      </PageToolbar>

      <DashboardKpiStrip items={kpiStripItems} dataMeta={dataMeta} alarmCount={kpis.alarm} />

      <Grid container spacing={2} sx={{ mb: 2.5, mt: 2 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title={translate("dashboard.section.fleetMap" as TranslationKey)} sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {translate("dashboard.fleetMap.caption" as TranslationKey)
                .replace("{sample}", String(fleet.length))
                .replace("{total}", String(kpis.totalFleet))
                .replace("{asOf}", batchAsOf)}
            </Typography>
            <DashboardFleetMap equipments={fleet} mapAlarms={mapAlarms} mapTickets={mapTickets} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <SectionCard
              title={translate("dashboard.section.recentAlarms" as TranslationKey)}
              action={
                <PrimaryButton href="/alarms" variant="outlined" menuId="alarms" perm="view">
                  {translate("common.viewAll" as TranslationKey)}
                </PrimaryButton>
              }
              sx={{ flex: 1, minHeight: 0 }}
            >
              <ListPanel
                maxHeight={DASHBOARD_LIST_HEIGHT}
                items={recentAlarms.map((a) => ({
                  id: a.id,
                  title: a.equipmentSn,
                  subtitle: a.message,
                  badge: <StatusBadge status={a.severity} />,
                }))}
              />
            </SectionCard>
            <SectionCard title={translate("dashboard.section.quickLinks" as TranslationKey)} sx={{ minHeight: 0 }}>
              <DashboardQuickLinks links={quickLinks} maxHeight={DASHBOARD_LIST_HEIGHT - 48} />
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <DashboardChartCard
            title={translate("dashboard.chart.fleetStatus" as TranslationKey)}
            subtitle={translate("dashboard.chart.fleetStatusSub" as TranslationKey)}
          >
            <ApexFleetDonut chart={charts.fleetStatus} />
          </DashboardChartCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <DashboardChartCard
            title={translate("dashboard.chart.ticketStages" as TranslationKey)}
            subtitle={translate("dashboard.chart.batchSnapshot" as TranslationKey)}
          >
            <ApexTicketStages chart={charts.ticketStages} />
          </DashboardChartCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <DashboardChartCard
            title={translate("dashboard.chart.alarmTrend" as TranslationKey)}
            subtitle={translate("dashboard.chart.alarmTrendSub" as TranslationKey)}
          >
            <ApexAlarmTrend trend={trend} />
          </DashboardChartCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <DashboardChartCard
            title={translate("dashboard.chart.yield" as TranslationKey)}
            subtitle={translate("dashboard.chart.yieldSub" as TranslationKey)}
          >
            <ApexYieldGauge avgYield={kpis.avgYield} />
          </DashboardChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }} sx={{ minWidth: 0 }}>
          <AgDataGrid
            title={translate("dashboard.grid.equipment" as TranslationKey)}
            subtitle={translate("dashboard.grid.equipmentSub" as TranslationKey)
              .replace("{sample}", String(fleet.length))
              .replace("{asOf}", batchAsOf)}
            rowData={fleet}
            rowModel="client"
            autoHeight={false}
            columnSet="equipment"
            height={DASHBOARD_GRID_HEIGHT}
          />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }} sx={{ minWidth: 0 }}>
          <AgDataGrid
            title={translate("dashboard.grid.openTickets" as TranslationKey)}
            subtitle={translate("dashboard.grid.openTicketsSub" as TranslationKey)
              .replace("{count}", openTickets.length.toLocaleString(localeTag))}
            rowData={openTickets}
            rowModel="client"
            autoHeight={false}
            columnSet="serviceTicket"
            height={DASHBOARD_GRID_HEIGHT}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
