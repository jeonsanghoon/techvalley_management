/** 메뉴·hash 이동 시 페이지 remount 키 */
export function buildRouteKey(pathname: string, hash = ""): string {
  const normalizedHash = hash.replace(/^#/, "").trim().toLowerCase();
  return normalizedHash ? `${pathname}#${normalizedHash}` : pathname;
}

export const ROUTE_CHANGE_EVENT = "tv-route-change";

/** replaceState 등 hashchange 없이 hash만 바뀔 때 (탭 전환 — remount 없음) */
export const HASH_SYNC_EVENT = "tv-hash-sync";
