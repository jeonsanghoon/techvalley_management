import { alarms, equipments, serviceTickets } from "@/lib/mock-data";
import type { EquipmentLogEntry } from "@/lib/types";
import { BATCH_SOURCES, type DataSourceMeta } from "../scope";
import { BATCH_FLEET_AS_OF } from "./fleet-snapshot";

export const batchEquipmentLogsMeta: DataSourceMeta = {
  scope: "batch",
  asOf: BATCH_FLEET_AS_OF,
  source: BATCH_SOURCES.equipmentLogs,
  refreshInterval: "Warm Tier 조회 (near-line, 스트림 아님)",
};

const LOG_TEMPLATES: {
  category: EquipmentLogEntry["category"];
  source: string;
  level: EquipmentLogEntry["level"];
  message: string;
  payload?: string;
}[] = [
  { category: "튜브", source: "tube.telemetry", level: "INFO", message: "튜브 kV/mA/s 스냅샷 수신", payload: '{"kv":160,"ma":3.5,"sec":0.8}' },
  { category: "튜브", source: "tube.lifecycle", level: "WARN", message: "튜브 잔여 수명 30% 미만", payload: '{"life_pct":28}' },
  { category: "디텍터", source: "detector.telemetry", level: "INFO", message: "디텍터 온도·상태 수신", payload: '{"temp_c":38.2,"status":"ok"}' },
  { category: "디텍터", source: "detector.calibration", level: "INFO", message: "캘리브레이션 완료", payload: '{"offset":0.02}' },
  { category: "본체", source: "body.telemetry", level: "INFO", message: "본체 온도·가동시간 수신", payload: '{"body_temp":42.1,"uptime_h":12450}' },
  { category: "본체", source: "greengrass.core", level: "WARN", message: "Greengrass 스풀 버퍼 2.4MB", payload: '{"spool_mb":2.4}' },
  { category: "원격제어", source: "iot.jobs", level: "INFO", message: "IoT Job 실행 — kV 파라미터 적용", payload: '{"job":"param-set","kv":160}' },
  { category: "원격제어", source: "device.shadow", level: "INFO", message: "Shadow desired/reported 동기화", payload: '{"delta":null}' },
  { category: "펌웨어", source: "ota.job", level: "INFO", message: "OTA Job 수락 — v3.2.2", payload: '{"target":"v3.2.2"}' },
  { category: "펌웨어", source: "ota.job", level: "WARN", message: "OTA 검증 대기 — 서명 확인 중", payload: '{"progress":45}' },
  { category: "주기", source: "cron.heartbeat", level: "INFO", message: "5분 주기 헬스체크 OK", payload: '{"interval":"5m"}' },
  { category: "주기", source: "cron.yield", level: "INFO", message: "수율 집계 주기 보고", payload: '{"yield_pct":96.5}' },
  { category: "이벤트", source: "eventbridge", level: "INFO", message: "장비 상태 전이 online → alarm", payload: '{"from":"online","to":"alarm"}' },
  { category: "이벤트", source: "eventbridge", level: "INFO", message: "네트워크 재연결", payload: '{"duration_s":320}' },
  { category: "감사", source: "cloudtrail", level: "INFO", message: "원격제어 API 호출 — 사용자 park@techvalley.io", payload: '{"action":"RemoteControl.Execute"}' },
];

function isoOffset(minutesAgo: number): string {
  const d = new Date(BATCH_FLEET_AS_OF);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString().replace("Z", "+09:00").replace(".000", "");
}

function buildBatchEquipmentLogs(): EquipmentLogEntry[] {
  const logs: EquipmentLogEntry[] = [];
  let seq = 1;

  equipments.forEach((eq, eqIdx) => {
    LOG_TEMPLATES.forEach((tpl, tplIdx) => {
      logs.push({
        id: `elog-${String(seq++).padStart(5, "0")}`,
        equipmentId: eq.id,
        serialNo: eq.serialNo,
        category: tpl.category,
        source: tpl.source,
        level: eq.status === "alarm" && tpl.category === "튜브" ? "ERROR" : tpl.level,
        message: tpl.message,
        payload: tpl.payload,
        occurredAt: isoOffset(eqIdx * 12 + tplIdx * 3 + (tplIdx % 5)),
        traceId: `tr-${eq.id.slice(-3)}-${tplIdx}`,
      });
    });
  });

  alarms.forEach((a) => {
    logs.push({
      id: `elog-${String(seq++).padStart(5, "0")}`,
      equipmentId: a.equipmentId,
      serialNo: a.equipmentSn,
      category: "알람",
      source: "alarm.rule",
      level: a.severity === "critical" ? "ERROR" : "WARN",
      message: a.message,
      payload: JSON.stringify({ rule: a.ruleName, ticket: a.ticketId }),
      occurredAt: a.triggeredAt,
      traceId: a.id,
    });
  });

  serviceTickets.forEach((t) => {
    logs.push({
      id: `elog-${String(seq++).padStart(5, "0")}`,
      equipmentId: equipments.find((e) => e.serialNo === t.equipmentSn)?.id ?? "unknown",
      serialNo: t.equipmentSn,
      category: "이벤트",
      source: "service.ticket",
      level: "INFO",
      message: `서비스 티켓 ${t.stage} — ${t.symptom}`,
      payload: JSON.stringify({ ticketId: t.id, stage: t.stage }),
      occurredAt: t.createdAt,
      traceId: t.id,
    });
  });

  return logs.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export const batchEquipmentLogs = buildBatchEquipmentLogs();
