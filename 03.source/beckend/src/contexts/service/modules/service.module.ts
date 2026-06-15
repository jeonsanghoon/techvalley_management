/**
 * @file service.module.ts
 * @description 서비스 데스크·SLA NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - ServiceTicketEntity: 서비스 티켓
 *   - EngineerProfileEntity: 엔지니어 프로필
 *   - AsRecordEntity: AS(애프터서비스) 기록
 *   - SlaFleetSnapshotEntity: SLA 플릿 스냅샷
 *   - SlaContractDefinitionEntity: SLA 계약 정의(티어)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServiceTicketEntity,
  EngineerProfileEntity,
  AsRecordEntity,
  SlaFleetSnapshotEntity,
  SlaContractDefinitionEntity,
} from '../entities/service.entities';
import { ServiceDeskController } from '../controllers/service-desk.controller';
import { SlaController } from '../controllers/sla.controller';
import { ServiceDeskService, SlaService } from '../services/service.service';
import {
  ServiceTicketDao,
  SlaDao,
  EngineerProfileDao,
  AsRecordDao,
} from '../dao/service.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceTicketEntity,
      EngineerProfileEntity,
      AsRecordEntity,
      SlaFleetSnapshotEntity,
      SlaContractDefinitionEntity,
    ]),
  ],
  controllers: [ServiceDeskController, SlaController],
  providers: [
    ServiceDeskService,
    SlaService,
    ServiceTicketDao,
    SlaDao,
    EngineerProfileDao,
    AsRecordDao,
  ],
})
export class ServiceModule {}
