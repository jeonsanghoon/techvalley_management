"use client";

import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { useColorMode } from "@/contexts/ColorModeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { ApiAlarmTrend } from "@/lib/api/endpoints";
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

export type DashboardFleetStatusChart = {
  statuses: string[];
  counts: number[];
  totalFleet: number;
};

export type DashboardTicketStageChart = {
  stages: string[];
  counts: number[];
};

export function ApexFleetDonut({ chart }: { chart: DashboardFleetStatusChart }) {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const { language } = useLocale();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#9fa6ad" : "#5b6b73";
  const valueColor = isDark ? "#e5e7eb" : "#434a51";

  const labels = chart.statuses.map((k) => localizeDomainValue(k, language));
  const colors = chart.statuses.map((k) => STATUS_COLORS[k] ?? "#94a3b8");

  const options: ApexOptions = {
    ...baseChart,
    labels,
    colors,
    legend: {
      ...baseChart.legend,
      position: "bottom",
      labels: { colors: labelColor },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Fleet",
              color: labelColor,
              formatter: () => String(chart.totalFleet),
            },
            value: { color: valueColor, fontSize: "22px", fontWeight: 600 },
          },
        },
      },
    },
  };

  return (
    <ThemedApexChart type="donut" height={CHART_HEIGHT} options={options} series={chart.counts} />
  );
}

export function ApexAlarmTrend({ trend }: { trend?: ApiAlarmTrend }) {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#9fa6ad" : "#5b6b73";

  const options: ApexOptions = {
    ...baseChart,
    chart: { ...baseChart.chart, type: "bar", stacked: true },
    xaxis: { categories: trend?.categories ?? [], labels: { style: { colors: labelColor } } },
    yaxis: { labels: { style: { colors: labelColor } } },
    colors: ["#dc2626", "#d97706"],
    legend: { labels: { colors: labelColor } },
  };

  return (
    <ThemedApexChart
      type="bar"
      height={CHART_HEIGHT}
      options={options}
      series={[
        { name: "Critical", data: trend?.critical ?? [] },
        { name: "Warning", data: trend?.warning ?? [] },
      ]}
    />
  );
}

export function ApexTicketStages({ chart }: { chart: DashboardTicketStageChart }) {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#9fa6ad" : "#5b6b73";

  const options: ApexOptions = {
    ...baseChart,
    chart: { ...baseChart.chart, type: "bar" },
    xaxis: { categories: chart.stages, labels: { style: { colors: labelColor } } },
    yaxis: { labels: { style: { colors: labelColor } } },
    colors: ["#2563eb"],
  };

  return (
    <ThemedApexChart
      type="bar"
      height={CHART_HEIGHT}
      options={options}
      series={[{ name: "Tickets", data: chart.counts }]}
    />
  );
}

export function ApexYieldGauge({ avgYield }: { avgYield: number }) {
  const baseChart = useApexBaseChart();
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const labelColor = isDark ? "#9fa6ad" : "#5b6b73";

  const options: ApexOptions = {
    ...baseChart,
    chart: { ...baseChart.chart, type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "62%" },
        dataLabels: {
          name: { color: labelColor },
          value: { color: isDark ? "#e5e7eb" : "#434a51", fontSize: "22px" },
        },
      },
    },
    labels: ["Yield %"],
    colors: ["#059669"],
  };

  return <ThemedApexChart type="radialBar" height={CHART_HEIGHT} options={options} series={[avgYield]} />;
}
