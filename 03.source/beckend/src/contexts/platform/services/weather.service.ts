import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class WeatherService {
  async fetchForecast(
    latitude: string,
    longitude: string,
    timezone: string,
    forecastDays: string,
  ) {
    if (!latitude || !longitude || Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
      throw new BadRequestException('latitude, longitude required');
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m');
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    );
    url.searchParams.set('timezone', timezone);
    url.searchParams.set('forecast_days', forecastDays);

    const res = await fetch(url.toString());
    if (!res.ok) throw new BadRequestException('forecast upstream failed');
    return res.json();
  }

  async reverseGeocode(lat: string, lon: string, lang: string) {
    if (!lat || !lon || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
      throw new BadRequestException('lat, lon required');
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    url.searchParams.set('format', 'json');
    url.searchParams.set('accept-language', lang === 'en' ? 'en' : 'ko');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'techvalley-portal/1.0' },
    });
    if (!res.ok) throw new BadRequestException('reverse geocode failed');

    const data = (await res.json()) as {
      address?: Record<string, string | undefined>;
    };
    const addr = data.address ?? {};
    const city =
      addr.city ?? addr.town ?? addr.municipality ?? addr.borough ?? addr.village ?? addr.county ?? '';
    const state = addr.state ?? addr.province ?? addr.region ?? '';
    const label = [city, state].filter(Boolean).join(' · ') || (lang === 'en' ? 'Seoul' : '서울');
    return { label };
  }
}
