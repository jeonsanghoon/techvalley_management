/**
 * @file alarm.module.ts
 * @description 알람 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - CommunicationAlarmIncidentEntity: PostgreSQL 통신 알람 incident
 *   Mongo 알림은 AlarmDao에서 별도 연결 — forFeature에는 PG 엔티티만 등록.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationAlarmIncidentEntity } from '../entities/communication-alarm-incident.entity';
import { AlarmController } from '../controllers/alarm.controller';
import { AlarmService } from '../services/alarm.service';
import { AlarmDao } from '../dao/alarm.dao';

@Module({
  imports: [TypeOrmModule.forFeature([CommunicationAlarmIncidentEntity])],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmDao],
})
export class AlarmModule {}
