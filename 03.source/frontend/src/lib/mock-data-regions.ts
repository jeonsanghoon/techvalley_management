import type { ServiceRegionId } from "@/lib/locale/settings";
import type { Equipment } from "./types";

/** 장비 geoZone — 미지정 시 한국 */
export function equipmentGeoZone(eq: Equipment): ServiceRegionId {
  return eq.geoZone ?? "korea";
}

export function equipmentMatchesServiceRegion(
  eq: Equipment,
  serviceRegion: ServiceRegionId,
): boolean {
  const zone = equipmentGeoZone(eq);
  if (serviceRegion === "global") return true;
  if (serviceRegion === "korea") return zone === "korea";
  if (serviceRegion === "east-asia") return zone === "east-asia";
  if (serviceRegion === "europe") return zone === "europe";
  if (serviceRegion === "mexico") return zone === "mexico";
  if (serviceRegion === "north-america") return zone === "north-america" || zone === "mexico";
  if (serviceRegion === "middle-east") return zone === "middle-east";
  return true;
}
