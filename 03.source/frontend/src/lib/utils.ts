import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatLocaleDateTime } from "@/lib/locale/datetime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_DT_OPTS = { language: "ko" as const, timeZone: "Asia/Seoul" };

export function formatDateTime(iso: string) {
  return formatLocaleDateTime(iso, { ...DEFAULT_DT_OPTS, preset: "short" });
}

export function formatDate(iso: string) {
  return formatLocaleDateTime(iso, { ...DEFAULT_DT_OPTS, preset: "date" });
}

export function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}
