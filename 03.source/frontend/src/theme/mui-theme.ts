/** Devias Kit Free (MIT) 스타일 MUI 테마 */
export { createTechvalleyTheme, deviasTheme } from "./devias/create-theme";
export {
  apexChartThemes,
  getApexChartTheme,
  getTechvalleyTheme,
  techvalleyThemes,
  themesPreloaded,
} from "@/lib/theme-registry";

import { getTechvalleyTheme } from "@/lib/theme-registry";

/** 하위 호환 — 라이트 고정 */
export const techvalleyTheme = getTechvalleyTheme("light");
