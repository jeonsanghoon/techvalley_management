/**
 * @file inspection.module.ts
 * @description 검사 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - YieldInspectionRecordEntity: 수율 검사 기록
 *   - AlgorithmConfigEntity: 검사 알고리즘 설정(버전·임계값)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  YieldInspectionRecordEntity,
  AlgorithmConfigEntity,
} from '../entities/inspection.entities';
import { InspectionController } from '../controllers/inspection.controller';
import { InspectionService } from '../services/inspection.service';
import {
  InspectionDao,
  YieldInspectionDao,
  AlgorithmConfigDao,
} from '../dao/inspection.dao';

@Module({
  imports: [TypeOrmModule.forFeature([YieldInspectionRecordEntity, AlgorithmConfigEntity])],
  controllers: [InspectionController],
  providers: [InspectionService, InspectionDao, YieldInspectionDao, AlgorithmConfigDao],
})
export class InspectionModule {}
