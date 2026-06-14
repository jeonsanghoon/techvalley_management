"use client";

import { Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
import { DEVIAS_SIDE_NAV_WIDTH, SideNav } from "./SideNav";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { lg: "none" },
        "& .MuiDrawer-paper": {
          width: DEVIAS_SIDE_NAV_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ position: "relative", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, zIndex: 1, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
        <SideNav onNavigate={onClose} />
      </Box>
    </Drawer>
  );
}
