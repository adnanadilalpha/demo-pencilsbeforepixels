"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore, type ReactNode } from "react";
import { HashSectionScroll } from "@/components/navigation/HashSectionScroll";
import { LENIS_OPTIONS, prefersNativeScroll } from "@/lib/motion";
import "lenis/dist/lenis.css";

function subscribeToSmoothScrollPreference() {
  return () => {};
}

function getSmoothScrollSnapshot() {
  return !prefersNativeScroll();
}

function getSmoothScrollServerSnapshot() {
  return false;
}

function HomeScrollContent({ children }: { children: ReactNode }) {
  return (
    <>
      <HashSectionScroll />
      {children}
    </>
  );
}

export function HomeScrollExperience({ children }: { children: ReactNode }) {
  const useSmoothScroll = useSyncExternalStore(
    subscribeToSmoothScrollPreference,
    getSmoothScrollSnapshot,
    getSmoothScrollServerSnapshot,
  );

  if (!useSmoothScroll) {
    return <HomeScrollContent>{children}</HomeScrollContent>;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <HomeScrollContent>{children}</HomeScrollContent>
    </ReactLenis>
  );
}
