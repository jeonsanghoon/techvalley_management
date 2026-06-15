/**
 * @file alarm.controller.ts
 * @description 알람 REST API. 전역 prefix `api` (컨트롤러 prefix 없음).
 * @routes
 *   - GET /api/alarms — 통합 알람 incident 목록
 *   - GET /api/alarm-rules — YAML 알람 규칙 목록
 */
import { Controller, Get } from '@nestjs/common';
import { AlarmService } from '../services/alarm.service';

/** 알람 incident·규칙 조회 HTTP 엔드포인트 그룹. */
@Controller()
export class AlarmController {
  constructor(private readonly service: AlarmService) {}

  /** GET /api/alarms */
  @Get('alarms')
  alarms() {
    return this.service.listAlarms();
  }

  /** GET /api/alarm-rules */
  @Get('alarm-rules')
  alarmRules() {
    return this.service.listAlarmRules();
  }
}
