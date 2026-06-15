/**
 * 테이블: `dashboard_alarm_daily`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 대시보드 알람 일별 집계 — critical/warning 트렌드 차트 */
@Entity('dashboard_alarm_daily')
export class DashboardAlarmDailyEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  /** DATE — TypeORM에서 string(YYYY-MM-DD)으로 반환, UK */
  @Column({ name: 'stat_date', type: 'date', unique: true })
  stat_date: string;

  @Column({ name: 'critical_count', type: 'int', default: 0 })
  critical_count: number;

  @Column({ name: 'warning_count', type: 'int', default: 0 })
  warning_count: number;
}
