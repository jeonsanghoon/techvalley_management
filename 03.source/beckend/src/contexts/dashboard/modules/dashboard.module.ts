/**
 * @file dashboard.module.ts
 * @description 대시보드 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature — DashboardDao 집계용 엔티티
 *   - DashboardAlarmDailyEntity: 알람 일별 통계
 *   - CommunicationAlarmIncidentEntity: 오픈 incident 건수
 *   - PartsOrderEntity: 대기 부품 주문
 *   - ServiceTicketEntity: 오픈 서비스 티켓
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardAlarmDailyEntity } from '../entities/dashboard-alarm-daily.entity';
import { CommunicationAlarmIncidentEntity } from '../../alarm/entities/communication-alarm-incident.entity';
import { PartsOrderEntity } from '../../parts/entities/parts.entities';
import { ServiceTicketEntity } from '../../service/entities/service.entities';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { DashboardDao, DashboardAlarmDailyDao } from '../dao/dashboard.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardAlarmDailyEntity,
      CommunicationAlarmIncidentEntity,
      PartsOrderEntity,
      ServiceTicketEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardDao, DashboardAlarmDailyDao],
})
export class DashboardModule {}
