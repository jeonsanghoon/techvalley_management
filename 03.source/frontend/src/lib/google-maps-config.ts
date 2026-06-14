/** 대한민국 플릿 지도 기본 뷰 */
export const KOREA_MAP_CENTER = { lat: 36.4, lng: 127.8 };
export const KOREA_MAP_ZOOM = 7;

/**
 * Same-origin Maps API 경로 (next.config rewrites → maps.googleapis.com).
 * ad blocker가 외부 Google 도메인 script 요청을 ERR_BLOCKED_BY_CLIENT로 막는 것을 완화.
 */
export const GOOGLE_MAPS_PROXY_ORIGIN = "/gmaps";

/** Maps JS API 로더 언어 — 앱 UI locale과 분리 (로더 옵션 1회 고정) */
export const GOOGLE_MAPS_LOADER_LANGUAGE = "ko";

export function getGoogleMapsApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}
