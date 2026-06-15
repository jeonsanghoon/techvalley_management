/**
 * @file reports.dao.ts
 * @description 리포트(Reports) 도메인 — 리포트 정의 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM {@link SnowflakeCrudDao} 기반
 * - raw SQL 없음 — 단일 테이블 CRUD·정렬 조회
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { ReportDefinitionEntity } from '../entities/report-definition.entity';

/**
 * 리포트 정의 DAO.
 * - 엔티티: {@link ReportDefinitionEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class ReportsDao extends SnowflakeCrudDao<ReportDefinitionEntity> {
  constructor(
    @InjectRepository(ReportDefinitionEntity)
    repo: Repository<ReportDefinitionEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 리포트 정의 — `report_code` 오름차순. */
  findAllOrdered() {
    return this.repository.find({ order: { report_code: 'ASC' } });
  }
}
