/**
 * @file settings.service.ts
 * @description 시스템 설정(알림 채널) 도메인 비즈니스 로직.
 *              NotificationChannel CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapNotificationChannel, wrapData } from '../../../common/mappers';
import { SettingsDao } from '../dao/settings.dao';
import type { NotificationChannelRow } from '../../../common/types/db/postgres-rows';
import type {
  CreateNotificationChannelDto,
  UpdateNotificationChannelDto,
} from '../dto/settings-crud.dto';

/**
 * 알림 채널 설정 CRUD 서비스.
 * SettingsDao를 통해 notification_channel_setting 테이블에 접근한다.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly dao: SettingsDao) {}

  /** 알림 채널 목록 조회. GET /api/settings/notification-channels */
  async listNotificationChannels() {
    const rows = await this.dao.findAllOrdered();
    return wrapData(
      { items: rows.map((r) => mapNotificationChannel(r as NotificationChannelRow)) },
      batchMeta('postgres.notification_channel_setting'),
    );
  }

  /** 알림 채널 단건 조회. GET /api/settings/notification-channels/:id */
  async getNotificationChannel(id: string) {
    const row = await this.dao.findById(id);
    if (!row) throw new NotFoundException(`Notification channel ${id} not found`);
    return wrapData(mapNotificationChannel(row as NotificationChannelRow), batchMeta('postgres.notification_channel_setting'));
  }

  /** 알림 채널 생성. POST /api/settings/notification-channels — severity_filter·enabled 기본값 적용 */
  async createNotificationChannel(dto: CreateNotificationChannelDto) {
    const row = await this.dao.createRow({
      ...dto,
      severity_filter: dto.severity_filter ?? ['warning', 'critical'],
      recipients: dto.recipients ?? '',
      enabled: dto.enabled ?? true,
    });
    return wrapData(mapNotificationChannel(row as NotificationChannelRow), batchMeta('postgres.notification_channel_setting'));
  }

  /** 알림 채널 수정. PUT /api/settings/notification-channels/:id */
  async updateNotificationChannel(id: string, dto: UpdateNotificationChannelDto) {
    await this.dao.updateRow(id, dto);
    return this.getNotificationChannel(id);
  }

  /**
   * 알림 채널 삭제 (하드 삭제).
   * DELETE /api/settings/notification-channels/:id — DAO deleteRow.
   */
  async deleteNotificationChannel(id: string) {
    await this.dao.deleteRow(id);
    return { deleted: true, id };
  }
}
