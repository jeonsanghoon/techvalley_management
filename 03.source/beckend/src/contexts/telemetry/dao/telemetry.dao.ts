/**
 * @file telemetry.dao.ts
 * @description 텔레메트리(Telemetry) 도메인 — MongoDB 주기적 디바이스 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - Postgres 미사용 — MongoDB `periodic_telemetry` 컬렉션 전용
 * - MongoService 직접 접근 (find + sort + limit)
 *
 * 원시 telemetry는 MongoDB에 저장되며, PG에는 rollup/통계만 적재된다.
 */
import { Injectable } from '@nestjs/common';
import { MongoService } from '../../../infrastructure/mongo.service';
import type { PeriodicTelemetryDoc } from '../../../common/types/db/mongo-docs';

/**
 * 텔레메트리 DAO.
 * - 데이터 소스: MongoDB `periodic_telemetry`
 * - CRUD 베이스 없음 (읽기 전용)
 */
@Injectable()
export class TelemetryDao {
  constructor(private readonly mongo: MongoService) {}

  /**
   * 최신 telemetry N건 — `device_timestamp` 내림차순.
   * MongoService find — PG raw SQL 불필요.
   */
  async findLatestTelemetry(limit = 10): Promise<PeriodicTelemetryDoc[]> {
    const db = await this.mongo.db();
    return db
      .collection<PeriodicTelemetryDoc>('periodic_telemetry')
      .find({})
      .sort({ device_timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 최신 telemetry 1건 — 대시보드·헬스체크용.
   * MongoService find — LIMIT 1.
   */
  async findLatestOne(): Promise<PeriodicTelemetryDoc[]> {
    const db = await this.mongo.db();
    return db
      .collection<PeriodicTelemetryDoc>('periodic_telemetry')
      .find({})
      .sort({ device_timestamp: -1 })
      .limit(1)
      .toArray();
  }
}
