/**
 * @file telemetry.controller.ts
 * @description 텔레메트리 REST·SSE API. prefix `api/metric-stream`.
 * @routes
 *   - GET /api/metric-stream/latest — 최근 메트릭 JSON
 *   - GET /api/metric-stream/stream — Server-Sent Events (3초 간격 tick)
 */
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TelemetryService } from '../services/telemetry.service';

/** 메트릭 스트림 HTTP·SSE 엔드포인트 그룹. */
@Controller('metric-stream')
export class TelemetryController {
  constructor(private readonly service: TelemetryService) {}

  /** GET /api/metric-stream/latest */
  @Get('latest')
  latest() {
    return this.service.getLatest();
  }

  /**
   * GET /api/metric-stream/stream — text/event-stream SSE.
   * 3초마다 최신 텔레메트리 1건을 data: JSON 으로 push.
   */
  @Get('stream')
  async stream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let n = 0;
    const tick = async () => {
      try {
        const latest = await this.service.streamTick();
        const doc = latest[0];
        if (doc) {
          res.write(
            `data: ${JSON.stringify({
              type: 'telemetry',
              device_code: doc.device_code,
              metric_values_kv: doc.metric_values_kv,
              device_timestamp: doc.device_timestamp,
              seq: n++,
            })}\n\n`,
          );
        }
      } catch (err) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`,
        );
      }
    };

    await tick();
    const id = setInterval(tick, 3000);
    res.on('close', () => clearInterval(id));
  }
}
