import type { Alarm } from "@/lib/types";

export type AlarmQuickFilter =
  | "all"
  | "unacked_critical"
  | "unacked"
  | "no_ticket"
  | "remote_pending";

export const ALARM_QUICK_FILTERS: {
  id: AlarmQuickFilter;
  label: string;
  description: string;
}[] = [
  { id: "all", label: "전체", description: "배치 스냅샷 전체 알람" },
  { id: "unacked_critical", label: "미확인 Critical", description: "SLA 15분 내 1차 대응 대상" },
  { id: "unacked", label: "미확인", description: "확인 처리 필요" },
  { id: "no_ticket", label: "티켓 없음", description: "서비스 호출 미연계" },
  { id: "remote_pending", label: "원격 대기", description: "원격 시도 후 결과 대기" },
];

export function matchesAlarmQuickFilter(alarm: Alarm, filter: AlarmQuickFilter): boolean {
  switch (filter) {
    case "unacked_critical":
      return !alarm.acknowledged && alarm.severity === "critical";
    case "unacked":
      return !alarm.acknowledged;
    case "no_ticket":
      return !alarm.ticketId;
    case "remote_pending":
      return alarm.remoteAttempted && alarm.remoteResult === "pending";
    default:
      return true;
  }
}

export function alarmOpsStats(alarms: Alarm[]) {
  const unackedCritical = alarms.filter((a) => !a.acknowledged && a.severity === "critical");
  return {
    total: alarms.length,
    critical: alarms.filter((a) => a.severity === "critical").length,
    unacked: alarms.filter((a) => !a.acknowledged).length,
    unackedCritical: unackedCritical.length,
    withTicket: alarms.filter((a) => a.ticketId).length,
    remotePending: alarms.filter((a) => a.remoteAttempted && a.remoteResult === "pending").length,
    oldestUnackedCriticalAt: unackedCritical.reduce<string | null>((oldest, a) => {
      if (!oldest || a.triggeredAt < oldest) return a.triggeredAt;
      return oldest;
    }, null),
  };
}
