/**
 * 테이블: `remote_diagnosis_finding`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 원격 진단 소견 — UI remote-diagnosis */
@Entity('remote_diagnosis_finding')
export class RemoteDiagnosisFindingEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'finding_code', type: 'varchar', length: 64 })
  finding_code: string;

  /** info | warning | critical 등 */
  @Column({ type: 'varchar', length: 16 })
  severity: string;

  @Column({ type: 'varchar', length: 256 })
  title: string;

  @Column({ type: 'text' })
  detail: string;

  @Column({ name: 'suggested_action', type: 'text', nullable: true })
  suggested_action: string | null;

  @Column({ name: 'detected_at', type: 'timestamptz' })
  detected_at: Date;
}
