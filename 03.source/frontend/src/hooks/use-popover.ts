"use client";

import { useCallback, useRef, useState } from "react";

export function usePopover<T extends HTMLElement>() {
  const anchorRef = useRef<T>(null);
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setAnchorEl(anchorRef.current);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) setAnchorEl(anchorRef.current);
      return next;
    });
  }, []);

  return { anchorRef, anchorEl, open, handleOpen, handleClose, handleToggle };
}
