"use client";

/**
 * Devias Kit Free 사이드바 스타일
 * @see https://github.com/devias-io/material-kit-react
 * 메뉴 데이터: @/lib/navigation (그룹·RBAC 유지)
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PhoneIcon from "@mui/icons-material/Phone";
import type { SvgIconComponent } from "@mui/icons-material";
import { Logo } from "@/components/devias/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { isNavItemActive, navigation, resolveNavMenuId } from "@/lib/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { localeLabel } from "@/lib/locale/types";
import { useLocationHash } from "@/hooks/useHashTab";
import { useRouteNavigation } from "@/contexts/RouteNavigationContext";
import { buildRouteKey } from "@/lib/route-key";

const SIDE_NAV_WIDTH = 280;

const NAV = {
  text: "#cdd7e1",
  textMuted: "#9fa6ad",
  textActive: "#ffffff",
  hoverBg: "rgba(255, 255, 255, 0.06)",
  activeBg: "#635bff",
  iconActive: "#ffffff",
} as const;

const NAV_ITEM_FONT = "0.8125rem";
const NAV_GROUP_FONT = "0.6875rem";

function NavItem({
  href,
  icon: Icon,
  title,
  active,
  onNavigate,
  currentPathname,
  currentRouteKey,
  resetRoute,
  markPendingHashNavigation,
}: {
  href: string;
  icon: SvgIconComponent;
  title: string;
  active: boolean;
  onNavigate?: () => void;
  currentPathname: string;
  currentRouteKey: string;
  resetRoute: () => void;
  markPendingHashNavigation: (targetRouteKey: string) => void;
}) {
  const textColor = active ? NAV.textActive : NAV.text;
  const iconColor = active ? NAV.iconActive : NAV.textMuted;
  const [hrefPath, hrefHash = ""] = href.split("#");
  const targetKey = buildRouteKey(hrefPath, hrefHash);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (targetKey === currentRouteKey) {
      event.preventDefault();
      resetRoute();
      return;
    }
    if (hrefPath === currentPathname && hrefHash) {
      markPendingHashNavigation(targetKey);
    }
  };

  return (
    <Tooltip title={title} placement="right" enterDelay={500}>
      <Box
        component={Link}
        href={href}
        onClick={handleClick}
        sx={{
          alignItems: "flex-start",
          borderRadius: 1,
          cursor: "pointer",
          display: "flex",
          gap: 0.75,
          minWidth: 0,
          p: "7px 12px",
          textDecoration: "none",
          bgcolor: active ? NAV.activeBg : "transparent",
          "&:hover": {
            bgcolor: active ? NAV.activeBg : NAV.hoverBg,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
            width: 20,
            mt: "1px",
          }}
        >
          <Icon sx={{ fontSize: 17, color: iconColor }} />
        </Box>
        <Typography
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: NAV_ITEM_FONT,
            fontWeight: active ? 600 : 500,
            lineHeight: 1.45,
            color: textColor,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "keep-all",
          }}
        >
          {title}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const currentRouteKey = buildRouteKey(pathname, hash);
  const { resetRoute, markPendingHashNavigation } = useRouteNavigation();
  const { can } = useAuth();
  const { language, translate } = useLocale();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const canViewItem = (menuId: string) => can(resolveNavMenuId(menuId), "view");
  const toggle = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: prev[id] === false }));
  };

  const isOpen = (id: string) => openGroups[id] !== false;

  return (
    <Box
      className="tv-side-nav"
      sx={{
        "--SideNav-background": "var(--mui-palette-neutral-950, #090a0b)",
        "--SideNav-color": "var(--mui-palette-common-white)",
        bgcolor: "var(--SideNav-background)",
        color: "var(--SideNav-color)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: SIDE_NAV_WIDTH,
        overflow: "hidden",
      }}
    >
      <Stack spacing={0.5} sx={{ px: 2, py: 1.5, flexShrink: 0, minWidth: 0, overflow: "visible" }}>
        <Logo color="light" height={44} layout="inline" href="/dashboard" />
        <Typography
          variant="caption"
          sx={{
            color: NAV.textMuted,
            fontWeight: 600,
            fontSize: "0.6875rem",
            lineHeight: 1.35,
            pl: 0.25,
          }}
        >
          {translate("nav.tagline")}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.18)" }} />

      <Box
        component="nav"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          p: 1.25,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navigation.map((group) => {
          const visibleItems = group.items.filter((item) => canViewItem(item.id));
          if (visibleItems.length === 0) return null;

          const expanded = isOpen(group.id);
          const hasActive = visibleItems.some((item) => isNavItemActive(pathname, hash, item));

          return (
            <List
              key={group.id}
              disablePadding
              sx={{ mb: 0.75, display: "block", position: "relative" }}
            >
              <ListItemButton
                onClick={() => toggle(group.id)}
                sx={{
                  py: 0.5,
                  px: 1,
                  minHeight: 32,
                  borderRadius: 1,
                  color: hasActive ? NAV.textActive : NAV.textMuted,
                  "&:hover": { bgcolor: NAV.hoverBg },
                }}
              >
                <ListItemText
                  primary={localeLabel(group.label, language)}
                  sx={{ minWidth: 0, mr: 0.5 }}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        fontSize: NAV_GROUP_FONT,
                        lineHeight: 1.35,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                />
                {expanded ? (
                  <ExpandLess sx={{ fontSize: 16, flexShrink: 0 }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 16, flexShrink: 0 }} />
                )}
              </ListItemButton>
              {expanded && (
                <List disablePadding component="ul" sx={{ mt: 0.25, pl: 0.5 }}>
                  {visibleItems.map((item) => (
                    <Box component="li" key={item.id} sx={{ minWidth: 0, display: "block" }}>
                      <NavItem
                        href={item.href}
                        icon={item.icon}
                        title={localeLabel(item.label, language)}
                        active={isNavItemActive(pathname, hash, item)}
                        onNavigate={onNavigate}
                        currentPathname={pathname}
                        currentRouteKey={currentRouteKey}
                        resetRoute={resetRoute}
                        markPendingHashNavigation={markPendingHashNavigation}
                      />
                    </Box>
                  ))}
                </List>
              )}
            </List>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.18)" }} />

      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: "rgba(240, 68, 56, 0.12)",
            border: "1px solid rgba(240, 68, 56, 0.28)",
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <PhoneIcon sx={{ fontSize: 15, color: "#fda29b", flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{ color: "#fda29b", fontWeight: 700, fontSize: "0.6875rem", lineHeight: 1.35 }}
            >
              {translate("nav.emgHotline")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: "#fff", fontWeight: 700, mt: 0.35, fontSize: "0.875rem", lineHeight: 1.35 }}
          >
            1588-0000
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export const DEVIAS_SIDE_NAV_WIDTH = SIDE_NAV_WIDTH;
