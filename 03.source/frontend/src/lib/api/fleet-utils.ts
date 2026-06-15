import type { Equipment } from "@/lib/types";

export function fleetStatusCounts(equipment: Equipment[]) {
  const counts = { online: 0, alarm: 0, maintenance: 0, offline: 0, safe_mode: 0 };
  for (const eq of equipment) {
    const k = eq.status in counts ? eq.status : "offline";
    counts[k as keyof typeof counts] += 1;
  }
  return counts;
}

export function fleetTotals(equipment: Equipment[]) {
  const c = fleetStatusCounts(equipment);
  return {
    totalFleet: equipment.length,
    online: c.online,
    alarm: c.alarm,
    maintenance: c.maintenance,
    offline: c.offline + c.safe_mode,
  };
}

export function filterEquipmentByRegion(equipment: Equipment[], serviceRegion: string) {
  if (serviceRegion === "global") return equipment;
  const zoneMap: Record<string, string[]> = {
    korea: ["korea"],
    "east-asia": ["korea", "east-asia"],
    europe: ["europe"],
    mexico: ["mexico", "north-america"],
  };
  const zones = zoneMap[serviceRegion] ?? [serviceRegion];
  return equipment.filter((eq) => zones.includes(eq.geoZone ?? "korea"));
}
