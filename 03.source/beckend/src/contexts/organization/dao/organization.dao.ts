/**
 * @file organization.dao.ts
 * @description 조직(Organization) 도메인 — 회사·지점·사이트 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 CRUD: TypeORM {@link IntCrudDao} — INT PK (company, site, branch)
 * - site/device count 포함 목록: raw SQL — correlated subquery 집계
 * - BranchDao: CRUD만 (집계 JOIN 없음)
 *
 * {@link OrganizationDao}는 레거시 파사드이며, 신규 코드는 CompanyDao/SiteDao를 직접 주입한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { IntCrudDao } from '../../../common/repository/crud-dao.mixin';
import {
  CompanyEntity,
  BranchEntity,
  SiteEntity,
} from '../entities/organization.entities';

/**
 * 회사(Company) DAO.
 * - 엔티티: {@link CompanyEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class CompanyDao extends IntCrudDao<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity)
    repo: Repository<CompanyEntity>,
    private readonly pg: PostgresService,
  ) {
    super(repo);
  }

  /**
   * 활성 회사 목록 + site_count, device_count.
   * raw SQL: correlated subquery로 branch 경유 site/device 집계.
   */
  findCompaniesWithCounts() {
    return this.pg.query(`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM site s WHERE s.company_id = c.id OR s.branch_id IN (SELECT id FROM branch WHERE company_id = c.id)) AS site_count,
        (SELECT COUNT(*)::int FROM device d JOIN site s ON s.id = d.site_id
         LEFT JOIN branch b ON b.id = s.branch_id
         WHERE COALESCE(s.company_id, b.company_id) = c.id) AS device_count
      FROM company c WHERE c.is_use = TRUE ORDER BY c.company_name`);
  }

  /**
   * 단일 회사 상세 + site_count, device_count.
   * raw SQL: PK 파라미터 바인딩($1).
   */
  findCompanyWithCounts(id: number) {
    return this.pg.query(
      `
      SELECT c.*,
        (SELECT COUNT(*)::int FROM site s WHERE s.company_id = c.id OR s.branch_id IN (SELECT id FROM branch WHERE company_id = c.id)) AS site_count,
        (SELECT COUNT(*)::int FROM device d JOIN site s ON s.id = d.site_id
         LEFT JOIN branch b ON b.id = s.branch_id
         WHERE COALESCE(s.company_id, b.company_id) = c.id) AS device_count
      FROM company c WHERE c.id = $1`,
      [id],
    );
  }
}

/**
 * 사이트(Site) DAO.
 * - 엔티티: {@link SiteEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class SiteDao extends IntCrudDao<SiteEntity> {
  constructor(
    @InjectRepository(SiteEntity)
    repo: Repository<SiteEntity>,
    private readonly pg: PostgresService,
  ) {
    super(repo);
  }

  /**
   * 활성 사이트 목록 + company_name, device_count.
   * raw SQL: branch COALESCE company JOIN + device subquery count.
   */
  findSitesWithCounts() {
    return this.pg.query(`
      SELECT s.*, c.company_name, c.code AS company_code,
        (SELECT COUNT(*)::int FROM device d WHERE d.site_id = s.id) AS device_count
      FROM site s
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      WHERE s.is_use = TRUE ORDER BY s.site_name`);
  }

  /**
   * 단일 사이트 상세 + company_name, device_count.
   * raw SQL: PK 파라미터 바인딩($1).
   */
  findSiteWithCounts(id: number) {
    return this.pg.query(
      `
      SELECT s.*, c.company_name, c.code AS company_code,
        (SELECT COUNT(*)::int FROM device d WHERE d.site_id = s.id) AS device_count
      FROM site s
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      WHERE s.id = $1`,
      [id],
    );
  }
}

/**
 * 지점(Branch) DAO.
 * - 엔티티: {@link BranchEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class BranchDao extends IntCrudDao<BranchEntity> {
  constructor(
    @InjectRepository(BranchEntity)
    repo: Repository<BranchEntity>,
  ) {
    super(repo);
  }
}

/**
 * @deprecated {@link CompanyDao}, {@link SiteDao}로 분리됨.
 *             기존 Controller/Service의 `OrganizationDao` 주입 호환용 파사드.
 *             신규 코드는 CompanyDao / SiteDao를 직접 주입할 것.
 */
@Injectable()
export class OrganizationDao {
  constructor(
    private readonly companyDao: CompanyDao,
    private readonly siteDao: SiteDao,
  ) {}

  /** {@link CompanyDao#findCompaniesWithCounts} 위임. */
  findCompanies() {
    return this.companyDao.findCompaniesWithCounts();
  }

  /** {@link SiteDao#findSitesWithCounts} 위임. */
  findSites() {
    return this.siteDao.findSitesWithCounts();
  }
}
