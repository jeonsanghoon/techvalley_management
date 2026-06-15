import type { Alarm, ServiceTicket } from "@/lib/types";

export type FleetMapOperationalContext = {
  alarm: Alarm | null;
  ticket: ServiceTicket | null;
};

export function getFleetMapOperationalContext(
  serialNo: string,
  alarms: Alarm[],
  openTickets: ServiceTicket[],
  allTickets: ServiceTicket[] = openTickets,
): FleetMapOperationalContext {
  const equipmentAlarms = alarms.filter((a) => a.equipmentSn === serialNo);
  const alarm =
    equipmentAlarms.find((a) => !a.acknowledged) ?? equipmentAlarms[0] ?? null;

  const ticket =
    (alarm?.ticketId ? openTickets.find((t) => t.id === alarm.ticketId) : undefined) ??
    openTickets.find((t) => t.equipmentSn === serialNo) ??
    (alarm?.ticketId
      ? allTickets.find((t) => t.id === alarm.ticketId)
      : allTickets.find((t) => t.equipmentSn === serialNo && t.stage !== "closed" && t.stage !== "완료")) ??
    null;

  return { alarm, ticket };
}

export function formatAlarmTime(iso: string): string {
  return iso.replace("T", " ").slice(5, 16);
}
