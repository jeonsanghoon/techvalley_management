/**
 * @file settings.controller.ts
 * @description 설정 REST API. prefix `api/settings`.
 * @routes GET/POST/PUT/DELETE /api/settings/notification-channels, /api/settings/notification-channels/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import {
  CreateNotificationChannelDto,
  UpdateNotificationChannelDto,
} from '../dto/settings-crud.dto';

/** 알림 채널 설정 CRUD HTTP 엔드포인트 그룹. */
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  /** GET /api/settings/notification-channels — 알림 채널 목록 */
  @Get('notification-channels')
  notificationChannels() {
    return this.service.listNotificationChannels();
  }

  /** GET /api/settings/notification-channels/:id — 알림 채널 단건 */
  @Get('notification-channels/:id')
  notificationChannel(@Param('id') id: string) {
    return this.service.getNotificationChannel(id);
  }

  /** POST /api/settings/notification-channels — 알림 채널 생성 */
  @Post('notification-channels')
  createNotificationChannel(@Body() dto: CreateNotificationChannelDto) {
    return this.service.createNotificationChannel(dto);
  }

  /** PUT /api/settings/notification-channels/:id — 알림 채널 수정 */
  @Put('notification-channels/:id')
  updateNotificationChannel(@Param('id') id: string, @Body() dto: UpdateNotificationChannelDto) {
    return this.service.updateNotificationChannel(id, dto);
  }

  /** DELETE /api/settings/notification-channels/:id — 알림 채널 하드 삭제 */
  @Delete('notification-channels/:id')
  deleteNotificationChannel(@Param('id') id: string) {
    return this.service.deleteNotificationChannel(id);
  }
}
