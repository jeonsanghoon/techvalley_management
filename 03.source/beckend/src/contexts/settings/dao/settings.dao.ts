/**
 * @file settings.dao.ts
 * @description 설정(Settings) 도메인 — 알림 채널 설정 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM {@link SnowflakeCrudDao} 기반
 * - raw SQL 없음 — 단일 테이블 CRUD·정렬 조회
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { NotificationChannelSettingEntity } from '../entities/notification-channel-setting.entity';

/**
 * 알림 채널 설정 DAO.
 * - 엔티티: {@link NotificationChannelSettingEntity} | PK: `string` (snowflake BIGINT) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class SettingsDao extends SnowflakeCrudDao<NotificationChannelSettingEntity> {
  constructor(
    @InjectRepository(NotificationChannelSettingEntity)
    repo: Repository<NotificationChannelSettingEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 채널 설정 — `channel_code` 오름차순. */
  findAllOrdered() {
    return this.repository.find({ order: { channel_code: 'ASC' } });
  }
}
