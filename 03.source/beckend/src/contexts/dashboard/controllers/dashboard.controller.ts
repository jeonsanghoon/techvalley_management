/**
 * @file dashboard.controller.ts
 * @description 대시보드 REST API. prefix `api/dashboard`.
 * @routes
 *   - GET /api/dashboard/summary — KPI·최근 알람 요약
 *   - GET /api/dashboard/trends — 알람 일별 트렌드
 */
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';

/** 대시보드 집계 HTTP 엔드포인트 그룹. */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /** GET /api/dashboard/summary?region=global|korea|... */
  @Get('summary')
  summary(@Query('region') region?: string) {
    return this.service.getSummary(region);
  }

  /** GET /api/dashboard/trends */
  @Get('trends')
  trends() {
    return this.service.getTrends();
  }
}
