"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HASH_SYNC_EVENT } from "@/lib/route-key";

function readWindowHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash;
}

/** 현재 URL hash — pathname·hashchange·내부 탭 동기화 즉시 반영 */
export function useLocationHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState(readWindowHash);

  useLayoutEffect(() => {
    const sync = () => setHash(readWindowHash());

    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener(HASH_SYNC_EVENT, sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(HASH_SYNC_EVENT, sync);
    };
  }, [pathname]);

  return hash;
}

type HashTabOption<T extends string> = {
  id: T;
  hash: string;
};

/** URL hash(#)와 동기화되는 탭 상태 */
export function useHashTab<T extends string>(
  basePath: string,
  tabs: readonly HashTabOption<T>[],
  defaultTab: T,
) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const [tab, setTabState] = useState<T>(defaultTab);

  const readHash = useCallback((): T => {
    if (typeof window === "undefined") return defaultTab;
    const normalized = window.location.hash.replace(/^#/, "").trim().toLowerCase();
    const found = tabs.find((item) => item.hash.toLowerCase() === normalized);
    return found?.id ?? defaultTab;
  }, [tabs, defaultTab]);

  useLayoutEffect(() => {
    if (pathname !== basePath) return;
    setTabState(readHash());
  }, [pathname, basePath, readHash, hash]);

  const setTab = useCallback(
    (next: T) => {
      const target = tabs.find((item) => item.id === next);
      if (!target || pathname !== basePath) return;
      const url = `${basePath}#${target.hash}`;
      window.history.replaceState(null, "", url);
      window.dispatchEvent(new Event(HASH_SYNC_EVENT));
      setTabState(next);
    },
    [tabs, basePath, pathname],
  );

  return { tab, setTab };
}
