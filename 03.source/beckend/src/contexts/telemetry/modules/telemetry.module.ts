/**
 * @file telemetry.module.ts
 * @description 텔레메트리 NestJS 모듈.
 * @remarks TypeORM forFeature 없음 — TelemetryDao가 MongoDB 직접 연결.
 *   controllers: TelemetryController (latest·SSE stream)
 */
import { Module } from '@nestjs/common';
import { TelemetryController } from '../controllers/telemetry.controller';
import { TelemetryService } from '../services/telemetry.service';
import { TelemetryDao } from '../dao/telemetry.dao';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryDao],
})
export class TelemetryModule {}
