"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PeopleIcon from "@mui/icons-material/People";
import { useAuth } from "@/contexts/AuthContext";
import { MobileNav } from "./MobileNav";
import { UserPopover } from "./UserPopover";
import { NavClockWeather } from "@/components/layout/NavClockWeather";
import { NavLocaleSettings } from "@/components/layout/NavLocaleSettings";
import { ThemeModeToggle } from "@/components/layout/ThemeModeToggle";
import { useLocale } from "@/contexts/LocaleContext";

export function MainNav() {
  const { user } = useAuth();
  const { translate } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 48,
            px: { xs: 2, md: 3 },
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ display: { lg: "none" } }}>
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <NavLocaleSettings />
            <NavClockWeather />
            <ThemeModeToggle />
            <Tooltip title={translate("nav.customers")}>
              <IconButton
                component={Link}
                href="/customers"
                size="small"
                sx={{ display: { xs: "none", md: "inline-flex" } }}
              >
                <PeopleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("nav.alarms")}>
              <IconButton component={Link} href="/alarms" size="small">
                <Badge color="error" variant="dot" overlap="circular">
                  <NotificationsNoneIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              onClick={(e) => {
                setUserAnchorEl(e.currentTarget);
                setUserMenuOpen(true);
              }}
              sx={{
                width: 40,
                height: 40,
                cursor: "pointer",
                bgcolor: "primary.main",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0) ?? "?"}
            </Avatar>
          </Stack>
        </Stack>
      </Box>

      <UserPopover
        anchorEl={userAnchorEl}
        open={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
      />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
