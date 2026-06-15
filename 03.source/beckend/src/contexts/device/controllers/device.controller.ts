/**
 * @file device.controller.ts
 * @description 디바이스 REST API. 전역 prefix `api` (컨트롤러 prefix 없음).
 * @routes
 *   - GET /api/equipment — 장비(플릿) 목록
 *   - GET /api/fleet/live — 실시간 플릿
 *   - GET /api/devices — 디바이스 원시 목록
 */
import { Controller, Get } from '@nestjs/common';
import { DeviceService } from '../services/device.service';

/** 장비·플릿 조회 HTTP 엔드포인트 그룹. */
@Controller()
export class DeviceController {
  constructor(private readonly service: DeviceService) {}

  /** GET /api/equipment */
  @Get('equipment')
  equipment() {
    return this.service.listEquipment();
  }

  /** GET /api/fleet/live */
  @Get('fleet/live')
  fleetLive() {
    return this.service.listFleetLive();
  }

  /** GET /api/devices */
  @Get('devices')
  devices() {
    return this.service.listDevicesRaw();
  }
}
