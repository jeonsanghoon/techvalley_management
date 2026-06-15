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

/** 상태 코드 → 카드 톤 (common_code ref_data1 영문 코드 + 레거시 한글 호환) */
export function statusToTone(status: string): CardTone {
  const s = status.toLowerCase();
  // 영문 코드 (TKST/EQST common_code ref_data1)
  if (s === "dispatched" || s === "closed" || s === "done" || s === "online" || s === "healthy") {
    return "success";
  }
  if (s === "in_progress" || s === "maintenance") return "warning";
  if (s === "alarm" || s === "critical" || s === "error") return "danger";
  if (s === "assigned" || s === "info") return "info";
  if (s === "open" || s === "planned" || s === "commissioning") return "primary";
  // 레거시 한글 코드 호환
  if (s.includes("출동") || s.includes("가능") || s.includes("완료")) return "success";
  if (s.includes("작업") || s.includes("정비")) return "warning";
  if (s.includes("알람") || s.includes("휴무")) return s.includes("휴무") ? "default" : "danger";
  if (s.includes("배정")) return "info";
  return "primary";
}
