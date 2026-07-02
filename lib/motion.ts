import type { LenisOptions } from "lenis";


export function smoothScrollEasing(t: number) {
  return Math.min(1, 1.001 - 2 ** (-10 * t));
}

export function getAnchorScrollDuration(distancePx: number) {
  const viewport =
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 800;

  return Math.min(3, Math.max(1.6, (Math.abs(distancePx) / viewport) * 1.55));
}

export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.085,
  duration: 1.15,
  smoothWheel: true,
  wheelMultiplier: 0.92,
  touchMultiplier: 1,
  autoRaf: true,
  allowNestedScroll: true,
  overscroll: false,
  syncTouch: false,
};

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Touch devices use native scroll — Lenis causes iOS rubber-band jitter at page end. */
export function prefersNativeScroll() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(pointer: coarse)").matches;
}
