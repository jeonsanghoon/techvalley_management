/**
 * @file alarm.dao.ts
 * @description 알람(Alarm) 도메인 데이터 접근 계층.
 *
 * **하이브리드 데이터 접근 패턴**
 * - Postgres `communication_alarm_incident`: TypeORM Repository (count) + raw SQL (정렬·컬럼 projection)
 * - MongoDB `device_notifications`: MongoService 직접 접근 (실시간 디바이스 알림)
 * - YAML 규칙 파일: ConfigLoaderService (DB 외 설정)
 *
 * 알람은 PG incident(운영 이벤트)와 Mongo notification(원시 디바이스 알림)을 병행 조회한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { MongoService } from '../../../infrastructure/mongo.service';
import { ConfigLoaderService } from '../../../infrastructure/config-loader.service';
import type { DeviceNotificationDoc } from '../../../common/types/db/mongo-docs';
import type { PgAlarmIncidentRow } from '../../../common/types/db/postgres-rows';
import type { YamlRuleFile } from '../../../common/types/db/yaml-rules';
import { CommunicationAlarmIncidentEntity } from '../entities/communication-alarm-incident.entity';

/**
 * 알람 DAO — PG incident + Mongo notification + YAML 규칙 통합 조회.
 *
 * - PG 엔티티: {@link CommunicationAlarmIncidentEntity} (PK: snowflake `string`)
 * - CRUD 베이스: TypeORM Repository 직접 주입 (SnowflakeCrudDao 미사용 — 읽기 위주)
 */
@Injectable()
export class AlarmDao {
  constructor(
    private readonly pg: PostgresService,
    private readonly mongo: MongoService,
    private readonly config: ConfigLoaderService,
    @InjectRepository(CommunicationAlarmIncidentEntity)
    private readonly incidentRepo: Repository<CommunicationAlarmIncidentEntity>,
  ) {}

  /** MongoDB `device_notifications` 컬렉션 전체 문서 수를 반환한다. */
  async countMongoNotifications(): Promise<number> {
    const db = await this.mongo.db();
    return db.collection('device_notifications').countDocuments({});
  }

  /**
   * Postgres incident 전체 건수를 반환한다.
   * 단순 count이므로 TypeORM `Repository.count()` 사용.
   */
  async countPgIncidents(): Promise<QueryResult<{ c: number }>> {
    const c = await this.incidentRepo.count();
    return {
      rows: [{ c }],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }

  /**
   * MongoDB 최신 디바이스 알림 목록을 조회한다.
   * `device_timestamp` 내림차순 정렬.
   */
  async findMongoNotifications(limit = 100): Promise<DeviceNotificationDoc[]> {
    const db = await this.mongo.db();
    return db
      .collection<DeviceNotificationDoc>('device_notifications')
      .find({})
      .sort({ device_timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Postgres incident 목록을 `opened_at` 내림차순으로 조회한다.
   * raw SQL 사용 이유: 필요 컬럼만 projection하고 레거시 `QueryResult` 형태를 유지한다.
   */
  findPgIncidents(limit = 100): Promise<QueryResult<PgAlarmIncidentRow>> {
    return this.pg.query<PgAlarmIncidentRow>(`
      SELECT id, alert_code, device_code, severity_type, incident_status, opened_at, alarm_label AS message
      FROM communication_alarm_incident ORDER BY opened_at DESC LIMIT ${limit}`);
  }

  /** YAML 기반 알람 규칙 파일 목록을 로드한다 (DB 접근 없음). */
  loadYamlRules(): YamlRuleFile[] {
    return this.config.loadRules();
  }
}
