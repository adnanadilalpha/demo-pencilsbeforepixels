"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HorizontalScrollRowProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /** Resets scroll position when the active set changes (e.g. category tab). */
  resetKey?: string | number;
  fadeFromClassName?: string;
  ariaLabel?: string;
};

export function HorizontalScrollRow({
  children,
  className,
  trackClassName,
  resetKey,
  fadeFromClassName = "from-paper-200",
  ariaLabel = "Scrollable content",
}: HorizontalScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, resetKey, children]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollTo({ left: 0, behavior: "auto" });
    updateScrollState();
  }, [resetKey, updateScrollState]);

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const distance = Math.max(track.clientWidth * 0.85, 220);
    track.scrollBy({
      left: direction * distance,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const showControls = canScrollLeft || canScrollRight;

  return (
    <div className={cn("relative", className)}>
      {showControls ? (
        <div className="mb-3 flex items-center justify-end gap-2">
          <ScrollButton
            direction="prev"
            disabled={!canScrollLeft}
            onClick={() => scrollByPage(-1)}
          />
          <ScrollButton
            direction="next"
            disabled={!canScrollRight}
            onClick={() => scrollByPage(1)}
          />
        </div>
      ) : null}

      <div className="relative">
        {canScrollLeft ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-1 w-10 bg-linear-to-r to-transparent sm:w-14",
              fadeFromClassName,
            )}
            aria-hidden
          />
        ) : null}
        {canScrollRight ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-1 w-10 bg-linear-to-l to-transparent sm:w-14",
              fadeFromClassName,
            )}
            aria-hidden
          />
        ) : null}

        <div
          ref={trackRef}
          className={cn("timeline-snap-track", trackClassName)}
          aria-label={ariaLabel}
          data-lenis-prevent
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label =
    direction === "prev" ? "Scroll resources left" : "Scroll resources right";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-navy-800/15 bg-white text-navy-800 shadow-sm transition-colors",
        "hover:border-navy-800/25 hover:bg-paper-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      <Icon className="size-4" strokeWidth={2} aria-hidden />
    </button>
  );
}
