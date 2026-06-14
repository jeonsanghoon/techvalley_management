import { NextRequest, NextResponse } from "next/server";

/** Open-Meteo 프록시 — 브라우저 ad blocker가 api.open-meteo.com fetch를 차단하는 경우 우회 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const timezone = searchParams.get("timezone") ?? "Asia/Seoul";

  if (!latitude || !longitude || Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
    return NextResponse.json({ error: "latitude, longitude required" }, { status: 400 });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    );
    url.searchParams.set("timezone", timezone);
    url.searchParams.set("forecast_days", searchParams.get("forecast_days") ?? "7");

    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) {
      return NextResponse.json({ error: "forecast upstream failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=900" } });
  } catch {
    return NextResponse.json({ error: "forecast fetch failed" }, { status: 502 });
  }
}
