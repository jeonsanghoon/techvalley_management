"use client";

import Link from "next/link";
import {
  Box,
  Divider,
  ListItemIcon,
  MenuItem,
  MenuList,
  Popover,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeAppRole } from "@/lib/locale/domain-labels";

export function UserPopover({
  anchorEl,
  open,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const { translate, language } = useLocale();

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      marginThreshold={16}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      slotProps={{
        paper: {
          sx: {
            width: 240,
            maxHeight: "calc(100dvh - 80px)",
            overflow: "auto",
            borderRadius: 2,
            mt: 1,
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {user?.name ?? "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user ? `${localizeAppRole(user.appRole, language)} · ${user.region}` : ""}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: 1 }}>
        <MenuItem component={Link} href="/admin/users" onClick={onClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {translate("user.profile")}
        </MenuItem>
        <MenuItem
          component={Link}
          href="/login"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {translate("user.logout")}
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
