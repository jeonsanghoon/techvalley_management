/**
 * @file platform.module.ts
 * @description 플랫폼 NestJS 모듈 — 헬스체크 등 인프라 엔드포인트.
 * @remarks TypeOrmModule.forFeature 없음 — DB 의존성 없는 순수 컨트롤러만 등록.
 */
import { Module } from '@nestjs/common';
import { PlatformController } from '../controllers/platform.controller';
import { WeatherController } from '../controllers/weather.controller';
import { WeatherService } from '../services/weather.service';

@Module({
  controllers: [PlatformController, WeatherController],
  providers: [WeatherService],
})
export class PlatformModule {}
