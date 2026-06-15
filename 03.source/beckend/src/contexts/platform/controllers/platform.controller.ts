/**
 * @file platform.controller.ts
 * @description 플랫폼(헬스체크) REST API.
 * @routes GET /health — 전역 prefix 제외 (main.ts exclude), 서비스 생존 확인.
 */
import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../infrastructure/auth/decorators/public.decorator';

/** 플랫폼 운영·헬스체크 HTTP 엔드포인트. */
@Controller()
export class PlatformController {
  @Public()
  @Get('health')
  health() {
    return { ok: true, service: 'techvalley-backend' };
  }
}
