/**
 * 테이블: `yield_inspection_record`, `algorithm_config`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 수율 검사 기록 — UI inspection */
@Entity('yield_inspection_record')
export class YieldInspectionRecordEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'lot_no', type: 'varchar', length: 64 })
  lot_no: string;

  @Column({ name: 'serial_no', type: 'varchar', length: 128 })
  serial_no: string;

  /** NUMERIC — TypeORM에서 string으로 반환 */
  @Column({ name: 'yield_pct', type: 'numeric' })
  yield_pct: string;

  @Column({ name: 'inspected_at', type: 'timestamptz' })
  inspected_at: Date;

  @Column({ name: 'algorithm_version', type: 'varchar', length: 64 })
  algorithm_version: string;
}

/** 검사 알고리즘 설정 — threshold·버전·적용 단말 수 */
@Entity('algorithm_config')
export class AlgorithmConfigEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'config_code', type: 'varchar', length: 64 })
  config_code: string;

  @Column({ name: 'config_name', type: 'varchar', length: 128 })
  config_name: string;

  @Column({ name: 'version_label', type: 'varchar', length: 32 })
  version_label: string;

  /** NUMERIC — TypeORM에서 string으로 반환 */
  @Column({ type: 'numeric', default: 0.95 })
  threshold: string;

  /** active | draft | deprecated 등 */
  @Column({ type: 'varchar', length: 24, default: 'active' })
  status: string;

  @Column({ name: 'applied_device_count', type: 'int', default: 0 })
  applied_device_count: number;
}
