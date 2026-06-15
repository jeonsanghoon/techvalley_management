/**
 * @file organization.controller.ts
 * @description 조직 REST API 컨트롤러. 전역 prefix `api` 적용.
 * @routes
 *   - GET/POST/PUT/DELETE /api/companies, /api/companies/:id
 *   - GET/POST/PUT/DELETE /api/sites, /api/sites/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body, ParseIntPipe } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateCompanyDto, CreateSiteDto, UpdateCompanyDto, UpdateSiteDto } from '../dto/organization-crud.dto';

/** 조직(고객사·현장) CRUD HTTP 엔드포인트 그룹. */
@Controller()
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  /** GET /api/companies — 고객사 목록 */
  @Get('companies')
  companies() {
    return this.service.listCompanies();
  }

  /** GET /api/companies/:id — 고객사 단건 */
  @Get('companies/:id')
  company(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCompany(id);
  }

  /** POST /api/companies — 고객사 생성 */
  @Post('companies')
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.service.createCompany(dto);
  }

  /** PUT /api/companies/:id — 고객사 수정 */
  @Put('companies/:id')
  updateCompany(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.service.updateCompany(id, dto);
  }

  /** DELETE /api/companies/:id — 고객사 소프트 삭제 */
  @Delete('companies/:id')
  deleteCompany(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCompany(id);
  }

  /** GET /api/sites — 현장 목록 */
  @Get('sites')
  sites() {
    return this.service.listSites();
  }

  /** GET /api/sites/:id — 현장 단건 */
  @Get('sites/:id')
  site(@Param('id', ParseIntPipe) id: number) {
    return this.service.getSite(id);
  }

  /** POST /api/sites — 현장 생성 */
  @Post('sites')
  createSite(@Body() dto: CreateSiteDto) {
    return this.service.createSite(dto);
  }

  /** PUT /api/sites/:id — 현장 수정 */
  @Put('sites/:id')
  updateSite(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSiteDto) {
    return this.service.updateSite(id, dto);
  }

  /** DELETE /api/sites/:id — 현장 소프트 삭제 */
  @Delete('sites/:id')
  deleteSite(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSite(id);
  }
}
