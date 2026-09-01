import { capPageViewDuration } from "@/lib/analytics/duration";

/** Tracks visible (foreground) time for the current page segment. */
export class VisibleTimer {
  private accumulatedMs = 0;
  private visibleSince: number | null =
    typeof document !== "undefined" && document.visibilityState === "visible"
      ? Date.now()
      : null;

  reset() {
    this.accumulatedMs = 0;
    this.visibleSince =
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? Date.now()
        : null;
  }

  onVisible() {
    if (this.visibleSince === null) {
      this.visibleSince = Date.now();
    }
  }

  onHidden() {
    this.pause();
  }

  pause() {
    const now = Date.now();
    if (this.visibleSince !== null) {
      this.accumulatedMs += now - this.visibleSince;
      this.visibleSince = null;
    }
  }

  /** Returns visible seconds for the current segment and resets the segment timer. */
  captureSegmentSeconds(): number {
    this.pause();
    const seconds = Math.round(this.accumulatedMs / 1000);
    this.accumulatedMs = 0;
    this.visibleSince =
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? Date.now()
        : null;
    return capPageViewDuration(seconds);
  }
}
