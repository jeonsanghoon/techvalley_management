"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouteNavigation } from "@/contexts/RouteNavigationContext";

type PageActionsContextValue = {
  actions: ReactNode;
  registerActions: (ownerId: string, node: ReactNode) => void;
  unregisterActions: (ownerId: string) => void;
};

const PageActionsContext = createContext<PageActionsContextValue | null>(null);

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const { routeMountKey } = useRouteNavigation();
  const [actions, setActionsState] = useState<ReactNode>(null);
  const activeOwnerRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    activeOwnerRef.current = null;
    setActionsState(null);
  }, [routeMountKey]);

  const registerActions = useCallback((ownerId: string, node: ReactNode) => {
    activeOwnerRef.current = ownerId;
    setActionsState(node);
  }, []);

  const unregisterActions = useCallback((ownerId: string) => {
    if (activeOwnerRef.current === ownerId) {
      activeOwnerRef.current = null;
      setActionsState(null);
    }
  }, []);

  const value = useMemo(
    () => ({ actions, registerActions, unregisterActions }),
    [actions, registerActions, unregisterActions],
  );

  return <PageActionsContext.Provider value={value}>{children}</PageActionsContext.Provider>;
}

export function usePageActions() {
  const ctx = useContext(PageActionsContext);
  if (!ctx) {
    throw new Error("usePageActions must be used within PageActionsProvider");
  }
  return ctx;
}
