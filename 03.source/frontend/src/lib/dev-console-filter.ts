/** 개발 환경 서드파티 trial/deprecation 로그 — Next 오류 오버레이·터미널 [browser] 노이즈 억제 */
export function isDevConsoleNoise(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  if (
    t.includes("AG Grid and AG Charts Enterprise License") ||
    t.includes("License Key Not Found") ||
    t.includes("ag-grid.com for a trial license key") ||
    t.includes("All AG Grid and AG Charts Enterprise features are unlocked") ||
    t.includes("google.maps.Marker is deprecated") ||
    t.includes("There has been an Error with loading Google Maps API script") ||
    t.includes("injectScript error:") ||
    t.includes("ERR_BLOCKED_BY_CLIENT") ||
    t.includes("net::ERR_BLOCKED_BY_CLIENT") ||
    t.includes('Element with name "gmp-internal-')
  ) {
    return true;
  }

  // AG Grid license banner padding lines (asterisks only)
  if (/^\*+$/.test(t) && t.length >= 20) return true;

  // Padded license lines: "* message *"
  if (t.startsWith("*") && t.endsWith("*") && t.includes("ag-grid")) return true;

  return false;
}

export function installDevConsoleNoiseFilter() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;

  const marker = "__tv_dev_console_filter__";
  if ((window as unknown as Record<string, boolean>)[marker]) return;
  (window as unknown as Record<string, boolean>)[marker] = true;

  const wrap =
    (native: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const text = args.map((a) => String(a)).join(" ");
      if (isDevConsoleNoise(text)) return;
      native(...args);
    };

  console.error = wrap(console.error.bind(console));
  console.warn = wrap(console.warn.bind(console));
}

/** layout.tsx 인라인 스크립트 — React 번들 로드 전 실행 */
export const DEV_CONSOLE_FILTER_INLINE_SCRIPT = `(function(){try{var M='__tv_dev_console_filter__';if(window[M])return;window[M]=true;function noise(t){t=t.trim();if(!t)return false;if(t.indexOf('AG Grid and AG Charts Enterprise License')>=0||t.indexOf('License Key Not Found')>=0||t.indexOf('ag-grid.com for a trial license key')>=0||t.indexOf('All AG Grid and AG Charts Enterprise features are unlocked')>=0||t.indexOf('google.maps.Marker is deprecated')>=0||t.indexOf('There has been an Error with loading Google Maps API script')>=0||t.indexOf('injectScript error:')>=0||t.indexOf('ERR_BLOCKED_BY_CLIENT')>=0||t.indexOf('net::ERR_BLOCKED_BY_CLIENT')>=0||t.indexOf('Element with name \\"gmp-internal-')>=0)return true;if(/^\\*+$/.test(t)&&t.length>=20)return true;if(t.charAt(0)==='*'&&t.charAt(t.length-1)==='*'&&(t.indexOf('ag-grid')>=0||t.indexOf('AG Grid')>=0))return true;return false;}function w(f){return function(){var t=Array.prototype.map.call(arguments,String).join(' ');if(noise(t))return;return f.apply(console,arguments);};}console.error=w(console.error.bind(console));console.warn=w(console.warn.bind(console));}catch(e){}})();`;
