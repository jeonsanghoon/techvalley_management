import { menuPermissions } from "@/lib/menu-catalog";
import { resolveNavMenuId } from "@/lib/navigation";
import type { MenuPermission } from "@/lib/types";
import type { AppRole, MenuActionPermRow, MenuActionPermission, PermissionAction, RoleAccess } from "./types";
import { ACTION_LABELS } from "./types";

const SERVICE_MENUS = new Set([
  "service-tickets",
  "service-progress",
  "parts-orders",
  "parts-schedule",
  "as",
  "alarms",
]);

const EXECUTE_MENUS = new Set(["remote-control", "settings-firmware"]);

const CUSTOMER_EXPORT_MENUS = new Set(["equipment", "sla", "reports", "inspection", "as", "dashboard"]);

function viewAccess(menu: MenuPermission): RoleAccess {
  return { admin: menu.admin, engineer: menu.engineer, cs: menu.cs, customer: menu.customer };
}

function deriveActions(menu: MenuPermission): Omit<MenuActionPermission, "menuId" | "menuName" | "groupLabel" | "href" | "parentMenuId"> {
  const anchorId = resolveNavMenuId(menu.menuId);
  const view = viewAccess(menu);
  const isAdminMenu = anchorId.startsWith("admin-");
  const isSettingsMenu = anchorId.startsWith("settings-");
  const isAlarmRules = anchorId === "alarm-rules";

  const create: RoleAccess = {
    admin: view.admin,
    engineer: view.engineer && !isAdminMenu,
    cs: view.cs && SERVICE_MENUS.has(anchorId),
    customer: false,
  };

  const update: RoleAccess = {
    admin: view.admin,
    engineer: view.engineer && !isAdminMenu,
    cs: view.cs && (SERVICE_MENUS.has(anchorId) || anchorId === "equipment-logs"),
    customer: false,
  };

  const del: RoleAccess = {
    admin: view.admin && (isAdminMenu || isSettingsMenu || isAlarmRules),
    engineer: view.engineer && (isAlarmRules || anchorId === "settings-notifications"),
    cs: false,
    customer: false,
  };

  const exportAccess: RoleAccess = {
    admin: view.admin,
    engineer: view.engineer,
    cs: view.cs && !isAdminMenu && anchorId !== "remote-control",
    customer: view.customer && CUSTOMER_EXPORT_MENUS.has(anchorId),
  };

  const execute: RoleAccess = {
    admin: view.admin && (EXECUTE_MENUS.has(anchorId) || anchorId === "metric-stream"),
    engineer: view.engineer && (EXECUTE_MENUS.has(anchorId) || anchorId === "metric-stream"),
    cs: false,
    customer: false,
  };

  return { view, create, update, delete: del, export: exportAccess, execute };
}

export const menuActionPermissions: MenuActionPermission[] = menuPermissions.map((menu) => ({
  menuId: menu.menuId,
  menuName: menu.menuName,
  ...deriveActions(menu),
}));

export const menuActionPermRows: MenuActionPermRow[] = menuPermissions.flatMap((menu) => {
  const actions = menuActionPermissions.find((m) => m.menuId === menu.menuId);
  if (!actions) return [];

  return (["view", "create", "update", "delete", "export", "execute"] as PermissionAction[]).map((action) => ({
    id: `${menu.menuId}-${action}`,
    menuId: menu.menuId,
    menuName: menu.menuName,
    groupLabel: menu.groupLabel,
    lifecyclePhase: menu.lifecyclePhase,
    action,
    actionLabel: ACTION_LABELS[action],
    admin: actions[action].admin,
    engineer: actions[action].engineer,
    cs: actions[action].cs,
    customer: actions[action].customer,
  }));
});

export function canPerform(
  menuId: string,
  action: PermissionAction,
  role: AppRole,
): boolean {
  const anchorId = resolveNavMenuId(menuId);
  const menu = menuActionPermissions.find((m) => m.menuId === anchorId);
  if (!menu) return false;
  return menu[action][role];
}

export function getAccessibleMenuIds(role: AppRole): string[] {
  return menuActionPermissions.filter((m) => m.view[role]).map((m) => m.menuId);
}
