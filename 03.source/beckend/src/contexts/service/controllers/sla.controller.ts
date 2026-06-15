/**
 * @file sla.controller.ts
 * @description SLA REST API. prefix `api/sla`.
 * @routes
 *   - GET /api/sla/snapshots
 *   - GET/POST/PUT/DELETE /api/sla/definitions, /api/sla/definitions/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { SlaService } from '../services/service.service';

/** SLA 스냅샷·계약 정의 HTTP 엔드포인트 그룹. */
@Controller('sla')
export class SlaController {
  constructor(private readonly service: SlaService) {}

  /** GET /api/sla/snapshots — SLA 스냅샷 목록 */
  @Get('snapshots')
  snapshots() {
    return this.service.listSnapshots();
  }

  /** GET /api/sla/definitions — SLA 정의 목록 */
  @Get('definitions')
  definitions() {
    return this.service.listDefinitions();
  }

  /** GET /api/sla/definitions/:id — SLA 정의 단건 */
  @Get('definitions/:id')
  definition(@Param('id') id: string) {
    return this.service.getDefinition(id);
  }

  /** POST /api/sla/definitions — SLA 정의 생성 */
  @Post('definitions')
  createDefinition(@Body() dto: {
    tier_code: string;
    tier_name: string;
    response_minutes: number;
    resolve_minutes: number;
    uptime_target_pct: string;
    description?: string;
  }) {
    return this.service.createDefinition(dto);
  }

  /** PUT /api/sla/definitions/:id — SLA 정의 수정 */
  @Put('definitions/:id')
  updateDefinition(@Param('id') id: string, @Body() dto: Partial<{
    tier_name: string;
    response_minutes: number;
    resolve_minutes: number;
    uptime_target_pct: string;
    description: string;
  }>) {
    return this.service.updateDefinition(id, dto);
  }

  /** DELETE /api/sla/definitions/:id — SLA 정의 하드 삭제 */
  @Delete('definitions/:id')
  deleteDefinition(@Param('id') id: string) {
    return this.service.deleteDefinition(id);
  }
}
