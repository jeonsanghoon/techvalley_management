/**
 * @file equipment-log.service.ts
 * @description 장비 로그 도메인 비즈니스 로직.
 *              카테고리별 다중 테이블 조회·병합 — 읽기 전용.
 */
import { Injectable } from '@nestjs/common';
import { batchMeta, mapEquipmentLog, wrapData } from '../../../common/mappers';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import { EquipmentLogDao } from '../dao/equipment-log.dao';
import type { EquipmentLogEntryDto } from '../dto/equipment-log.dto';

/**
 * 장비 로그(튜브·검출기·본체·제어·펌웨어·감사) 조회 서비스.
 * EquipmentLogDao를 통해 category별 PostgreSQL 로그 테이블에 접근한다.
 */
@Injectable()
export class EquipmentLogService {
  constructor(private readonly dao: EquipmentLogDao) {}

  /**
   * 카테고리별 장비 로그 목록 (다중 테이블 병합).
   * GET /api/equipment-logs?category= — occurredAt 내림차순, category=all 시 전체.
   */
  async listByCategory(
    category = 'all',
  ): Promise<ApiDataEnvelopeDto<ItemsDto<EquipmentLogEntryDto>>> {
    let items: EquipmentLogEntryDto[] = [];
    for (const [, [table, cat]] of this.dao.resolveTables(category)) {
      if (!table) continue;
      const { rows } = await this.dao.findByTable(table, 100);
      items = items.concat(rows.map((r) => mapEquipmentLog(r, cat)));
    }
    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return wrapData({ items }, batchMeta(`postgres.${category}`));
  }
}
