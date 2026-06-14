/** Google Maps — 플릿 지도 (Styling Wizard · Night 프리셋 JSON) */

/**
 * Google Maps Platform Styling Wizard — Night 테마
 * @see https://developers.google.com/maps/documentation/javascript/examples/style-array
 */
export const FLEET_MAP_NIGHT_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

function fleetMapAppearance(isNight: boolean): Pick<google.maps.MapOptions, "styles"> {
  return isNight ? { styles: FLEET_MAP_NIGHT_STYLES } : { styles: [] };
}

export function getFleetMapInitOptions(
  maps: typeof google.maps,
  isNight: boolean,
  isFullscreen: boolean,
): google.maps.MapOptions {
  return {
    mapTypeId: maps.MapTypeId.ROADMAP,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    gestureHandling: isFullscreen ? "greedy" : "cooperative",
    ...fleetMapAppearance(isNight),
  };
}

/** 테마 전환 시 Night JSON styles 갱신 (ColorScheme과 혼용하지 않음) */
export function applyFleetMapTheme(map: google.maps.Map, isNight: boolean) {
  map.setOptions(fleetMapAppearance(isNight));
}
