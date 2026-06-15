/**
 * @file inspection.controller.ts
 * @description 검사 REST API. prefix `api/inspection`.
 * @routes
 *   - GET/POST/PUT/DELETE /api/inspection/yields, /api/inspection/yields/:id
 *   - GET/POST/PUT/DELETE /api/inspection/algorithms, /api/inspection/algorithms/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { InspectionService } from '../services/inspection.service';

/** 수율 검사·알고리즘 설정 CRUD HTTP 엔드포인트 그룹. */
@Controller('inspection')
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  /** GET /api/inspection/yields — 수율 기록 목록 */
  @Get('yields')
  yields() {
    return this.service.listYields();
  }

  /** GET /api/inspection/yields/:id — 수율 기록 단건 */
  @Get('yields/:id')
  yield(@Param('id') id: string) {
    return this.service.getYield(id);
  }

  /** POST /api/inspection/yields — 수율 기록 생성 */
  @Post('yields')
  createYield(@Body() dto: {
    device_code: string;
    lot_no: string;
    serial_no: string;
    yield_pct: string;
    algorithm_version: string;
  }) {
    return this.service.createYield(dto);
  }

  /** PUT /api/inspection/yields/:id — 수율 기록 수정 */
  @Put('yields/:id')
  updateYield(@Param('id') id: string, @Body() dto: { yield_pct?: string; algorithm_version?: string }) {
    return this.service.updateYield(id, dto);
  }

  /** DELETE /api/inspection/yields/:id — 수율 기록 하드 삭제 */
  @Delete('yields/:id')
  deleteYield(@Param('id') id: string) {
    return this.service.deleteYield(id);
  }

  /** GET /api/inspection/algorithms — 알고리즘 설정 목록 */
  @Get('algorithms')
  algorithms() {
    return this.service.listAlgorithms();
  }

  /** GET /api/inspection/algorithms/:id — 알고리즘 설정 단건 */
  @Get('algorithms/:id')
  algorithm(@Param('id') id: string) {
    return this.service.getAlgorithm(id);
  }

  /** POST /api/inspection/algorithms — 알고리즘 설정 생성 */
  @Post('algorithms')
  createAlgorithm(@Body() dto: {
    config_code: string;
    config_name: string;
    version_label: string;
    threshold?: string;
    status?: string;
  }) {
    return this.service.createAlgorithm(dto);
  }

  /** PUT /api/inspection/algorithms/:id — 알고리즘 설정 수정 */
  @Put('algorithms/:id')
  updateAlgorithm(@Param('id') id: string, @Body() dto: { threshold?: string; status?: string; applied_device_count?: number }) {
    return this.service.updateAlgorithm(id, dto);
  }

  /** DELETE /api/inspection/algorithms/:id — 알고리즘 설정 하드 삭제 */
  @Delete('algorithms/:id')
  deleteAlgorithm(@Param('id') id: string) {
    return this.service.deleteAlgorithm(id);
  }
}
