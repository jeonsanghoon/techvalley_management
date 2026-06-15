/**
 * @file remote.controller.ts
 * @description 원격 진단 REST API. prefix `api/remote`.
 * @routes GET/POST/PUT/DELETE /api/remote/diagnostics, /api/remote/diagnostics/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { RemoteService } from '../services/remote.service';

/** 원격 진단 finding CRUD HTTP 엔드포인트 그룹. */
@Controller('remote')
export class RemoteController {
  constructor(private readonly service: RemoteService) {}

  /** GET /api/remote/diagnostics — 진단 finding 목록 */
  @Get('diagnostics')
  diagnostics() {
    return this.service.listDiagnostics();
  }

  /** GET /api/remote/diagnostics/:id — 진단 finding 단건 */
  @Get('diagnostics/:id')
  diagnostic(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  /** POST /api/remote/diagnostics — 진단 finding 생성 */
  @Post('diagnostics')
  create(@Body() dto: {
    device_code: string;
    finding_code: string;
    severity: string;
    title: string;
    detail: string;
    suggested_action?: string;
  }) {
    return this.service.create(dto);
  }

  /** PUT /api/remote/diagnostics/:id — 진단 finding 수정 */
  @Put('diagnostics/:id')
  update(@Param('id') id: string, @Body() dto: { severity?: string; title?: string; detail?: string; suggested_action?: string }) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/remote/diagnostics/:id — 진단 finding 하드 삭제 */
  @Delete('diagnostics/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  /** POST /api/remote/control/commands — 원격 제어 명령 */
  @Post('control/commands')
  controlCommand(
    @Body()
    dto: {
      equipmentSn: string;
      command: 'apply_params' | 'safe_mode' | 'emg';
      params?: { kv?: number; ma?: number };
    },
  ) {
    return this.service.executeControlCommand(dto);
  }

  /** POST /api/remote/diagnostics/:id/run — 진단 Job 실행 */
  @Post('diagnostics/:id/run')
  runDiagnosis(@Param('id') id: string) {
    return this.service.runDiagnosis(id);
  }
}
