"use client";

import { useCallback, useSyncExternalStore } from "react";

const LG_MIN_WIDTH_PX = 1024;

function createMediaQueryList(query: string) {
  return window.matchMedia(query);
}

/** True when viewport is below the `lg` breakpoint (< 1024px). SSR-safe: false until hydrated. */
export function useBelowLg() {
  const query = `(max-width: ${LG_MIN_WIDTH_PX - 1}px)`;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = createMediaQueryList(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => createMediaQueryList(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function isBelowLgViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < LG_MIN_WIDTH_PX;
}
