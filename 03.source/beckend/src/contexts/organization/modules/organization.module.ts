/**
 * @file organization.module.ts
 * @description 조직(고객사·현장) NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - CompanyEntity: 고객사(company) 마스터
 *   - BranchEntity: 지사(branch) — 조직 계층
 *   - SiteEntity: 현장(site) — 디바이스 배치 단위
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CompanyEntity,
  BranchEntity,
  SiteEntity,
} from '../entities/organization.entities';
import { OrganizationController } from '../controllers/organization.controller';
import { OrganizationService } from '../services/organization.service';
import {
  OrganizationDao,
  CompanyDao,
  SiteDao,
  BranchDao,
} from '../dao/organization.dao';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, BranchEntity, SiteEntity])],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationDao, CompanyDao, SiteDao, BranchDao],
})
export class OrganizationModule {}
