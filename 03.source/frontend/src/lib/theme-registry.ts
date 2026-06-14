import type { PaletteMode, Theme } from "@mui/material";
import { buildApexChartTheme } from "@/lib/charts/apex-theme";
import { createTechvalleyTheme } from "@/theme/devias/create-theme";
import type { ApexOptions } from "apexcharts";

/** 앱 기동 시 light/dark MUI 테마를 한 번만 생성 */
export const techvalleyThemes: Record<PaletteMode, Theme> = {
  light: createTechvalleyTheme("light"),
  dark: createTechvalleyTheme("dark"),
};

export function getTechvalleyTheme(mode: PaletteMode): Theme {
  return techvalleyThemes[mode];
}

type ApexThemeSlice = Pick<
  ApexOptions,
  "theme" | "chart" | "grid" | "legend" | "tooltip" | "xaxis" | "yaxis"
>;

/** ApexCharts 테마 슬라이스 — 모드별 사전 생성 */
export const apexChartThemes: Record<PaletteMode, ApexThemeSlice> = {
  light: buildApexChartTheme(false),
  dark: buildApexChartTheme(true),
};

export function getApexChartTheme(mode: PaletteMode): ApexThemeSlice;
export function getApexChartTheme(isDark: boolean): ApexThemeSlice;
export function getApexChartTheme(modeOrDark: PaletteMode | boolean): ApexThemeSlice {
  if (modeOrDark === "light" || modeOrDark === "dark") {
    return apexChartThemes[modeOrDark];
  }
  return modeOrDark ? apexChartThemes.dark : apexChartThemes.light;
}

export const themesPreloaded = true;
