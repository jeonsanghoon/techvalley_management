/**
 * 테이블: `collection_daily_stats`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 데이터 파이프라인 컬렉션 일별 통계 — UI data-pipeline */
@Entity('collection_daily_stats')
export class CollectionDailyStatsEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'collection_name', type: 'varchar', length: 128 })
  collection_name: string;

  /** DATE — TypeORM에서 string(YYYY-MM-DD)으로 반환 */
  @Column({ name: 'stat_date', type: 'date' })
  stat_date: string;

  /** BIGINT — TypeORM에서 string으로 반환 */
  @Column({ name: 'doc_count', type: 'bigint', default: 0 })
  doc_count: string;

  /** Hot | Warm | Cold 등 스토리지 티어 */
  @Column({ type: 'varchar', length: 16, default: 'Hot' })
  tier: string;

  /** healthy | degraded | error 등 */
  @Column({ type: 'varchar', length: 16, default: 'healthy' })
  status: string;
}
