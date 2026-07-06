"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";
import { HashSectionScroll } from "@/components/navigation/HashSectionScroll";
import { LENIS_OPTIONS, prefersNativeScroll } from "@/lib/motion";
import "lenis/dist/lenis.css";

function HomeScrollContent({
  children,
  scrollReady,
}: {
  children: ReactNode;
  scrollReady: boolean;
}) {
  return (
    <>
      <HashSectionScroll scrollReady={scrollReady} />
      {children}
    </>
  );
}

export function HomeScrollExperience({ children }: { children: ReactNode }) {
  const [useSmoothScroll, setUseSmoothScroll] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);

  useEffect(() => {
    setUseSmoothScroll(!prefersNativeScroll());
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setScrollReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [useSmoothScroll]);

  if (!useSmoothScroll) {
    return (
      <HomeScrollContent scrollReady={scrollReady}>{children}</HomeScrollContent>
    );
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <HomeScrollContent scrollReady={scrollReady}>{children}</HomeScrollContent>
    </ReactLenis>
  );
}
