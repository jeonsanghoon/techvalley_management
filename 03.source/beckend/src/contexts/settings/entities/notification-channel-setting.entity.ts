/**
 * 테이블: `notification_channel_setting`
 * DDL: 06-ui-portal-schema.sql
 * PK: BIGINT snowflake (`generate_snowflake_id()`)
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 알림 채널 설정 — settings/notifications (이메일·Slack·Webhook 등) */
@Entity('notification_channel_setting')
export class NotificationChannelSettingEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'channel_code', type: 'varchar', length: 64 })
  channel_code: string;

  @Column({ name: 'channel_name', type: 'varchar', length: 128 })
  channel_name: string;

  /** email | slack | webhook 등 */
  @Column({ name: 'channel_type', type: 'varchar', length: 24 })
  channel_type: string;

  /** 수신 대상 URL·주소 등 */
  @Column({ type: 'varchar', length: 512 })
  target: string;

  /** 전달할 심각도 필터 (JSON 배열, 기본 warning·critical) */
  @Column({ name: 'severity_filter', type: 'jsonb', default: ['warning', 'critical'] })
  severity_filter: string[];

  /** 수신자 목록 (쉼표 구분 등) */
  @Column({ type: 'text', default: '' })
  recipients: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
