/**
 * @file installation.service.ts
 * @description 설치(installation) 도메인 비즈니스 로직.
 *              Installation CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapInstallation, wrapData } from '../../../common/mappers';
import { InstallationDao } from '../dao/installation.dao';
import type { InstallationRow } from '../../../common/types/db/postgres-rows';
import type { CreateInstallationDto, UpdateInstallationDto } from '../dto/installation-crud.dto';

/**
 * 디바이스 설치 이력 CRUD 서비스.
 * InstallationDao를 통해 installation 테이블(JOIN)에 접근한다.
 */
@Injectable()
export class InstallationService {
  constructor(private readonly dao: InstallationDao) {}

  /** 설치 이력 전체 목록 (JOIN). GET /api/installation */
  async listAll() {
    const { rows } = await this.dao.findAllJoined();
    return wrapData({ items: rows.map((r) => mapInstallation(r as unknown as InstallationRow)) }, batchMeta('postgres.installation'));
  }

  /** 설치 이력 단건 조회. GET /api/installation/:id */
  async getOne(id: string) {
    const { rows } = await this.dao.findOneJoined(id);
    const row = rows[0];
    if (!row) throw new NotFoundException(`Installation ${id} not found`);
    return wrapData(mapInstallation(row as unknown as InstallationRow), batchMeta('postgres.installation'));
  }

  /** 설치 이력 생성. POST /api/installation — installed_at ISO 문자열 파싱 */
  async create(dto: CreateInstallationDto) {
    const row = await this.dao.createRow({
      ...dto,
      installed_at: new Date(dto.installed_at),
    });
    return this.getOne(row.id);
  }

  /** 설치 이력 수정. PUT /api/installation/:id */
  async update(id: string, dto: UpdateInstallationDto) {
    const patch: Record<string, unknown> = { ...dto };
    if (dto.installed_at) patch.installed_at = new Date(dto.installed_at);
    await this.dao.updateRow(id, patch);
    return this.getOne(id);
  }

  /**
   * 설치 이력 삭제 (하드 삭제).
   * DELETE /api/installation/:id — DAO deleteRow.
   */
  async delete(id: string) {
    await this.dao.deleteRow(id);
    return { deleted: true, id };
  }
}
