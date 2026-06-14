"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PaletteMode } from "@mui/material";
import { applyModeToDocument, readModeFromDocument } from "@/lib/color-mode";
type ColorModeContextValue = {
  mode: PaletteMode;
  /** SSR과 첫 클라이언트 렌더를 맞춘 값 (하이드레이션 게이트용) */
  ssrMode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function ColorModeProvider({
  children,
  initialMode = "light",
}: {
  children: ReactNode;
  initialMode?: PaletteMode;
}) {
  const [mode, setModeState] = useState<PaletteMode>(initialMode);
  const [hydrated, setHydrated] = useState(false);
  /** inline script · cookie와 1회 동기화 + DOM 속성 즉시 반영 */
  useLayoutEffect(() => {
    const resolved = readModeFromDocument();
    applyModeToDocument(resolved);
    setModeState(resolved);
    setHydrated(true);
  }, []);

  /** 모드 변경 시 paint 전 DOM·CSS 규칙 동기화 */
  useLayoutEffect(() => {
    if (!hydrated) return;
    applyModeToDocument(mode);
    window.dispatchEvent(new CustomEvent("tv-color-mode-change", { detail: { mode } }));
  }, [mode, hydrated]);

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      ssrMode: initialMode,
      toggleMode,
      setMode,
    }),
    [mode, initialMode, toggleMode, setMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
