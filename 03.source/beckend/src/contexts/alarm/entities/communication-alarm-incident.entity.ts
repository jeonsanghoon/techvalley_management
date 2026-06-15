/**
 * 테이블: `communication_alarm_incident`
 * DDL: 02-pipeline-alarm-notification.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 *
 * 전체 컬럼 대비 핵심 필드만 매핑 — 상세 조회는 raw SQL/DAO 사용.
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 통신 품질 알람 인시던트 — open/ack/close 워크플로우의 중심 레코드 */
@Entity('communication_alarm_incident')
export class CommunicationAlarmIncidentEntity {
  /** BIGINT snowflake — JS에서는 string으로 다룸 */
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'alert_code', type: 'varchar', length: 128 })
  alert_code: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64, nullable: true })
  device_code: string | null;

  /** 알람 심각도 타입 (common_code 또는 내부 enum) */
  @Column({ name: 'severity_type', type: 'int' })
  severity_type: number;

  /** open | acknowledged | closed 등 */
  @Column({ name: 'incident_status', type: 'varchar', length: 24, default: 'open' })
  incident_status: string;

  @Column({ name: 'opened_at', type: 'timestamptz' })
  opened_at: Date;
}
