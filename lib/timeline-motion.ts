const SCROLL_VIEWPORTS_PER_SLIDE = 1.28;
/** Ignore minor mobile browser chrome height jitter without freezing layout forever. */
const VIEWPORT_HEIGHT_STICKY_THRESHOLD = 80;

type SlideMotion = {
  opacity: number;
  textY: number;
  textX: number;
  imageScale: number;
  imageX: number;
  imageY: number;
};

type TimelineMetrics = {
  totalHeight: number;
  scrollDistance: number;
  viewportHeight: number;
};

export function getViewportHeight() {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

export function resolveViewportHeight(
  previousHeight: number | null,
  options?: { stabilize?: boolean },
): number {
  const measured = getViewportHeight();
  const fallback =
    previousHeight ??
    (typeof window !== "undefined" ? window.innerHeight : 0) ??
    800;
  const next = measured > 0 ? measured : fallback;

  if (
    options?.stabilize &&
    previousHeight &&
    previousHeight > 0 &&
    Math.abs(next - previousHeight) < VIEWPORT_HEIGHT_STICKY_THRESHOLD
  ) {
    return previousHeight;
  }

  return next;
}

export function getTimelineMetrics(
  slideCount: number,
  viewportHeight: number,
): TimelineMetrics {
  const totalHeight = slideCount * SCROLL_VIEWPORTS_PER_SLIDE * viewportHeight;
  const scrollDistance = Math.max(totalHeight - viewportHeight, 1);

  return { totalHeight, scrollDistance, viewportHeight };
}

type TimelinePinState = {
  position: "relative" | "fixed" | "absolute";
  top: number;
};

export function getTimelinePinState(
  scrollY: number,
  pinStart: number,
  scrollDistance: number,
): TimelinePinState {
  const pinEnd = pinStart + scrollDistance;

  if (scrollY < pinStart) {
    return { position: "relative", top: 0 };
  }

  if (scrollY >= pinEnd) {
    return { position: "absolute", top: scrollDistance };
  }

  return { position: "fixed", top: 0 };
}

export function getTimelineProgress(
  scrollY: number,
  pinStart: number,
  scrollDistance: number,
) {
  return Math.min(1, Math.max(0, (scrollY - pinStart) / scrollDistance));
}

export function getSlideMotion(
  slideFloatIndex: number,
  slideIndex: number,
): SlideMotion {
  const delta = slideFloatIndex - slideIndex;
  const abs = Math.abs(delta);

  const opacity = Math.max(0, 1 - abs * 1.2);
  const textY = delta * -52;
  const textX = delta * 28;
  const imageScale = 1.1 - abs * 0.07;
  const imageX = delta * 36;
  const imageY = abs * 16;

  return { opacity, textY, textX, imageScale, imageX, imageY };
}

export function getDotProximity(slideFloatIndex: number, dotIndex: number) {
  const distance = Math.abs(slideFloatIndex - dotIndex);
  return Math.max(0, 1 - distance);
}
