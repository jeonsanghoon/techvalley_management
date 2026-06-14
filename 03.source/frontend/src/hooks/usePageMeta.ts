"use client";

import { usePathname } from "next/navigation";
import { useLocationHash } from "@/hooks/useHashTab";
import { findNavItem, navigation } from "@/lib/navigation";

export function usePageMeta() {
  const pathname = usePathname();
  const hash = useLocationHash();
  const item = findNavItem(pathname, hash);
  const group = navigation.find((g) => g.items.some((i) => i.id === item?.id));

  return {
    pathname,
    item,
    group,
    title: item?.label ?? "IoT 서비스",
    description: item?.description,
    wbs: item?.wbs,
    breadcrumbs: group
      ? [
          { label: group.label },
          { label: item?.label ?? pathname },
        ]
      : undefined,
  };
}
