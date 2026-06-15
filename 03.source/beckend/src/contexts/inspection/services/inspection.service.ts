/**
 * @file inspection.service.ts
 * @description 검사(수율·알고리즘) 도메인 비즈니스 로직.
 *              Yield/Algorithm CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapAlgorithm, mapYieldRecord, wrapData } from '../../../common/mappers';
import type { AlgorithmConfigRow, YieldInspectionRow } from '../../../common/types/db/postgres-rows';
import { AlgorithmConfigDao, YieldInspectionDao } from '../dao/inspection.dao';

/**
 * 수율 검사 기록·알고리즘 설정 CRUD 서비스.
 * YieldInspectionDao·AlgorithmConfigDao를 통해 PostgreSQL 테이블에 접근한다.
 */
@Injectable()
export class InspectionService {
  constructor(
    private readonly yieldDao: YieldInspectionDao,
    private readonly algorithmDao: AlgorithmConfigDao,
  ) {}

  /** 수율 검사 기록 목록. GET /api/inspection/yields */
  async listYields() {
    const rows = await this.yieldDao.findAllOrdered();
    return wrapData(
      { items: rows.map((r) => mapYieldRecord(r as unknown as YieldInspectionRow)) },
      batchMeta('postgres.yield_inspection_record'),
    );
  }

  /** 수율 검사 기록 단건. GET /api/inspection/yields/:id */
  async getYield(id: string) {
    const row = await this.yieldDao.findById(id);
    if (!row) throw new NotFoundException(`Yield record ${id} not found`);
    return wrapData(mapYieldRecord(row as unknown as YieldInspectionRow), batchMeta('postgres.yield_inspection_record'));
  }

  /** 수율 검사 기록 생성. POST /api/inspection/yields — inspected_at=now */
  async createYield(dto: Partial<{
    device_code: string;
    lot_no: string;
    serial_no: string;
    yield_pct: string;
    algorithm_version: string;
  }>) {
    const row = await this.yieldDao.createRow({ ...dto, inspected_at: new Date() });
    return wrapData(mapYieldRecord(row as unknown as YieldInspectionRow), batchMeta('postgres.yield_inspection_record'));
  }

  /** 수율 검사 기록 수정. PUT /api/inspection/yields/:id */
  async updateYield(id: string, dto: Partial<{ yield_pct: string; algorithm_version: string }>) {
    await this.yieldDao.updateRow(id, dto);
    return this.getYield(id);
  }

  /**
   * 수율 검사 기록 삭제 (하드 삭제).
   * DELETE /api/inspection/yields/:id — DAO deleteRow.
   */
  async deleteYield(id: string) {
    await this.yieldDao.deleteRow(id);
    return { deleted: true, id };
  }

  /** 알고리즘 설정 목록. GET /api/inspection/algorithms */
  async listAlgorithms() {
    const rows = await this.algorithmDao.findAllOrdered();
    return wrapData({ items: rows.map((r) => mapAlgorithm(r as unknown as AlgorithmConfigRow)) }, batchMeta('postgres.algorithm_config'));
  }

  /** 알고리즘 설정 단건. GET /api/inspection/algorithms/:id */
  async getAlgorithm(id: string) {
    const row = await this.algorithmDao.findById(id);
    if (!row) throw new NotFoundException(`Algorithm ${id} not found`);
    return wrapData(mapAlgorithm(row as unknown as AlgorithmConfigRow), batchMeta('postgres.algorithm_config'));
  }

  /** 알고리즘 설정 생성. POST /api/inspection/algorithms */
  async createAlgorithm(dto: Partial<{
    config_code: string;
    config_name: string;
    version_label: string;
    threshold: string;
    status: string;
  }>) {
    const row = await this.algorithmDao.createRow(dto);
    return wrapData(mapAlgorithm(row as unknown as AlgorithmConfigRow), batchMeta('postgres.algorithm_config'));
  }

  /** 알고리즘 설정 수정. PUT /api/inspection/algorithms/:id */
  async updateAlgorithm(id: string, dto: Partial<{ threshold: string; status: string; applied_device_count: number }>) {
    await this.algorithmDao.updateRow(id, dto);
    return this.getAlgorithm(id);
  }

  /**
   * 알고리즘 설정 삭제 (하드 삭제).
   * DELETE /api/inspection/algorithms/:id — DAO deleteRow.
   */
  async deleteAlgorithm(id: string) {
    await this.algorithmDao.deleteRow(id);
    return { deleted: true, id };
  }
}
