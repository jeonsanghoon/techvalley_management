import type { SvgIconComponent } from "@mui/icons-material";
import PublicIcon from "@mui/icons-material/Public";
import StorageIcon from "@mui/icons-material/Storage";
import HistoryIcon from "@mui/icons-material/History";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BoltIcon from "@mui/icons-material/Bolt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TuneIcon from "@mui/icons-material/Tune";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import MemoryIcon from "@mui/icons-material/Memory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SpeedIcon from "@mui/icons-material/Speed";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CampaignIcon from "@mui/icons-material/Campaign";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import {
  metricTabFromHash,
  normalizeMetricHash,
} from "@/lib/metric-stream-tabs";
import { NAVIGATION_I18N } from "@/lib/navigation-i18n";
import type { LocalizableText } from "@/lib/locale/types";

export interface NavItem {
  id: string;
  label: LocalizableText;
  href: string;
  icon: SvgIconComponent;
  description?: LocalizableText;
  wbs?: string;
}

export interface NavGroup {
  id: string;
  label: LocalizableText;
  items: NavItem[];
}

const ICON_BY_ID: Record<string, SvgIconComponent> = {
  dashboard: PublicIcon,
  "data-pipeline": StorageIcon,
  "metric-stream-periodic": ScheduleIcon,
  "metric-stream-event": BoltIcon,
  "metric-stream-firmware": SystemUpdateAltIcon,
  "metric-stream-control": MemoryIcon,
  "equipment-logs": HistoryIcon,
  alarms: NotificationsIcon,
  "alarm-rules": TuneIcon,
  "remote-diagnosis": TroubleshootIcon,
  "remote-control": MemoryIcon,
  "service-tickets": WarningAmberIcon,
  "service-progress": AssignmentIcon,
  sla: SpeedIcon,
  equipment: Inventory2Icon,
  installation: LocationOnIcon,
  customers: PeopleIcon,
  "parts-orders": InventoryIcon,
  "parts-schedule": LocalShippingIcon,
  as: BuildIcon,
  inspection: BarChartIcon,
  reports: DescriptionIcon,
  "settings-notifications": CampaignIcon,
  "settings-firmware": SystemUpdateAltIcon,
  "admin-users": ManageAccountsIcon,
  "admin-codes": SettingsIcon,
  "admin-menus": ShieldIcon,
  "admin-iot-auth": VpnKeyIcon,
};

export const navigation: NavGroup[] = NAVIGATION_I18N.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.items.map((item) => ({
    ...item,
    icon: ICON_BY_ID[item.id] ?? PublicIcon,
  })),
}));

export function findNavItem(pathname: string, hash = ""): NavItem | undefined {
  const normalizedHash = normalizeMetricHash(hash);

  for (const group of navigation) {
    for (const item of group.items) {
      if (!item.href.includes("#")) continue;
      const [path, itemHash] = item.href.split("#");
      if (pathname === path && normalizedHash === normalizeMetricHash(itemHash)) {
        return item;
      }
    }
  }

  for (const group of navigation) {
    for (const item of group.items) {
      if (item.href.includes("#")) continue;
      if (item.href === pathname || pathname.startsWith(`${item.href}/`)) {
        if (pathname === "/metric-stream" && normalizedHash) {
          const tab = metricTabFromHash(normalizedHash);
          const hashItem = group.items.find((i) => i.id === tab.menuId);
          if (hashItem) return hashItem;
        }
        return item;
      }
    }
  }

  return undefined;
}

/** 사이드바 활성 상태 — hash 라우트 포함 */
export function isNavItemActive(pathname: string, hash: string, item: NavItem): boolean {
  const normalizedHash = normalizeMetricHash(hash);

  if (item.href.includes("#")) {
    const [path, itemHash] = item.href.split("#");
    return pathname === path && normalizedHash === normalizeMetricHash(itemHash);
  }

  return item.href === pathname || pathname.startsWith(`${item.href}/`);
}

/** metric-stream 서브 메뉴는 부모 권한 상속 */
export function resolveNavMenuId(menuId: string): string {
  if (menuId.startsWith("metric-stream-")) return "metric-stream";
  return menuId;
}
