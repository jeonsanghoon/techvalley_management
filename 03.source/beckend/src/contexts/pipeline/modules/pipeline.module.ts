/**
 * @file pipeline.module.ts
 * @description 데이터 파이프라인 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - CollectionDailyStatsEntity: Mongo 컬렉션 일별 수집 통계
 *   DeviceModule import — DeviceDao(활성·온라인 디바이스 카운트) 재사용.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionDailyStatsEntity } from '../entities/collection-daily-stats.entity';
import { DeviceModule } from '../../device/modules/device.module';
import { PipelineController } from '../controllers/pipeline.controller';
import { PipelineService } from '../services/pipeline.service';
import { PipelineDao, CollectionDailyStatsDao } from '../dao/pipeline.dao';

@Module({
  imports: [DeviceModule, TypeOrmModule.forFeature([CollectionDailyStatsEntity])],
  controllers: [PipelineController],
  providers: [PipelineService, PipelineDao, CollectionDailyStatsDao],
})
export class PipelineModule {}
