/**
 * 테이블: `report_definition`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 리포트 정의·메타 — UI reports 목록 */
@Entity('report_definition')
export class ReportDefinitionEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'report_code', type: 'varchar', length: 64 })
  report_code: string;

  @Column({ name: 'report_name', type: 'varchar', length: 256 })
  report_name: string;

  @Column({ type: 'varchar', length: 64 })
  category: string;

  @Column({ name: 'last_generated_at', type: 'timestamptz', nullable: true })
  last_generated_at: Date | null;

  /** BIGINT — TypeORM에서 string으로 반환 */
  @Column({ name: 'record_count', type: 'bigint', default: 0 })
  record_count: string;
}
