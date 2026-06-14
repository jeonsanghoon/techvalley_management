import { getCollectionLifecycleMeta } from "@/lib/collection-lifecycle";
import { navigation, resolveNavMenuId } from "@/lib/navigation";
import type { MenuPermission } from "@/lib/types";

type ViewAccess = Pick<MenuPermission, "admin" | "engineer" | "cs" | "customer">;

/** RBAC 앵커 메뉴(서브 메뉴는 동일 권한 상속) */
const VIEW_ACCESS: Record<string, ViewAccess> = {
  dashboard: { admin: true, engineer: true, cs: true, customer: true },
  "data-pipeline": { admin: true, engineer: true, cs: false, customer: false },
  "equipment-logs": { admin: true, engineer: true, cs: true, customer: false },
  "metric-stream": { admin: true, engineer: true, cs: false, customer: false },
  alarms: { admin: true, engineer: true, cs: true, customer: false },
  "alarm-rules": { admin: true, engineer: true, cs: false, customer: false },
  "remote-diagnosis": { admin: true, engineer: true, cs: true, customer: false },
  "remote-control": { admin: true, engineer: true, cs: false, customer: false },
  "service-tickets": { admin: true, engineer: true, cs: true, customer: false },
  "service-progress": { admin: true, engineer: true, cs: true, customer: false },
  sla: { admin: true, engineer: true, cs: true, customer: true },
  equipment: { admin: true, engineer: true, cs: true, customer: true },
  installation: { admin: true, engineer: true, cs: false, customer: false },
  customers: { admin: true, engineer: true, cs: true, customer: false },
  "parts-orders": { admin: true, engineer: true, cs: true, customer: false },
  "parts-schedule": { admin: true, engineer: true, cs: true, customer: false },
  as: { admin: true, engineer: true, cs: true, customer: true },
  inspection: { admin: true, engineer: true, cs: false, customer: true },
  reports: { admin: true, engineer: true, cs: true, customer: true },
  "settings-notifications": { admin: true, engineer: true, cs: false, customer: false },
  "settings-firmware": { admin: true, engineer: true, cs: false, customer: false },
  "admin-users": { admin: true, engineer: false, cs: false, customer: false },
  "admin-codes": { admin: true, engineer: false, cs: false, customer: false },
  "admin-menus": { admin: true, engineer: false, cs: false, customer: false },
  "admin-iot-auth": { admin: true, engineer: true, cs: false, customer: false },
};

function viewAccessFor(menuId: string): ViewAccess {
  const anchorId = resolveNavMenuId(menuId);
  const access = VIEW_ACCESS[anchorId];
  if (!access) {
    throw new Error(`Missing VIEW_ACCESS for menu: ${anchorId}`);
  }
  return access;
}

/** 사이드바 navigation 순서와 동기화된 메뉴 권한 목록 */
export function buildMenuPermissions(): MenuPermission[] {
  return navigation.flatMap((group) =>
    group.items.map((item) => {
      const anchorId = resolveNavMenuId(item.id);
      const lifecycle = getCollectionLifecycleMeta(item.id);

      return {
        menuId: item.id,
        menuName: item.label,
        groupLabel: group.label,
        href: item.href,
        parentMenuId: anchorId !== item.id ? anchorId : undefined,
        lifecyclePhase: lifecycle?.phaseLabel,
        lifecycleOrder: lifecycle?.phaseOrder,
        dataScope: lifecycle?.dataScope,
        storageTier: lifecycle?.storageTier,
        ...viewAccessFor(item.id),
      };
    }),
  );
}

export const menuPermissions = buildMenuPermissions();
