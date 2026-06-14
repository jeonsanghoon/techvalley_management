import { cookies } from "next/headers";
import type { PaletteMode } from "@mui/material";
import { COLOR_MODE_COOKIE, isPaletteMode } from "@/lib/color-mode";

export async function getServerColorMode(): Promise<PaletteMode> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COLOR_MODE_COOKIE)?.value;
  return isPaletteMode(fromCookie) ? fromCookie : "light";
}
