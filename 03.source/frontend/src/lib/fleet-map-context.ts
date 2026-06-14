import { batchAlarms, batchOpenTickets, batchServiceTickets } from "@/lib/data/batch/operational-snapshot";
import type { Alarm, ServiceTicket } from "@/lib/types";

export type FleetMapOperationalContext = {
  alarm: Alarm | null;
  ticket: ServiceTicket | null;
};

/** 지도 마커 — 장비 S/N 기준 최신 알람 + 진행 중 처리(티켓) */
export function getFleetMapOperationalContext(serialNo: string): FleetMapOperationalContext {
  const equipmentAlarms = batchAlarms.filter((a) => a.equipmentSn === serialNo);
  const alarm =
    equipmentAlarms.find((a) => !a.acknowledged) ??
    equipmentAlarms[0] ??
    null;

  const ticket =
    (alarm?.ticketId ? batchOpenTickets.find((t) => t.id === alarm.ticketId) : undefined) ??
    batchOpenTickets.find((t) => t.equipmentSn === serialNo) ??
    (alarm?.ticketId
      ? batchServiceTickets.find((t) => t.id === alarm.ticketId)
      : batchServiceTickets.find((t) => t.equipmentSn === serialNo && t.stage !== "완료")) ??
    null;

  return { alarm, ticket };
}

export function formatAlarmTime(iso: string): string {
  return iso.replace("T", " ").slice(5, 16);
}
