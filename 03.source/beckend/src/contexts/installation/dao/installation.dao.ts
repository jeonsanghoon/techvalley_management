/**
 * @file installation.dao.ts
 * @description 설치(Installation) 도메인 — 디바이스 설치 이력 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 CRUD: TypeORM {@link SnowflakeCrudDao}
 * - JOIN 목록/상세 (site/company/product/device): raw SQL — 다중 테이블 JOIN
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { InstallationEntity } from '../entities/installation.entity';

/**
 * 설치 이력 DAO.
 * - 엔티티: {@link InstallationEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class InstallationDao extends SnowflakeCrudDao<InstallationEntity> {
  constructor(
    @InjectRepository(InstallationEntity)
    repo: Repository<InstallationEntity>,
    snowflake: SnowflakeIdService,
    private readonly pg: PostgresService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 전체 설치 이력 — site/company/product/device JOIN.
   * raw SQL: branch COALESCE company JOIN + `installed_at` 정렬.
   */
  findAllJoined(): Promise<QueryResult<Record<string, unknown>>> {
    return this.pg.query(`
      SELECT i.*, s.site_name, c.company_name, p.product_name, d.portal_meta
      FROM installation i
      JOIN device d ON d.device_code = i.device_code
      JOIN site s ON s.id = i.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      JOIN product p ON p.id = d.product_id
      ORDER BY i.installed_at DESC`);
  }

  /**
   * 단일 설치 이력 상세 — site/company/product/device JOIN.
   * raw SQL: PK 파라미터 바인딩($1).
   */
  findOneJoined(id: string): Promise<QueryResult<Record<string, unknown>>> {
    return this.pg.query(
      `
      SELECT i.*, s.site_name, c.company_name, p.product_name, d.portal_meta
      FROM installation i
      JOIN device d ON d.device_code = i.device_code
      JOIN site s ON s.id = i.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      JOIN product p ON p.id = d.product_id
      WHERE i.id = $1`,
      [id],
    );
  }
}
