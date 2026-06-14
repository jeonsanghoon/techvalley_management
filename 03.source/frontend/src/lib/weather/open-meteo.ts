/** Open-Meteo — API 키 불필요, CORS 허용 https://open-meteo.com */

export type WeatherLanguage = "ko" | "en";

export const DEFAULT_WEATHER_COORDS_BASE = { latitude: 37.5665, longitude: 126.978 };

export function defaultWeatherLabel(language: WeatherLanguage = "ko"): string {
  return language === "en" ? "Seoul" : "서울";
}

export function defaultWeatherCoords(language: WeatherLanguage = "ko"): WeatherCoords {
  return { ...DEFAULT_WEATHER_COORDS_BASE, label: defaultWeatherLabel(language) };
}

/** @deprecated defaultWeatherCoords(language) 사용 */
export const DEFAULT_WEATHER_COORDS = defaultWeatherCoords("ko");

export type WeatherCoords = { latitude: number; longitude: number; label: string };

export type WeatherSnapshot = {
  coords: WeatherCoords;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    time: string;
  };
  daily: {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    precipProb: number;
  }[];
  fetchedAt: string;
};

type OpenMeteoForecast = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

export type NominatimReverse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    borough?: string;
    village?: string;
    state?: string;
    province?: string;
    region?: string;
  };
};

export function parseNominatimReverseLabel(
  data: NominatimReverse,
  fallback = defaultWeatherLabel("ko"),
): string {
  const addr = data.address;
  if (!addr) return fallback;
  const city =
    addr.city ?? addr.town ?? addr.municipality ?? addr.borough ?? addr.village ?? addr.county ?? "";
  const state = addr.state ?? addr.province ?? addr.region ?? "";
  return [city, state].filter(Boolean).join(" · ") || fallback;
}

const labelCache = new Map<string, string>();
const inflightLabels = new Map<string, Promise<string>>();

function geocodeCacheKey(latitude: number, longitude: number, language: WeatherLanguage) {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}:${language}`;
}

/** 역지오코딩 — 브라우저 CORS 회피를 위해 Next.js API 프록시 경유 */
export async function reverseGeocodeLabel(
  latitude: number,
  longitude: number,
  language: WeatherLanguage = "ko",
): Promise<string> {
  const cacheKey = geocodeCacheKey(latitude, longitude, language);
  const cached = labelCache.get(cacheKey);
  if (cached) return cached;

  const inflight = inflightLabels.get(cacheKey);
  if (inflight) return inflight;

  const fallback = defaultWeatherLabel(language);

  const request = (async () => {
    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        lang: language,
      });
      const res = await fetch(`/api/weather/reverse?${params.toString()}`);
      if (!res.ok) return fallback;
      const data = (await res.json()) as { label?: string };
      const label =
        typeof data.label === "string" && data.label.trim() ? data.label : fallback;
      labelCache.set(cacheKey, label);
      return label;
    } catch {
      return fallback;
    } finally {
      inflightLabels.delete(cacheKey);
    }
  })();

  inflightLabels.set(cacheKey, request);
  return request;
}

/** Open-Meteo forecast — same-origin API 프록시 (ad blocker 우회) */
export async function fetchWeatherForecast(
  coords: WeatherCoords,
  timeZone = "Asia/Seoul",
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    timezone: timeZone,
    forecast_days: "7",
  });

  const res = await fetch(`/api/weather/forecast?${params.toString()}`);
  if (!res.ok) throw new Error("날씨 정보를 불러오지 못했습니다.");

  const data = (await res.json()) as OpenMeteoForecast;
  const current = data.current;
  const daily = data.daily;

  if (!current || !daily) throw new Error("날씨 응답 형식이 올바르지 않습니다.");

  return {
    coords,
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      time: current.time,
    },
    daily: daily.time.map((date, i) => ({
      date,
      weatherCode: daily.weather_code[i] ?? 0,
      tempMax: daily.temperature_2m_max[i] ?? 0,
      tempMin: daily.temperature_2m_min[i] ?? 0,
      precipProb: daily.precipitation_probability_max[i] ?? 0,
    })),
    fetchedAt: new Date().toISOString(),
  };
}

/** WMO weather code → 라벨 */
export function weatherCodeLabel(code: number, language: "ko" | "en" = "ko"): string {
  if (language === "en") {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Fog";
    if (code <= 57) return "Drizzle";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    if (code <= 86) return "Snow";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  }
  if (code === 0) return "맑음";
  if (code <= 3) return "구름 조금";
  if (code <= 48) return "안개";
  if (code <= 57) return "이슬비";
  if (code <= 67) return "비";
  if (code <= 77) return "눈";
  if (code <= 82) return "소나기";
  if (code <= 86) return "눈";
  if (code >= 95) return "천둥번개";
  return "흐림";
}

export function weatherCodeEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "☁️";
}
