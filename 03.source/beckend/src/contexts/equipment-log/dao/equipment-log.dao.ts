/**
 * @file equipment-log.dao.ts
 * @description 장비 로그(Equipment Log) 도메인 — 카테고리별 로그 테이블 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM Repository 기반 (6개 로그 테이블 → 6개 Entity)
 * - raw SQL 없음 — 카테고리별 단일 테이블 CRUD
 * - 생성 시 {@link SnowflakeIdService}로 snowflake PK 선할당
 *
 * 튜브/디텍터/본체/원격제어/펌웨어/감사 로그는 물리 테이블이 분리되어 있으며,
 * `EquipmentLogDao`가 테이블 키로 Repository를 라우팅한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import type { EquipmentLogRow } from '../../../common/types/db/postgres-rows';
import {
  EQUIPMENT_LOG_ENTITY_MAP,
  EquipmentLogAuditEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogTubeEntity,
  type EquipmentLogTable,
} from '../entities/equipment-log.entities';

/** UI 카테고리 라벨 → (물리 테이블명, 표시명) 매핑. */
const LOG_TABLES: Record<string, [EquipmentLogTable, string]> = {
  튜브: ['equipment_log_tube', '튜브'],
  디텍터: ['equipment_log_detector', '디텍터'],
  본체: ['equipment_log_body', '본체'],
  원격제어: ['equipment_log_control', '원격제어'],
  펌웨어: ['equipment_log_firmware', '펌웨어'],
  감사: ['equipment_log_audit', '감사'],
};

type LogEntity =
  | EquipmentLogTubeEntity
  | EquipmentLogDetectorEntity
  | EquipmentLogBodyEntity
  | EquipmentLogControlEntity
  | EquipmentLogFirmwareEntity
  | EquipmentLogAuditEntity;

/**
 * 장비 로그 DAO — 6개 로그 Entity를 테이블 키로 라우팅.
 *
 * - PK: `string` (snowflake BIGINT) — 모든 로그 테이블 공통
 * - CRUD: TypeORM Repository 직접 (SnowflakeCrudDao 미상속 — 다중 Entity 라우팅)
 */
@Injectable()
export class EquipmentLogDao {
  private readonly repos: Record<EquipmentLogTable, Repository<LogEntity>>;

  constructor(
    @InjectRepository(EquipmentLogTubeEntity)
    tubeRepo: Repository<EquipmentLogTubeEntity>,
    @InjectRepository(EquipmentLogDetectorEntity)
    detectorRepo: Repository<EquipmentLogDetectorEntity>,
    @InjectRepository(EquipmentLogBodyEntity)
    bodyRepo: Repository<EquipmentLogBodyEntity>,
    @InjectRepository(EquipmentLogControlEntity)
    controlRepo: Repository<EquipmentLogControlEntity>,
    @InjectRepository(EquipmentLogFirmwareEntity)
    firmwareRepo: Repository<EquipmentLogFirmwareEntity>,
    @InjectRepository(EquipmentLogAuditEntity)
    auditRepo: Repository<EquipmentLogAuditEntity>,
    private readonly snowflake: SnowflakeIdService,
  ) {
    this.repos = {
      equipment_log_tube: tubeRepo as Repository<LogEntity>,
      equipment_log_detector: detectorRepo as Repository<LogEntity>,
      equipment_log_body: bodyRepo as Repository<LogEntity>,
      equipment_log_control: controlRepo as Repository<LogEntity>,
      equipment_log_firmware: firmwareRepo as Repository<LogEntity>,
      equipment_log_audit: auditRepo as Repository<LogEntity>,
    };
  }

  /**
   * 카테고리 문자열을 조회 대상 테이블 목록으로 변환한다.
   * `'all'`이면 전체 6개 테이블, 아니면 단일 카테고리(미지정 시 튜브 fallback).
   */
  resolveTables(category: string): Array<[string, [EquipmentLogTable, string]]> {
    if (category === 'all') return Object.entries(LOG_TABLES);
    return [[category, LOG_TABLES[category] ?? ['equipment_log_tube', '튜브']]];
  }

  /**
   * 지정 테이블의 최근 로그 N건 — `event_at` 내림차순.
   * TypeORM find — 단일 테이블 정렬·take.
   */
  async findByTable(table: EquipmentLogTable, limit = 100): Promise<QueryResult<EquipmentLogRow>> {
    const rows = await this.repos[table].find({
      order: { event_at: 'DESC' },
      take: limit,
    });
    return {
      rows: rows as unknown as EquipmentLogRow[],
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }

  /**
   * snowflake ID를 발급한 뒤 로그 1건을 생성한다.
   * TypeORM create + save.
   */
  async createLog(table: EquipmentLogTable, data: Partial<LogEntity>) {
    const id = await this.snowflake.nextId();
    const repo = this.repos[table];
    return repo.save(repo.create({ ...data, id }));
  }

  /** PK로 단일 로그를 조회한다. */
  async findById(table: EquipmentLogTable, id: string) {
    return this.repos[table].findOne({ where: { id } });
  }

  /** PK로 로그를 삭제한다. */
  async deleteLog(table: EquipmentLogTable, id: string) {
    return this.repos[table].delete(id);
  }

  /** 테이블 키에 대응하는 Entity 클래스를 반환한다 (동적 매핑용). */
  getEntityForTable(table: EquipmentLogTable) {
    return EQUIPMENT_LOG_ENTITY_MAP[table];
  }
}
