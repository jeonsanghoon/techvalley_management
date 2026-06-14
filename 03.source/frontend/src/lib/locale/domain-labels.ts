import type { AppLanguage, LocalizableText } from "./types";
import { localeLabel } from "./types";

/** 그리드·검색·필터에 표시되는 도메인 값 */
export const DOMAIN_VALUE_I18N: Record<string, LocalizableText> = {
  "시스템 관리자": { ko: "시스템 관리자", en: "System admin" },
  "서비스 엔지니어": { ko: "서비스 엔지니어", en: "Service engineer" },
  "상담·CS": { ko: "상담·CS", en: "Customer support" },
  "고객사·대리점": { ko: "고객사·대리점", en: "Customer / dealer" },
  active: { ko: "활성", en: "Active" },
  inactive: { ko: "비활성", en: "Inactive" },
  online: { ko: "가동", en: "Online" },
  offline: { ko: "오프라인", en: "Offline" },
  alarm: { ko: "알람", en: "Alarm" },
  maintenance: { ko: "정비", en: "Maintenance" },
  safe_mode: { ko: "안전모드", en: "Safe mode" },
  critical: { ko: "Critical", en: "Critical" },
  warning: { ko: "Warning", en: "Warning" },
  healthy: { ko: "정상", en: "Healthy" },
  error: { ko: "오류", en: "Error" },
  connected: { ko: "연결됨", en: "Connected" },
  disconnected: { ko: "연결 끊김", en: "Disconnected" },
  staging: { ko: "스테이징", en: "Staging" },
  접수: { ko: "접수", en: "Received" },
  배정: { ko: "배정", en: "Assigned" },
  출동: { ko: "출동", en: "Dispatched" },
  작업: { ko: "작업", en: "In progress" },
  완료: { ko: "완료", en: "Completed" },
  요청: { ko: "요청", en: "Requested" },
  확정: { ko: "확정", en: "Confirmed" },
  출고: { ko: "출고", en: "Shipped" },
  운송중: { ko: "운송중", en: "In transit" },
  도착: { ko: "도착", en: "Arrived" },
  교체완료: { ko: "교체완료", en: "Replaced" },
  예정: { ko: "예정", en: "Planned" },
  진행중: { ko: "진행중", en: "In progress" },
  시운전: { ko: "시운전", en: "Commissioning" },
  완료됨: { ko: "완료", en: "Done" },
  대기: { ko: "대기", en: "Pending" },
  전체: { ko: "전체", en: "All" },
  고객사: { ko: "고객사", en: "Customer" },
  대리점: { ko: "대리점", en: "Dealer" },
  주기: { ko: "주기", en: "Periodic" },
  이벤트: { ko: "이벤트", en: "Event" },
  펌웨어: { ko: "펌웨어", en: "Firmware" },
  제어: { ko: "제어", en: "Control" },
  "즉시 원격가능": { ko: "즉시 원격가능", en: "Remote-ready" },
  "당일 방문": { ko: "당일 방문", en: "Same-day visit" },
  "익일 방문": { ko: "익일 방문", en: "Next-day visit" },
  "부품 대기": { ko: "부품 대기", en: "Awaiting parts" },
  튜브: { ko: "튜브", en: "Tube" },
  디텍터: { ko: "디텍터", en: "Detector" },
  본체: { ko: "본체", en: "Body" },
  알람: { ko: "알람", en: "Alarm" },
  원격제어: { ko: "원격제어", en: "Remote control" },
  감사: { ko: "감사", en: "Audit" },
  composite: { ko: "복합", en: "Composite" },
  INFO: { ko: "INFO", en: "INFO" },
  WARN: { ko: "WARN", en: "WARN" },
  ERROR: { ko: "ERROR", en: "ERROR" },
  DEBUG: { ko: "DEBUG", en: "DEBUG" },
  resolved: { ko: "해결", en: "Resolved" },
  failed: { ko: "실패", en: "Failed" },
  pending: { ko: "대기", en: "Pending" },
  "SLA 위반": { ko: "SLA 위반", en: "SLA breached" },
};

export function localizeDomainValue(
  value: string | null | undefined,
  language: AppLanguage,
): string {
  if (value == null || value === "") return "—";
  const entry = DOMAIN_VALUE_I18N[value];
  return entry ? localeLabel(entry, language) : value;
}

export function localizeActionLabel(action: string, language: AppLanguage): string {
  const map: Record<string, LocalizableText> = {
    view: { ko: "조회", en: "View" },
    create: { ko: "등록", en: "Create" },
    update: { ko: "수정", en: "Update" },
    delete: { ko: "삭제", en: "Delete" },
    export: { ko: "보내기", en: "Export" },
    execute: { ko: "실행", en: "Execute" },
  };
  const entry = map[action];
  return entry ? localeLabel(entry, language) : action;
}

export function localizeAppRole(role: string, language: AppLanguage): string {
  const map: Record<string, LocalizableText> = {
    admin: { ko: "시스템 관리자", en: "System admin" },
    engineer: { ko: "서비스 엔지니어", en: "Service engineer" },
    cs: { ko: "상담·CS", en: "Customer support" },
    customer: { ko: "고객사·대리점", en: "Customer / dealer" },
  };
  const entry = map[role];
  return entry ? localeLabel(entry, language) : role;
}
