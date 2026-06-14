"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const POPUP_WIDTH = 560;

export function HintPopover({
  children,
  title = "안내",
  iconSize = "small",
}: {
  children: React.ReactNode;
  title?: string;
  iconSize?: "small" | "medium";
}) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const open = Boolean(anchor);

  const position = useMemo(() => {
    if (!open || !anchor || typeof window === "undefined") {
      return { top: 0, left: 0 };
    }
    const rect = anchor.getBoundingClientRect();
    const margin = 16;
    const width = Math.min(POPUP_WIDTH, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin, rect.right - width),
      window.innerWidth - width - margin,
    );
    return { top: rect.bottom + 8, left, width };
  }, [open, anchor, layoutTick]);

  const bumpLayout = useCallback(() => setLayoutTick((n) => n + 1), []);

  useEffect(() => {
    if (!open) return;
    bumpLayout();
  }, [open, anchor, bumpLayout]);

  useEffect(() => {
    if (!open) return;
    const handleReposition = () => bumpLayout();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, bumpLayout]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!active) return;
      const target = event.target as Node | null;
      if (anchor?.contains(target)) return;
      const panel = document.getElementById("tv-hint-popover-panel");
      if (panel?.contains(target)) return;
      setAnchor(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === "Escape") setAnchor(null);
    };

    document.addEventListener("keydown", handleEscape);
    const attachId = window.setTimeout(() => {
      if (!active) return;
      document.addEventListener("click", handleOutsideClick, true);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(attachId);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, anchor]);

  return (
    <>
      <IconButton
        size={iconSize}
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(open ? null : e.currentTarget);
        }}
        aria-label={title}
        aria-expanded={open}
        sx={{ color: "text.secondary", p: 0.25, ml: -0.25, flexShrink: 0 }}
      >
        <InfoOutlinedIcon fontSize={iconSize} />
      </IconButton>

      {typeof document !== "undefined" &&
        open &&
        anchor &&
        createPortal(
          <Box
            id="tv-hint-popover-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "min(70vh, 520px)",
              overflowY: "auto",
              overflowX: "hidden",
              zIndex: theme.zIndex.modal + 12,
              bgcolor: "background.paper",
              color: "text.primary",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              p: 2,
              boxSizing: "border-box",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700 }}>
              {title}
            </Typography>
            <Box sx={{ typography: "body2", color: "text.secondary", overflow: "visible" }}>{children}</Box>
          </Box>,
          document.body,
        )}
    </>
  );
}

/** 상단 우측에 안내 아이콘만 배치 */
export function PageHints({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5, alignItems: "center" }}>
      {children}
    </Box>
  );
}
