/**
 * 테이블: `product`, `firmware`, `iot_thing_registry`
 * DDL: 01-core-schema.sql (`product`, `firmware`) + 06-ui-portal-schema.sql (`iot_thing_registry`)
 * PK: INT (`product`, `firmware`) / BIGINT snowflake (`iot_thing_registry`)
 */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 제품 마스터 — 단말이 참조하는 제품군 */
@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  product_name: string;

  @Column({ name: 'is_use', type: 'boolean', default: true })
  is_use: boolean;
}

/** 펌웨어 정본 버전 — OTA·단말 firmware_id FK 대상 */
@Entity('firmware')
export class FirmwareEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'firmware_version', type: 'varchar', length: 64 })
  firmware_version: string;

  @Column({ name: 'is_use', type: 'boolean', default: true })
  is_use: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

/** AWS IoT Thing·인증서·정책 매핑 — admin/iot-auth */
@Entity('iot_thing_registry')
export class IotThingRegistryEntity {
  /** BIGINT snowflake — JS에서는 string으로 다룸 */
  @Column({ type: 'bigint', primary: true })
  id: string;

  @Column({ name: 'device_code', type: 'varchar', length: 64 })
  device_code: string;

  @Column({ name: 'thing_name', type: 'varchar', length: 128 })
  thing_name: string;

  @Column({ name: 'certificate_id', type: 'varchar', length: 128 })
  certificate_id: string;

  @Column({ name: 'policy_name', type: 'varchar', length: 128 })
  policy_name: string;

  /** pending | connected | disconnected 등 */
  @Column({ name: 'connection_status', type: 'varchar', length: 24, default: 'pending' })
  connection_status: string;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  last_seen_at: Date | null;
}
