/** KPI·섹션·패널 카드 공통 색상 톤 */
export type CardTone = "default" | "primary" | "success" | "warning" | "danger" | "info";

export interface CardToneStyle {
  bg: string;
  border: string;
  accent: string;
  label: string;
  value: string;
  headerBg: string;
}

export const CARD_TONES: Record<CardTone, CardToneStyle> = {
  default: {
    bg: "#ffffff",
    border: "#c5d0d9",
    accent: "#64748b",
    label: "#5b6b73",
    value: "#1c2b33",
    headerBg: "#f8fafc",
  },
  primary: {
    bg: "#f4f3ff",
    border: "#c4bfff",
    accent: "#635bff",
    label: "#432ad8",
    value: "#635bff",
    headerBg: "#ecebff",
  },
  success: {
    bg: "#ecfdf5",
    border: "#34d399",
    accent: "#059669",
    label: "#047857",
    value: "#059669",
    headerBg: "#d1fae5",
  },
  warning: {
    bg: "#fffbeb",
    border: "#fbbf24",
    accent: "#d97706",
    label: "#b45309",
    value: "#d97706",
    headerBg: "#fef3c7",
  },
  danger: {
    bg: "#fef2f2",
    border: "#f87171",
    accent: "#dc2626",
    label: "#b91c1c",
    value: "#dc2626",
    headerBg: "#fee2e2",
  },
  info: {
    bg: "#e0f2fe",
    border: "#38bdf8",
    accent: "#0284c7",
    label: "#0369a1",
    value: "#0284c7",
    headerBg: "#bae6fd",
  },
};

/** StatCard variant → CardTone */
export function statVariantToTone(
  variant: "default" | "success" | "warning" | "danger" | "info",
): CardTone {
  if (variant === "danger") return "danger";
  return variant;
}

/** 엔지니어·장비 등 상태 문자열 → 톤 */
export function statusToTone(status: string): CardTone {
  const s = status.toLowerCase();
  if (s.includes("출동") || s.includes("가능") || s === "online" || s === "healthy" || s === "완료") {
    return "success";
  }
  if (s.includes("작업") || s.includes("정비") || s.includes("maintenance") || s === "warning") {
    return "warning";
  }
  if (s.includes("알람") || s === "alarm" || s === "critical" || s === "error" || s.includes("휴무")) {
    return s.includes("휴무") ? "default" : "danger";
  }
  if (s.includes("배정") || s === "info") return "info";
  return "primary";
}
