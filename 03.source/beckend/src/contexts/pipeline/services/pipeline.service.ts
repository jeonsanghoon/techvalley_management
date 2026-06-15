/**
 * @file pipeline.service.ts
 * @description 데이터 파이프라인 도메인 비즈니스 로직.
 *              YAML 설정(ingress·normalize·batch) + Mongo/PG 실시간 통계 — 읽기 전용.
 */
import { Injectable } from '@nestjs/common';
import { batchMeta, wrapData } from '../../../common/mappers';
import type { ApiDataEnvelopeDto } from '../../../common/dto/api-response.dto';
import { DeviceDao } from '../../device/dao/device.dao';
import { PipelineDao } from '../dao/pipeline.dao';
import type {
  PipelineCollectionStatsDataDto,
  PipelineLiveResponseDto,
  PipelineTiersResponseDto,
} from '../dto/pipeline.dto';

/**
 * IoT 데이터 파이프라인 tier·실시간·컬렉션 통계 서비스.
 * PipelineDao·DeviceDao를 통해 YAML·Mongo·PostgreSQL 에 접근한다.
 */
@Injectable()
export class PipelineService {
  constructor(
    private readonly dao: PipelineDao,
    private readonly deviceDao: DeviceDao,
  ) {}

  /**
   * 파이프라인 tier 구성 (ingress·normalize YAML).
   * GET /api/pipeline/tiers — Kinesis·Lambda·Mongo 라우트 메타.
   */
  getTiers(): PipelineTiersResponseDto {
    const ingress = this.dao.loadIngressYaml();
    const normalize = this.dao.loadNormalizeYaml();
    return {
      ingress: {
        kinesis: ingress.kinesis ?? {},
        lambdas: Object.keys(ingress.lambdas ?? {}),
      },
      normalize: {
        routes: (normalize.routes ?? []).length,
        mongo_database: normalize.mongo?.database ?? 'iot_service',
      },
      source: 'yaml:ingress-deploy + normalize-config.default',
    };
  }

  /**
   * 파이프라인 실시간 상태 (Mongo 컬렉션·배치 cadence).
   * GET /api/pipeline/live
   */
  async getLive(): Promise<PipelineLiveResponseDto> {
    const collections = await this.dao.countMongoCollections();
    const batch = this.dao.loadBatchCadenceYaml();
    return {
      collections,
      cadences: (batch.cadences ?? []).map((c) => ({
        id: c.id,
        enabled: c.enabled !== false,
      })),
      asOf: new Date().toISOString(),
    };
  }

  /**
   * 컬렉션·디바이스·텔레메트리 일일 통계.
   * GET /api/pipeline/collection-stats — PG collection_daily_stats + 디바이스 카운트.
   */
  async getCollectionStats(): Promise<ApiDataEnvelopeDto<PipelineCollectionStatsDataDto>> {
    const { rows } = await this.dao.findCollectionDailyStatsToday();
    const deviceCount = await this.deviceDao.countActiveDevices();
    const online = await this.deviceDao.countOnlineDevices();
    const telemetryCount = await this.dao.countPeriodicTelemetry();
    return wrapData(
      {
        totalDevices: deviceCount.rows[0]?.c ?? 0,
        onlineDevices: online.rows[0]?.c ?? 0,
        normalizedToday: telemetryCount,
        greengrassComponents: rows.length,
        collections: rows,
      },
      batchMeta('postgres.collection_daily_stats+mongo'),
    );
  }
}
