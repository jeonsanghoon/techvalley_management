/**
 * @file weather.controller.ts
 * @description 날씨 프록시 — Open-Meteo / Nominatim (프론트 Next.js route 대체).
 */
import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../../infrastructure/auth/decorators/public.decorator';
import { WeatherService } from '../services/weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly service: WeatherService) {}

  @Public()
  @Get('forecast')
  forecast(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('timezone') timezone = 'Asia/Seoul',
    @Query('forecast_days') forecastDays = '7',
  ) {
    return this.service.fetchForecast(latitude, longitude, timezone, forecastDays);
  }

  @Public()
  @Get('reverse')
  reverse(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('lang') lang = 'ko',
  ) {
    return this.service.reverseGeocode(lat, lon, lang);
  }
}
