/**
 * @file pipeline.controller.ts
 * @description 데이터 파이프라인 REST API. prefix `api/pipeline`.
 * @routes
 *   - GET /api/pipeline/tiers — tier/YAML 구성
 *   - GET /api/pipeline/live — 실시간 Mongo·배치 상태
 *   - GET /api/pipeline/collection-stats — 컬렉션·디바이스 통계
 */
import { Controller, Get } from '@nestjs/common';
import { PipelineService } from '../services/pipeline.service';

/** 파이프라인 모니터링 HTTP 엔드포인트 그룹. */
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly service: PipelineService) {}

  /** GET /api/pipeline/tiers */
  @Get('tiers')
  tiers() {
    return this.service.getTiers();
  }

  /** GET /api/pipeline/live */
  @Get('live')
  live() {
    return this.service.getLive();
  }

  /** GET /api/pipeline/collection-stats */
  @Get('collection-stats')
  collectionStats() {
    return this.service.getCollectionStats();
  }
}
