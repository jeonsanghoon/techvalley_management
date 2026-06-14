"use client";

import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { useColorMode } from "@/contexts/ColorModeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import {
  batchAlarmTrendDaily,
  batchDashboardForRegion,
  batchFleetStatusCountsForRegion,
  batchFleetTotalsForRegion,
} from "@/lib/data/batch";
import { ThemedApexChart } from "@/components/charts/ThemedApexChart";

const CHART_HEIGHT = 220;

function useApexBaseChart(): ApexOptions {
  return useMemo(
    () => ({
      chart: {
        fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
        zoom: { enabled: false },
        animations: { speed: 500 },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      dataLabels: { enabled: false },
    }),
    [],
  );
}

const STATUS_COLORS: Record<string, string> = {
  online: "#059669",
  alarm: "#dc2626",
  maintenance: "#d97706",
  offline: "#94a3b8",
  safe_mode: "#a855f7",
};

/** 배치 롤업 기준 플릿 상태 분포 */
export function ApexFleetDonut() {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const { language, translate, serviceRegion } = useLocale();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#9fa6ad" : "#5b6b73";
  const valueColor = isDark ? "#e5e7eb" : "#434a51";

  const statusCounts = useMemo(
    () => batchFleetStatusCountsForRegion(serviceRegion),
    [serviceRegion],
  );
  const fleetTotals = useMemo(
    () => batchFleetTotalsForRegion(serviceRegion),
    [serviceRegion],
  );

  const keys = Object.keys(statusCounts) as (keyof typeof statusCounts)[];
  const series = keys.map((k) => statusCounts[k]);
  const labels = keys.map((k) => localizeDomainValue(k, language));
  const colors = keys.map((k) => STATUS_COLORS[k] ?? "#94a3b8");

  const options: ApexOptions = {
    ...baseChart,
    labels,
    colors,
    legend: {
      ...baseChart.legend,
      show: true,
      labels: { colors: isDark ? "#cdd7e1" : "#434a51" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: translate("map.fleet"),
              fontSize: "12px",
              color: labelColor,
              formatter: () => String(fleetTotals.totalFleet),
            },
            value: { fontSize: "18px", fontWeight: 700, color: valueColor },
          },
        },
      },
    },
  };

  return <ThemedApexChart type="donut" options={options} series={series} height={CHART_HEIGHT} />;
}

/** 배치 일별 알람 집계 */
export function ApexAlarmTrend() {
  const baseChart = useApexBaseChart();
  const { categories, critical, warning } = batchAlarmTrendDaily;

  const options: ApexOptions = {
    ...baseChart,
    chart: { ...baseChart.chart, type: "bar", stacked: true },
    colors: ["#dc2626", "#d97706"],
    xaxis: {
      ...baseChart.xaxis,
      categories,
    },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "50%" } },
  };

  const series = [
    { name: "Critical", data: critical },
    { name: "Warning", data: warning },
  ];

  return <ThemedApexChart type="bar" options={options} series={series} height={CHART_HEIGHT} />;
}

/** 배치 티켓 단계 집계 */
export function ApexTicketStages() {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const { language, translate, serviceRegion } = useLocale();
  const isDark = mode === "dark";
  const stages = useMemo(
    () => batchDashboardForRegion(serviceRegion).ticketStages,
    [serviceRegion],
  );
  const stageColors = ["#94a3b8", "#0284c7", "#5c6670", "#d97706", "#059669"];

  const options: ApexOptions = {
    ...baseChart,
    chart: { ...baseChart.chart, type: "bar" },
    colors: stageColors,
    xaxis: {
      ...baseChart.xaxis,
      categories: stages.map((s) => localizeDomainValue(s.stage, language)),
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        distributed: true,
        columnWidth: "55%",
      },
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      offsetY: -16,
      style: { fontSize: "11px", colors: [isDark ? "#e5e7eb" : "#434a51"] },
    },
  };

  return (
    <ThemedApexChart
      type="bar"
      options={options}
      series={[{ name: translate("dashboard.kpi.ticket"), data: stages.map((s) => s.count) }]}
      height={CHART_HEIGHT}
    />
  );
}

/** 배치 수율 집계 */
export function ApexYieldGauge() {
  const { mode } = useColorMode();
  const { translate, serviceRegion } = useLocale();
  const isDark = mode === "dark";
  const yieldVal = useMemo(
    () => batchDashboardForRegion(serviceRegion).kpis.avgYield,
    [serviceRegion],
  );

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
      background: "transparent",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "65%" },
        track: { background: isDark ? "rgba(255,255,255,0.1)" : "#eef2f6" },
        dataLabels: {
          name: { fontSize: "12px", color: isDark ? "#9fa6ad" : "#5b6b73", offsetY: 20 },
          value: {
            fontSize: "24px",
            fontWeight: 700,
            color: isDark ? "#e5e7eb" : "#434a51",
            offsetY: -8,
            formatter: (v) => `${Number(v).toFixed(1)}%`,
          },
        },
      },
    },
    labels: [translate("dashboard.chart.yield")],
    colors: [yieldVal >= 95 ? "#059669" : yieldVal >= 90 ? "#d97706" : "#dc2626"],
  };

  return <ThemedApexChart type="radialBar" options={options} series={[yieldVal]} height={CHART_HEIGHT} />;
}
