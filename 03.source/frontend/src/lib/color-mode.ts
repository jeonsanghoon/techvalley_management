import type { PaletteMode } from "@mui/material";

export const COLOR_MODE_STORAGE_KEY = "tv-color-mode";
export const COLOR_MODE_COOKIE = "tv-color-mode";

export function isPaletteMode(value: string | undefined | null): value is PaletteMode {
  return value === "light" || value === "dark";
}

function readModeFromCookie(): PaletteMode | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COLOR_MODE_COOKIE}=`));
    if (!match) return null;
    const value = match.slice(COLOR_MODE_COOKIE.length + 1);
    return isPaletteMode(value) ? value : null;
  } catch {
    return null;
  }
}

/** SSR cookie와 동일 우선순위: cookie → data-attribute → localStorage → 시스템 */
export function readModeFromDocument(): PaletteMode {
  if (typeof document === "undefined") return "light";

  const fromCookie = readModeFromCookie();
  if (fromCookie) return fromCookie;

  const attr = document.documentElement.getAttribute("data-color-mode");
  if (isPaletteMode(attr)) return attr;

  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (isPaletteMode(stored)) return stored;
  } catch {
    /* ignore */
  }

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/** React state · DOM · localStorage · cookie 동기화 (CSS 변수는 globals.css data-color-mode 규칙) */
export function applyModeToDocument(mode: PaletteMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-color-mode", mode);
  root.style.colorScheme = mode;

  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }

  try {
    document.cookie = `${COLOR_MODE_COOKIE}=${mode};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/** layout.tsx beforeInteractive — SSR cookie와 localStorage 동기화 */
export const COLOR_MODE_INIT_INLINE_SCRIPT = `(function(){try{var k='tv-color-mode';var r=document.documentElement;var cookieM=null;var parts=document.cookie.split(';');for(var i=0;i<parts.length;i++){var p=parts[i].trim();if(p.indexOf(k+'=')===0){cookieM=p.slice(k.length+1);break;}}var stored=null;try{stored=localStorage.getItem(k);}catch(e){}var mode=(cookieM==='dark'||cookieM==='light')?cookieM:(stored==='dark'||stored==='light')?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.setAttribute('data-color-mode',mode);r.style.colorScheme=mode;try{localStorage.setItem(k,mode);}catch(e){}document.cookie=k+'='+mode+';path=/;max-age=31536000;SameSite=Lax';}catch(e){}})();`;
