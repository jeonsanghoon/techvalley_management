"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import { useMemo, type ComponentProps } from "react";
import type { ApexOptions } from "apexcharts";
import type ReactApexChart from "react-apexcharts";
import { useColorMode } from "@/contexts/ColorModeContext";
import { getApexChartTheme } from "@/lib/charts/apex-theme";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ThemedApexChartProps = ComponentProps<typeof ReactApexChart>;

/** 테마 슬라이스 위에 차트별 옵션 병합 — chart·theme 중첩 덮어쓰기 방지 */
function mergeApexOptions(themeBase: ApexOptions, override: ApexOptions = {}): ApexOptions {
  return {
    ...themeBase,
    ...override,
    theme: { ...themeBase.theme, ...override.theme },
    chart: { ...themeBase.chart, ...override.chart },
    grid: { ...themeBase.grid, ...override.grid },
    legend: { ...themeBase.legend, ...override.legend },
    tooltip: { ...themeBase.tooltip, ...override.tooltip },
    xaxis: { ...themeBase.xaxis, ...override.xaxis },
    yaxis: override.yaxis !== undefined ? override.yaxis : themeBase.yaxis,
  };
}

/** 사전 생성 Apex 테마 + 모드별 remount로 차트 색상·메뉴 즉시 반영 */
export function ThemedApexChart({ options, ...rest }: ThemedApexChartProps) {
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const height = typeof rest.height === "number" ? rest.height : 220;

  const mergedOptions = useMemo(
    () => mergeApexOptions(getApexChartTheme(isDark) as ApexOptions, options),
    [isDark, options],
  );

  return (
    <Box className="tv-apex-chart" sx={{ minHeight: height, width: "100%" }}>
      <Chart key={mode} {...rest} options={mergedOptions} width="100%" />
    </Box>
  );
}
