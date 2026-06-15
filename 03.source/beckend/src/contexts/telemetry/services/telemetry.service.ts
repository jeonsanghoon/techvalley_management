/**
 * @file telemetry.service.ts
 * @description 텔레메트리(메트릭 스트림) 도메인 비즈니스 로직.
 *              Mongo periodic_telemetry 조회·SSE 틱 — 읽기 전용.
 */
import { Injectable } from '@nestjs/common';
import { batchMeta, mapMetricFromTelemetry, wrapData } from '../../../common/mappers';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import type { PeriodicTelemetryDoc } from '../../../common/types/db/mongo-docs';
import { TelemetryDao } from '../dao/telemetry.dao';
import type { MetricLogEntryDto } from '../dto/telemetry.dto';

/**
 * 주기 텔레메트리 조회·스트림 틱 서비스.
 * TelemetryDao를 통해 MongoDB periodic_telemetry 컬렉션에 접근한다.
 */
@Injectable()
export class TelemetryService {
  constructor(private readonly dao: TelemetryDao) {}

  /** 최근 텔레메트리 메트릭 평탄화 목록. GET /api/metric-stream/latest */
  async getLatest(): Promise<ApiDataEnvelopeDto<ItemsDto<MetricLogEntryDto>>> {
    const rows = await this.dao.findLatestTelemetry(10);
    const items = rows.flatMap((doc) => mapMetricFromTelemetry(doc));
    return wrapData({ items }, batchMeta('mongo.periodic_telemetry', 'realtime'));
  }

  /** SSE 스트림용 최신 1건 raw 문서. GET /api/metric-stream/stream 내부 tick */
  streamTick(): Promise<PeriodicTelemetryDoc[]> {
    return this.dao.findLatestOne();
  }
}
