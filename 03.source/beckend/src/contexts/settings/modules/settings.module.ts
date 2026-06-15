/**
 * @file settings.module.ts
 * @description 시스템 설정 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - NotificationChannelSettingEntity: 알림 채널(이메일·웹훅 등) 설정
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationChannelSettingEntity } from '../entities/notification-channel-setting.entity';
import { SettingsController } from '../controllers/settings.controller';
import { SettingsService } from '../services/settings.service';
import { SettingsDao } from '../dao/settings.dao';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationChannelSettingEntity])],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsDao],
})
export class SettingsModule {}
