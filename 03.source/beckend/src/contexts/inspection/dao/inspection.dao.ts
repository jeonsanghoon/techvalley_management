/**
 * @file inspection.dao.ts
 * @description 검사(Inspection) 도메인 — 수율 검사 기록·알고리즘 설정 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM {@link SnowflakeCrudDao} 기반
 * - raw SQL 없음 — 단일 테이블 CRUD·정렬 조회
 *
 * {@link InspectionDao}는 레거시 파사드이며, 신규 코드는 YieldInspectionDao/AlgorithmConfigDao를 직접 주입한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import {
  YieldInspectionRecordEntity,
  AlgorithmConfigEntity,
} from '../entities/inspection.entities';

/**
 * 수율 검사 기록 DAO.
 * - 엔티티: {@link YieldInspectionRecordEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class YieldInspectionDao extends SnowflakeCrudDao<YieldInspectionRecordEntity> {
  constructor(
    @InjectRepository(YieldInspectionRecordEntity)
    repo: Repository<YieldInspectionRecordEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 수율 검사 기록 — `inspected_at` 내림차순. */
  findAllOrdered() {
    return this.repository.find({ order: { inspected_at: 'DESC' } });
  }
}

/**
 * 알고리즘 설정 DAO.
 * - 엔티티: {@link AlgorithmConfigEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class AlgorithmConfigDao extends SnowflakeCrudDao<AlgorithmConfigEntity> {
  constructor(
    @InjectRepository(AlgorithmConfigEntity)
    repo: Repository<AlgorithmConfigEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 알고리즘 설정 — `config_code` 오름차순. */
  findAllOrdered() {
    return this.repository.find({ order: { config_code: 'ASC' } });
  }
}

/**
 * @deprecated {@link YieldInspectionDao}, {@link AlgorithmConfigDao}로 분리됨.
 *             기존 Controller/Service의 `InspectionDao` 주입 호환용 파사드.
 *             신규 코드는 YieldInspectionDao / AlgorithmConfigDao를 직접 주입할 것.
 */
@Injectable()
export class InspectionDao {
  constructor(
    private readonly yieldDao: YieldInspectionDao,
    private readonly algorithmDao: AlgorithmConfigDao,
  ) {}

  /** {@link YieldInspectionDao#findAllOrdered} 위임 — QueryResult 래핑. */
  async findYieldRecords() {
    const rows = await this.yieldDao.findAllOrdered();
    return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
  }

  /** {@link AlgorithmConfigDao#findAllOrdered} 위임 — QueryResult 래핑. */
  async findAlgorithms() {
    const rows = await this.algorithmDao.findAllOrdered();
    return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
  }
}
