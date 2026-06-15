/**
 * @file equipment-log.controller.ts
 * @description 장비 로그 REST API. prefix `api/equipment-logs`.
 * @routes GET /api/equipment-logs?category= — 카테고리별 로그 목록
 */
import { Controller, Get, Query } from '@nestjs/common';
import { EquipmentLogService } from '../services/equipment-log.service';
import { EquipmentLogsQueryDto } from '../dto/equipment-log.dto';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import type { EquipmentLogEntryDto } from '../dto/equipment-log.dto';

/** 장비 로그 조회 HTTP 엔드포인트 그룹. */
@Controller('equipment-logs')
export class EquipmentLogController {
  constructor(private readonly service: EquipmentLogService) {}

  /** GET /api/equipment-logs — query.category 로 로그 테이블 필터 (기본 all) */
  @Get()
  list(
    @Query() query: EquipmentLogsQueryDto,
  ): Promise<ApiDataEnvelopeDto<ItemsDto<EquipmentLogEntryDto>>> {
    return this.service.listByCategory(query.category ?? 'all');
  }
}
