const DOT_SIZE = 22;

/** 상태별 Google Maps 원형 도트 마커 SVG → data URL */
export function buildFleetPinIconUrl(fillColor: string, selected = false): string {
  const stroke = selected ? "#212636" : "#ffffff";
  const strokeWidth = selected ? 2.5 : 2;
  const scale = selected ? 1.12 : 1;
  const size = DOT_SIZE * scale;
  const cx = 12;
  const cy = 12;
  const r = selected ? 9 : 8;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="${cx}" cy="${cy}" r="${r + 1.5}" fill="${fillColor}" opacity="0.28"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillColor}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <circle cx="${cx}" cy="${cy}" r="${selected ? 3.5 : 3}" fill="#ffffff" opacity="0.92"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function fleetPinIcon(
  maps: typeof google.maps,
  fillColor: string,
  selected = false,
): google.maps.Icon {
  const scale = selected ? 1.12 : 1;
  const size = DOT_SIZE * scale;
  return {
    url: buildFleetPinIconUrl(fillColor, selected),
    scaledSize: new maps.Size(size, size),
    anchor: new maps.Point(size / 2, size / 2),
  };
}
