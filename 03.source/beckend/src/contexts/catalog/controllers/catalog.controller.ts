/**
 * @file catalog.controller.ts
 * @description 카탈로그 REST API. 전역 prefix `api` (컨트롤러 prefix 없음).
 * @routes
 *   - GET /api/firmware/configs — 펌웨어 구성 목록
 *   - GET /api/iot/things — IoT Thing 레지스트리
 */
import { Controller, Get } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';

/** 펌웨어·IoT 카탈로그 조회 HTTP 엔드포인트 그룹. */
@Controller()
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  /** GET /api/firmware/configs */
  @Get('firmware/configs')
  firmwareConfigs() {
    return this.service.listFirmwareConfigs();
  }

  /** GET /api/iot/things */
  @Get('iot/things')
  iotThings() {
    return this.service.listIotThings();
  }
}
