/**
 * @file equipment-log.module.ts
 * @description 장비 로그 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature — 부품별 로그 엔티티
 *   - EquipmentLogTubeEntity: 튜브 로그
 *   - EquipmentLogDetectorEntity: 검출기 로그
 *   - EquipmentLogBodyEntity: 본체 로그
 *   - EquipmentLogControlEntity: 제어 로그
 *   - EquipmentLogFirmwareEntity: 펌웨어 로그
 *   - EquipmentLogAuditEntity: 감사 로그
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EquipmentLogTubeEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogAuditEntity,
} from '../entities/equipment-log.entities';
import { EquipmentLogController } from '../controllers/equipment-log.controller';
import { EquipmentLogService } from '../services/equipment-log.service';
import { EquipmentLogDao } from '../dao/equipment-log.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipmentLogTubeEntity,
      EquipmentLogDetectorEntity,
      EquipmentLogBodyEntity,
      EquipmentLogControlEntity,
      EquipmentLogFirmwareEntity,
      EquipmentLogAuditEntity,
    ]),
  ],
  controllers: [EquipmentLogController],
  providers: [EquipmentLogService, EquipmentLogDao],
  exports: [EquipmentLogDao],
})
export class EquipmentLogModule {}
