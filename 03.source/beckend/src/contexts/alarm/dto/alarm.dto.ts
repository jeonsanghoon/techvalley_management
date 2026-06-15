/**
 * @file alarm.dto.ts
 * @description 알람 API 응답 DTO — 프론트엔드 `Alarm`, `AlarmRule` 타입과 정렬.
 *
 * PG incident + Mongo notification을 {@link AlarmDto}로 통합 표현.
 * YAML 규칙은 {@link AlarmRuleDto}로 노출.
 */
import type { AlarmSeverity, AlarmRuleTarget } from '../../../common/types/enums';

/** 통합 알람 incident 한 건 (프론트 Alarm 타입 대응) */
export interface AlarmDto {
  id: string;
  equipmentId: string;
  equipmentSn: string;
  ruleName: string;
  severity: AlarmSeverity;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  remoteAttempted: boolean;
  remoteResult?: string;
  ticketId?: string;
  /** 데이터 출처 — documentdb(Mongo) | postgres(incident) */
  source?: 'documentdb' | 'postgres';
}

/** 알람 목록 메타 — Mongo/PG 각각 총 건수 */
export interface AlarmsListMetaDto {
  totalMongo: number;
  totalPostgres: number;
}

export interface AlarmsListResponseDto {
  meta: AlarmsListMetaDto;
  items: AlarmDto[];
}

/** YAML/DB 알람 규칙 한 건 (프론트 AlarmRule 타입 대응) */
export interface AlarmRuleDto {
  id: string;
  name: string;
  target: AlarmRuleTarget | 'composite';
  condition: string;
  severity: AlarmSeverity;
  enabled: boolean;
  notifyChannels: string[];
  triggerRemote: boolean;
  triggerTicket: boolean;
  ruleCode?: string;
  source?: string;
}

export interface AlarmRulesListResponseDto {
  items: AlarmRuleDto[];
  count: number;
}
