/**
 * 테이블: `parts_order`, `parts_schedule`
 * DDL: 04-tv-domain-extensions.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 부품 주문 — UI parts-orders */
@Entity('parts_order')
export class PartsOrderEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_no', type: 'varchar', length: 64 })
  order_no: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64, nullable: true })
  device_code: string | null;

  @Column({ name: 'part_type_code', type: 'varchar', length: 32 })
  part_type_code: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  /** requested | shipped | delivered 등 */
  @Column({ name: 'order_status', type: 'varchar', length: 24, default: 'requested' })
  order_status: string;

  @Column({ name: 'ordered_at', type: 'timestamptz' })
  ordered_at: Date;
}

/** 부품 교체 예정 일정 — UI parts-schedule */
@Entity('parts_schedule')
export class PartsScheduleEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'part_type_code', type: 'varchar', length: 32 })
  part_type_code: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduled_at: Date;

  /** planned | completed | cancelled 등 */
  @Column({ name: 'schedule_status', type: 'varchar', length: 24, default: 'planned' })
  schedule_status: string;
}
