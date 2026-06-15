/**
 * @file reports.controller.ts
 * @description 리포트 REST API. prefix `api/reports`.
 * @routes GET/POST/PUT/DELETE /api/reports, /api/reports/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

/** 리포트 정의 CRUD HTTP 엔드포인트 그룹. */
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  /** GET /api/reports — 리포트 정의 목록 */
  @Get()
  list() {
    return this.service.listAll();
  }

  /** GET /api/reports/:id — 리포트 정의 단건 */
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  /** POST /api/reports — 리포트 정의 생성 */
  @Post()
  create(@Body() dto: { report_code: string; report_name: string; category: string }) {
    return this.service.create(dto);
  }

  /** PUT /api/reports/:id — 리포트 정의 수정 */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { report_name?: string; category?: string }) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/reports/:id — 리포트 정의 하드 삭제 */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
