/**
 * @file reports.service.ts
 * @description 리포트 정의 도메인 비즈니스 로직.
 *              ReportDefinition CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapReport, wrapData } from '../../../common/mappers';
import type { ReportDefinitionRow } from '../../../common/types/db/postgres-rows';
import { ReportsDao } from '../dao/reports.dao';

/**
 * 리포트 정의 CRUD 서비스.
 * ReportsDao를 통해 report_definition 테이블에 접근한다.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly dao: ReportsDao) {}

  /** 리포트 정의 전체 목록. GET /api/reports */
  async listAll() {
    const rows = await this.dao.findAllOrdered();
    return wrapData(
      { items: rows.map((r) => mapReport(r as ReportDefinitionRow)) },
      batchMeta('postgres.report_definition'),
    );
  }

  /** 리포트 정의 단건 조회. GET /api/reports/:id */
  async getOne(id: string) {
    const row = await this.dao.findById(id);
    if (!row) throw new NotFoundException(`Report ${id} not found`);
    return wrapData(mapReport(row as ReportDefinitionRow), batchMeta('postgres.report_definition'));
  }

  /** 리포트 정의 생성. POST /api/reports */
  async create(dto: Partial<{ report_code: string; report_name: string; category: string }>) {
    const row = await this.dao.createRow(dto);
    return wrapData(mapReport(row as ReportDefinitionRow), batchMeta('postgres.report_definition'));
  }

  /** 리포트 정의 수정. PUT /api/reports/:id */
  async update(id: string, dto: Partial<{ report_name: string; category: string; record_count: string }>) {
    await this.dao.updateRow(id, dto);
    return this.getOne(id);
  }

  /**
   * 리포트 정의 삭제 (하드 삭제).
   * DELETE /api/reports/:id — DAO deleteRow.
   */
  async delete(id: string) {
    await this.dao.deleteRow(id);
    return { deleted: true, id };
  }
}
