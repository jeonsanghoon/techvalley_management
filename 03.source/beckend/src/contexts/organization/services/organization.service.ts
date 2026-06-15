/**
 * @file organization.service.ts
 * @description 조직(고객사·현장) 도메인 비즈니스 로직.
 *              Company/Site CRUD — 삭제는 is_use=false 소프트 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapCustomer, mapSite, wrapData } from '../../../common/mappers';
import { CompanyDao, SiteDao } from '../dao/organization.dao';
import type { CompanyRow, SiteRow } from '../../../common/types/db/postgres-rows';
import type { CreateCompanyDto, CreateSiteDto, UpdateCompanyDto, UpdateSiteDto } from '../dto/organization-crud.dto';

/**
 * 조직(고객사·현장) CRUD 서비스.
 * CompanyDao·SiteDao를 통해 PostgreSQL company/site 테이블에 접근한다.
 */
@Injectable()
export class OrganizationService {
  constructor(
    private readonly companyDao: CompanyDao,
    private readonly siteDao: SiteDao,
  ) {}

  /** 고객사 전체 목록 조회 — 사이트·디바이스 집계 포함. GET /api/companies */
  async listCompanies() {
    const { rows } = await this.companyDao.findCompaniesWithCounts();
    return wrapData({ items: rows.map((r) => mapCustomer(r as CompanyRow)) }, batchMeta('postgres.company'));
  }

  /** 고객사 단건 조회. GET /api/companies/:id — 없으면 404 */
  async getCompany(id: number) {
    const { rows } = await this.companyDao.findCompanyWithCounts(id);
    const row = rows[0];
    if (!row) throw new NotFoundException(`Company ${id} not found`);
    return wrapData(mapCustomer(row as CompanyRow), batchMeta('postgres.company'));
  }

  /** 고객사 생성. POST /api/companies — is_use=true 로 활성 등록 */
  async createCompany(dto: CreateCompanyDto) {
    const row = await this.companyDao.createRow({ ...dto, is_use: true });
    return this.getCompany(row.id);
  }

  /** 고객사 수정. PUT /api/companies/:id */
  async updateCompany(id: number, dto: UpdateCompanyDto) {
    await this.companyDao.updateRow(id, dto);
    return this.getCompany(id);
  }

  /**
   * 고객사 삭제 (소프트 삭제).
   * DELETE /api/companies/:id — 물리 삭제 대신 is_use=false 로 비활성화.
   */
  async deleteCompany(id: number) {
    await this.companyDao.updateRow(id, { is_use: false });
    return { deleted: true, id: String(id) };
  }

  /** 현장 전체 목록 조회 — 고객사·디바이스 집계 포함. GET /api/sites */
  async listSites() {
    const { rows } = await this.siteDao.findSitesWithCounts();
    return wrapData({ items: rows.map((r) => mapSite(r as SiteRow)) }, batchMeta('postgres.site'));
  }

  /** 현장 단건 조회. GET /api/sites/:id — 없으면 404 */
  async getSite(id: number) {
    const { rows } = await this.siteDao.findSiteWithCounts(id);
    const row = rows[0];
    if (!row) throw new NotFoundException(`Site ${id} not found`);
    return wrapData(mapSite(row as SiteRow), batchMeta('postgres.site'));
  }

  /** 현장 생성. POST /api/sites — is_use=true 로 활성 등록 */
  async createSite(dto: CreateSiteDto) {
    const row = await this.siteDao.createRow({ ...dto, is_use: true });
    return this.getSite(row.id);
  }

  /** 현장 수정. PUT /api/sites/:id */
  async updateSite(id: number, dto: UpdateSiteDto) {
    await this.siteDao.updateRow(id, dto);
    return this.getSite(id);
  }

  /**
   * 현장 삭제 (소프트 삭제).
   * DELETE /api/sites/:id — 물리 삭제 대신 is_use=false 로 비활성화.
   */
  async deleteSite(id: number) {
    await this.siteDao.updateRow(id, { is_use: false });
    return { deleted: true, id: String(id) };
  }
}
