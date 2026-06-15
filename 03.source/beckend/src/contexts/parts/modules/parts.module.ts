/**
 * @file parts.module.ts
 * @description 부품 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - PartsOrderEntity: 부품 주문
 *   - PartsScheduleEntity: 부품 교체·점검 일정
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsOrderEntity, PartsScheduleEntity } from '../entities/parts.entities';
import { PartsController } from '../controllers/parts.controller';
import { PartsService } from '../services/parts.service';
import { PartsDao, PartsOrderDao, PartsScheduleDao } from '../dao/parts.dao';

@Module({
  imports: [TypeOrmModule.forFeature([PartsOrderEntity, PartsScheduleEntity])],
  controllers: [PartsController],
  providers: [PartsService, PartsDao, PartsOrderDao, PartsScheduleDao],
})
export class PartsModule {}
