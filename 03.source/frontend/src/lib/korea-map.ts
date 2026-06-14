/** 대한민국 본토 간략 윤곽 (위도·경도) — 대시보드 플릿 지도용 */
const KOREA_OUTLINE_LATLNG: [number, number][] = [
  [38.55, 124.75],
  [38.65, 126.4],
  [38.45, 127.8],
  [38.2, 128.85],
  [37.55, 129.35],
  [36.2, 129.45],
  [35.55, 129.25],
  [35.05, 129.05],
  [34.72, 128.05],
  [34.78, 126.85],
  [35.05, 126.15],
  [35.85, 125.95],
  [36.55, 126.05],
  [37.15, 126.35],
  [37.75, 126.15],
  [38.2, 125.05],
];

/** 제주도 */
const JEJU_OUTLINE_LATLNG: [number, number][] = [
  [33.58, 126.12],
  [33.62, 126.98],
  [33.18, 126.98],
  [33.12, 126.2],
];

export const KOREA_BOUNDS = {
  minLat: 33.0,
  maxLat: 38.9,
  minLng: 124.5,
  maxLng: 131.5,
};

export const MAP_VIEW = { width: 100, height: 132, pad: 5 };

export function projectKorea(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = KOREA_BOUNDS;
  const { width, height, pad } = MAP_VIEW;
  const x = pad + ((lng - minLng) / (maxLng - minLng)) * (width - pad * 2);
  const y = pad + ((maxLat - lat) / (maxLat - minLat)) * (height - pad * 2);
  return { x, y };
}

function latLngRingToPath(ring: [number, number][]) {
  return ring
    .map(([lat, lng], i) => {
      const { x, y } = projectKorea(lat, lng);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ")
    .concat(" Z");
}

export const KOREA_MAINLAND_PATH = latLngRingToPath(KOREA_OUTLINE_LATLNG);
export const KOREA_JEJU_PATH = latLngRingToPath(JEJU_OUTLINE_LATLNG);

/** 권역별 대표 좌표 (mock 장비 분산용) */
export const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  경기: { lat: 37.28, lng: 127.02 },
  경북: { lat: 36.02, lng: 128.6 },
  충남: { lat: 36.45, lng: 127.12 },
  충북: { lat: 36.85, lng: 127.75 },
  울산: { lat: 35.54, lng: 129.31 },
  전북: { lat: 35.82, lng: 127.11 },
  전남: { lat: 34.82, lng: 126.89 },
  강원: { lat: 37.75, lng: 128.9 },
  제주: { lat: 33.48, lng: 126.53 },
};

export function spreadCoord(
  region: string,
  index: number,
): { lat: number; lng: number } {
  const base = REGION_COORDS[region] ?? REGION_COORDS["경기"];
  const angle = index * 2.399963; // golden angle
  const r = 0.08 + (index % 4) * 0.05;
  return {
    lat: base.lat + Math.sin(angle) * r,
    lng: base.lng + Math.cos(angle) * r * 1.2,
  };
}

/** 동일 좌표 근처 마커 겹침 완화 */
export function markerSpreadKey(lat: number, lng: number) {
  return `${lat.toFixed(2)}:${lng.toFixed(2)}`;
}

export function spreadMarkerPosition(
  lat: number,
  lng: number,
  slot: number,
  total: number,
): { x: number; y: number } {
  const base = projectKorea(lat, lng);
  if (total <= 1) return base;
  const angle = (slot / total) * Math.PI * 2;
  const r = 1.4 + total * 0.15;
  return {
    x: base.x + Math.cos(angle) * r,
    y: base.y + Math.sin(angle) * r,
  };
}
