import type { ApexOptions } from "apexcharts";

/** ApexCharts — 라이트/다크 축·그리드·툴팁·테마 모드 (registry에서 1회 생성) */
export function buildApexChartTheme(isDark: boolean): Pick<
  ApexOptions,
  "theme" | "chart" | "grid" | "legend" | "tooltip" | "xaxis" | "yaxis"
> {
  const gridColor = isDark ? "rgba(255, 255, 255, 0.22)" : "#dde4ea";
  const labelColor = isDark ? "#9fa6ad" : "#5c6670";
  const legendColor = isDark ? "#cdd7e1" : "#434a51";

  return {
    theme: {
      mode: isDark ? "dark" : "light",
    },
    chart: {
      background: "transparent",
      foreColor: labelColor,
      toolbar: { show: false },
    },
    grid: { borderColor: gridColor, strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: {
      labels: { style: { colors: labelColor, fontSize: "11px" } },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      labels: { style: { colors: labelColor, fontSize: "11px" } },
    },
    legend: {
      position: "bottom",
      fontSize: "11px",
      offsetY: 4,
      labels: { colors: legendColor },
      markers: { strokeWidth: 0 },
    },
    tooltip: { theme: isDark ? "dark" : "light" },
  };
}

export function getApexAxisLabelStyle(isDark: boolean) {
  return { colors: isDark ? "#9fa6ad" : "#5c6670", fontSize: "11px" };
}

export { getApexChartTheme } from "@/lib/theme-registry";
