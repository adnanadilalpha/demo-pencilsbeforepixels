"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";
import { LENIS_OPTIONS, prefersNativeScroll } from "@/lib/motion";
import "lenis/dist/lenis.css";

export function HomeScrollExperience({ children }: { children: ReactNode }) {
  const [useSmoothScroll, setUseSmoothScroll] = useState(false);

  useEffect(() => {
    setUseSmoothScroll(!prefersNativeScroll());
  }, []);

  if (!useSmoothScroll) {
    return children;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
