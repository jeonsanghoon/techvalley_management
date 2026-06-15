/**
 * 테이블: `equipment_log_tube`, `equipment_log_detector`, `equipment_log_body`,
 *         `equipment_log_control`, `equipment_log_firmware`, `equipment_log_audit`
 * DDL: 04-tv-domain-extensions.sql
 * PK: BIGINT snowflake (전 테이블 `generate_snowflake_id()`)
 *
 * Warm 스토리지 카테고리별 장비 로그 — batch equipment_log_export 대상.
 * `EQUIPMENT_LOG_ENTITIES` / `EQUIPMENT_LOG_ENTITY_MAP`으로 테이블명→엔티티 라우팅.
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 튜브(전압·전류) 이벤트 로그 */
@Entity('equipment_log_tube')
export class EquipmentLogTubeEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  /** 원본 페이로드 (tube_kv, tube_ma 등 상세 필드 포함) */
  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** 검출기 이벤트 로그 */
@Entity('equipment_log_detector')
export class EquipmentLogDetectorEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** 본체(하우징) 이벤트 로그 */
@Entity('equipment_log_body')
export class EquipmentLogBodyEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** 제어 명령·요청 이벤트 로그 */
@Entity('equipment_log_control')
export class EquipmentLogControlEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  /** 원격 제어 요청 식별자 */
  @Column({ name: 'request_code', type: 'varchar', length: 128, nullable: true })
  request_code: string | null;

  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** 펌웨어 업데이트·버전 이벤트 로그 */
@Entity('equipment_log_firmware')
export class EquipmentLogFirmwareEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** 감사·운영 이벤트 로그 */
@Entity('equipment_log_audit')
export class EquipmentLogAuditEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'event_at', type: 'timestamptz' })
  event_at: Date;

  /** 감사 유형 (접근·설정 변경 등) */
  @Column({ name: 'audit_type', type: 'varchar', length: 48 })
  audit_type: string;

  @Column({ name: 'payload_json', type: 'jsonb', default: {} })
  payload_json: unknown;
}

/** TypeORM forFeature 등록용 — 6개 로그 엔티티 일괄 배열 */
export const EQUIPMENT_LOG_ENTITIES = [
  EquipmentLogTubeEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogAuditEntity,
];

export type EquipmentLogTable =
  | 'equipment_log_tube'
  | 'equipment_log_detector'
  | 'equipment_log_body'
  | 'equipment_log_control'
  | 'equipment_log_firmware'
  | 'equipment_log_audit';

/** 동적 테이블명 → 엔티티 클래스 매핑 */
export const EQUIPMENT_LOG_ENTITY_MAP = {
  equipment_log_tube: EquipmentLogTubeEntity,
  equipment_log_detector: EquipmentLogDetectorEntity,
  equipment_log_body: EquipmentLogBodyEntity,
  equipment_log_control: EquipmentLogControlEntity,
  equipment_log_firmware: EquipmentLogFirmwareEntity,
  equipment_log_audit: EquipmentLogAuditEntity,
} as const;
