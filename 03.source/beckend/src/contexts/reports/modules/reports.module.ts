/**
 * @file reports.module.ts
 * @description 리포트 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - ReportDefinitionEntity: 리포트 메타 정의(코드·카테고리)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDefinitionEntity } from '../entities/report-definition.entity';
import { ReportsController } from '../controllers/reports.controller';
import { ReportsService } from '../services/reports.service';
import { ReportsDao } from '../dao/reports.dao';

@Module({
  imports: [TypeOrmModule.forFeature([ReportDefinitionEntity])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsDao],
})
export class ReportsModule {}
