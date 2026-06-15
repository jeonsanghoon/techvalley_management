/**
 * 테이블: `service_ticket`, `engineer_profile`, `as_record`,
 *         `sla_fleet_snapshot`, `sla_contract_definition`
 * DDL: 04-tv-domain-extensions.sql (`service_ticket` 등) + 06-ui-portal-schema.sql (`portal_meta`)
 * PK: BIGINT snowflake (전 테이블 `generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 서비스 티켓 — UI service-tickets */
@Entity('service_ticket')
export class ServiceTicketEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'ticket_no', type: 'varchar', length: 64 })
  ticket_no: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'device_id', type: 'int', nullable: true })
  device_id: number | null;

  @Column({ name: 'site_id', type: 'int', nullable: true })
  site_id: number | null;

  /** open | in_progress | closed 등 */
  @Column({ name: 'ticket_status', type: 'varchar', length: 24, default: 'open' })
  ticket_status: string;

  @Column({ name: 'priority_type', type: 'int', default: 2 })
  priority_type: number;

  @Column({ type: 'varchar', length: 512 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'opened_at', type: 'timestamptz' })
  opened_at: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closed_at: Date | null;

  /** UI ServiceTicket: stage, engineer, SLA, customer snapshot */
  @Column({ name: 'portal_meta', type: 'jsonb', default: {} })
  portal_meta: Record<string, unknown>;
}

/** 현장 엔지니어 프로필 — service-progress */
@Entity('engineer_profile')
export class EngineerProfileEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  display_name: string;

  @Column({ name: 'region_label', type: 'varchar', length: 64 })
  region_label: string;

  /** 전문 분야 목록 (JSON 배열) */
  @Column({ type: 'jsonb', default: [] })
  specialty: string[];

  /** 출동가능 | 배정중 | 휴무 등 */
  @Column({ name: 'availability_status', type: 'varchar', length: 24, default: '출동가능' })
  availability_status: string;
}

/** AS(애프터서비스) 정비 이력 — UI as */
@Entity('as_record')
export class AsRecordEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'service_type', type: 'varchar', length: 48 })
  service_type: string;

  @Column({ name: 'performed_at', type: 'timestamptz' })
  performed_at: Date;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  /** 사용 부품 목록 (JSON 배열) */
  @Column({ name: 'parts_used_json', type: 'jsonb', default: [] })
  parts_used_json: unknown;
}

/** 플릿 SLA 스냅샷 — UI sla 대시보드 */
@Entity('sla_fleet_snapshot')
export class SlaFleetSnapshotEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'snapshot_at', type: 'timestamptz' })
  snapshot_at: Date;

  @Column({ name: 'fleet_size', type: 'int' })
  fleet_size: number;

  /** NUMERIC — TypeORM에서 string으로 반환 */
  @Column({ name: 'uptime_pct', type: 'numeric' })
  uptime_pct: string;

  @Column({ name: 'critical_open_count', type: 'int' })
  critical_open_count: number;

  @Column({ name: 'metrics_json', type: 'jsonb', default: {} })
  metrics_json: unknown;
}

/** SLA 계약 등급 정의 — response/resolve/uptime 목표 */
@Entity('sla_contract_definition')
export class SlaContractDefinitionEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'tier_code', type: 'varchar', length: 32 })
  tier_code: string;

  @Column({ name: 'tier_name', type: 'varchar', length: 64 })
  tier_name: string;

  /** 응답 SLA (분) */
  @Column({ name: 'response_minutes', type: 'int' })
  response_minutes: number;

  /** 해결 SLA (분) */
  @Column({ name: 'resolve_minutes', type: 'int' })
  resolve_minutes: number;

  /** NUMERIC — TypeORM에서 string으로 반환 */
  @Column({ name: 'uptime_target_pct', type: 'numeric' })
  uptime_target_pct: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
