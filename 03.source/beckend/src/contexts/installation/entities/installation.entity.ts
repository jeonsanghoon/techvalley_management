/**
 * 테이블: `installation`
 * DDL: 04-tv-domain-extensions.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 장비 설치 이력 — UI installation */
@Entity('installation')
export class InstallationEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'device_id', type: 'int', nullable: true })
  device_id: number | null;

  @Column({ name: 'site_id', type: 'int' })
  site_id: number;

  @Column({ name: 'installed_at', type: 'timestamptz' })
  installed_at: Date;

  @Column({ name: 'installer_note', type: 'text', nullable: true })
  installer_note: string | null;

  @Column({ name: 'status', type: 'varchar', length: 16, nullable: true, default: '완료' })
  status: string | null;
}
