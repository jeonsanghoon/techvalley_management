import { NextRequest, NextResponse } from "next/server";
import {
  defaultWeatherLabel,
  parseNominatimReverseLabel,
  type WeatherLanguage,
} from "@/lib/weather/open-meteo";

const NOMINATIM_UA = "TechvalleyApp/1.0 (contact: mrc0700@gmail.com)";
const CACHE_TTL_MS = 60 * 60 * 1000;

const labelCache = new Map<string, { label: string; expires: number }>();

function resolveLanguage(raw: string | null): WeatherLanguage {
  return raw === "en" ? "en" : "ko";
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const language = resolveLanguage(request.nextUrl.searchParams.get("lang"));

  if (!lat || !lon || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
    return NextResponse.json({ error: "lat, lon required" }, { status: 400 });
  }

  const cacheKey = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}:${language}`;
  const cached = labelCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(
      { label: cached.label },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }

  const fallback = defaultWeatherLabel(language);
  const acceptLanguage = language === "en" ? "en" : "ko";

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", acceptLanguage);
    url.searchParams.set("zoom", "10");

    const res = await fetch(url.toString(), {
      headers: {
        "Accept-Language": acceptLanguage,
        "User-Agent": NOMINATIM_UA,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ label: fallback });
    }

    const data = await res.json();
    const label = parseNominatimReverseLabel(data, fallback);
    labelCache.set(cacheKey, { label, expires: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(
      { label },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    return NextResponse.json({ label: fallback });
  }
}
