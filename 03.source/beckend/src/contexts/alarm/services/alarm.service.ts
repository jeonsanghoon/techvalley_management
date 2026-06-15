/**
 * @file alarm.service.ts
 * @description 알람 도메인 비즈니스 로직.
 *              Mongo 알림 + PostgreSQL incident 통합 목록, YAML 기반 알람 규칙 조회 (읽기 전용).
 */
import { Injectable } from '@nestjs/common';
import {
  batchMeta,
  mapAlarmFromMongo,
  mapAlarmFromPg,
  mapYamlRulesToDto,
  wrapData,
} from '../../../common/mappers';
import type { ApiDataEnvelopeDto } from '../../../common/dto/api-response.dto';
import type { ItemsDto } from '../../../common/dto/api-response.dto';
import { AlarmDao } from '../dao/alarm.dao';
import type { AlarmDto, AlarmRuleDto } from '../dto/alarm.dto';

/**
 * 알람 incident·규칙 조회 서비스.
 * AlarmDao를 통해 MongoDB notification + PostgreSQL communication_alarm_incident 에 접근한다.
 */
@Injectable()
export class AlarmService {
  constructor(private readonly dao: AlarmDao) {}

  /**
   * 통합 알람 목록 (Mongo + PostgreSQL).
   * GET /api/alarms — triggeredAt 기준 내림차순 병합, meta에 소스별 건수.
   */
  async listAlarms(): Promise<ApiDataEnvelopeDto<ItemsDto<AlarmDto>>> {
    const mongoRows = await this.dao.findMongoNotifications(100);
    const pgRows = await this.dao.findPgIncidents(100);

    const items = [
      ...mongoRows.map((a, i) => mapAlarmFromMongo(a, i)),
      ...pgRows.rows.map((r) => mapAlarmFromPg(r)),
    ].sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));

    return wrapData(
      { items },
      batchMeta('mongo.device_notification+postgres.communication_alarm_incident'),
    );
  }

  /** YAML 파일 기반 알람 규칙 목록. GET /api/alarm-rules */
  listAlarmRules(): ApiDataEnvelopeDto<ItemsDto<AlarmRuleDto>> {
    const items = mapYamlRulesToDto(this.dao.loadYamlRules());
    return wrapData({ items }, batchMeta('yaml:alarm-rules'));
  }
}
