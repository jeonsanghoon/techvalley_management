import type { EquipmentDto } from '../../device/dto/equipment.dto';

const ZONE_MAP: Record<string, string[]> = {
  global: [],
  korea: ['korea'],
  'east-asia': ['korea', 'east-asia'],
  europe: ['europe'],
  mexico: ['mexico', 'north-america'],
};

const FLEET_STATUSES = ['online', 'alarm', 'maintenance', 'offline', 'safe_mode'] as const;
const TICKET_STAGES = ['접수', '배정', '출동', '작업', '완료'] as const;

export function filterEquipmentByRegion(
  equipment: EquipmentDto[],
  region?: string,
): EquipmentDto[] {
  const key = region?.trim() || 'global';
  if (key === 'global') return equipment;
  const zones = ZONE_MAP[key] ?? [key];
  return equipment.filter((eq) => zones.includes(eq.geoZone ?? 'korea'));
}

export function fleetStatusCounts(equipment: EquipmentDto[]) {
  const counts: Record<(typeof FLEET_STATUSES)[number], number> = {
    online: 0,
    alarm: 0,
    maintenance: 0,
    offline: 0,
    safe_mode: 0,
  };
  for (const eq of equipment) {
    const k = FLEET_STATUSES.includes(eq.status as (typeof FLEET_STATUSES)[number])
      ? (eq.status as (typeof FLEET_STATUSES)[number])
      : 'offline';
    counts[k] += 1;
  }
  return counts;
}

export function buildFleetStatusChart(equipment: EquipmentDto[]) {
  const counts = fleetStatusCounts(equipment);
  const statuses = FLEET_STATUSES.filter((s) => counts[s] > 0);
  return {
    statuses: statuses.length > 0 ? [...statuses] : [...FLEET_STATUSES],
    counts: (statuses.length > 0 ? statuses : FLEET_STATUSES).map((s) => counts[s]),
    totalFleet: equipment.length,
  };
}

const STAGE_CODE_TO_KO: Record<string, string> = {
  open: '접수',
  assigned: '배정',
  dispatched: '출동',
  in_progress: '작업',
  closed: '완료',
};

export function buildTicketStageChart<T extends { stage: string }>(tickets: T[]) {
  return {
    stages: [...TICKET_STAGES],
    counts: TICKET_STAGES.map((korLabel) =>
      tickets.filter((t) => (STAGE_CODE_TO_KO[t.stage] ?? t.stage) === korLabel).length,
    ),
  };
}

export function filterByFleetSerials<T extends { equipmentSn: string }>(
  rows: T[],
  fleet: EquipmentDto[],
): T[] {
  const serials = new Set(fleet.map((eq) => eq.serialNo));
  return rows.filter((row) => serials.has(row.equipmentSn));
}
