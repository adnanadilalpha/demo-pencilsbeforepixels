"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { ContentImage } from "@/components/ui/ContentImage";
import {
  RICH_TEXT_LINKS_LIGHT_CLASS,
  stripRichTextToPlain,
} from "@/lib/cms/rich-text";
import { sectionPaddingX } from "@/components/ui/Container";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { normalizeMissionTimeline } from "@/lib/cms/mission-slides";
import { useSiteContent } from "@/lib/cms/hooks";
import type { TimelineSlide } from "@/lib/cms/types";
import { prefersReducedMotion, prefersNativeScroll } from "@/lib/motion";
import {
  getDotProximity,
  getSlideMotion,
  getTimelineMetrics,
  getTimelinePinState,
  getTimelineProgress,
  resolveViewportHeight,
} from "@/lib/timeline-motion";
import { isValidMediaSrc } from "@/lib/media/src";
import { getSectionElement, scrollToSectionSmooth } from "@/lib/navigation";

function getAbsoluteTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY;
}

function getPaginationColors(slide: TimelineSlide | undefined) {
  if (!slide?.background) {
    return {
      track: "bg-navy-800/15",
      fill: "bg-gold-500",
      active: "bg-gold-500",
      inactive: "bg-black/35",
      label: "text-navy-800",
      muted: "text-navy-800/55",
    };
  }

  const isGoldBackground = slide.background.includes("gold");

  if (isGoldBackground) {
    return {
      track: "bg-navy-800/20",
      fill: "bg-navy-800",
      active: "bg-navy-800",
      inactive: "bg-navy-800/35",
      label: "text-navy-800",
      muted: "text-navy-800/55",
    };
  }

  if (slide.textColor === "dark") {
    return {
      track: "bg-navy-800/15",
      fill: "bg-gold-500",
      active: "bg-gold-500",
      inactive: "bg-black/35",
      label: "text-navy-800",
      muted: "text-navy-800/55",
    };
  }

  return {
    track: "bg-white/20",
    fill: "bg-gold-500",
    active: "bg-gold-500",
    inactive: "bg-white/45",
    label: "text-slate-50",
    muted: "text-slate-50/55",
  };
}

function setMotionVars(
  element: HTMLElement | null,
  motion: ReturnType<typeof getSlideMotion>,
) {
  if (!element) return;

  element.style.setProperty("--timeline-copy-opacity", String(motion.opacity));
  element.style.setProperty("--timeline-copy-x", `${motion.textX}px`);
  element.style.setProperty("--timeline-copy-y", `${motion.textY}px`);
}

function setMediaVars(
  element: HTMLElement | null,
  motion: ReturnType<typeof getSlideMotion>,
) {
  if (!element) return;

  element.style.setProperty("--timeline-media-x", `${motion.imageX}px`);
  element.style.setProperty("--timeline-media-y", `${motion.imageY}px`);
  element.style.setProperty("--timeline-media-scale", String(motion.imageScale));
}

function TimelineSlideMedia({
  slide,
  index,
  mediaRef,
}: {
  slide: TimelineSlide;
  index: number;
  mediaRef: (node: HTMLDivElement | null) => void;
}) {
  const isLight = slide.textColor === "light";
  const hasImage = isValidMediaSrc(slide.image);

  return (
    <div
      ref={mediaRef}
      className={`timeline-slide-media relative w-full shrink-0 overflow-hidden rounded-sm shadow-[0_28px_90px_rgba(10,22,40,0.22)] h-[min(30dvh,210px)] sm:h-[min(34dvh,240px)] lg:h-[min(72vh,560px)] lg:max-w-none lg:flex-1 ${
        isLight ? "ring-1 ring-white/15" : "ring-1 ring-navy-800/10"
      }`}
    >
      {hasImage ? (
        <ContentImage
          src={slide.image}
          alt={stripRichTextToPlain(slide.title) || `Mission slide ${index + 1}`}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 42vw"
          priority={index === 0}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${
            isLight ? "bg-white/10 text-slate-200/70" : "bg-navy-800/5 text-navy-800/45"
          }`}
          aria-hidden
        >
          <span className="text-sm font-medium">Image coming soon</span>
        </div>
      )}
    </div>
  );
}

function applyPaginationTheme(
  index: number,
  slides: TimelineSlide[],
  refs: {
    missionLabel: HTMLParagraphElement | null;
    dots: (HTMLSpanElement | null)[];
  },
) {
  const colors = getPaginationColors(slides[index] ?? slides[0]);
  const mutedClass = `font-sans text-xs font-medium uppercase tracking-[0.14em] max-lg:leading-tight lg:text-base lg:tracking-[0.24em] ${colors.muted}`;
  const dotBase =
    "h-[0.375rem] w-[0.375rem] rounded-full transition-[background-color] duration-500";

  if (refs.missionLabel) refs.missionLabel.className = mutedClass;

  refs.dots.forEach((dot, dotIndex) => {
    if (!dot) return;
    dot.className = `${dotBase} ${
      dotIndex === index ? colors.active : colors.inactive
    }`;
  });
}

export function TimelineSection() {
  const { timeline: rawTimelineSlides } = useSiteContent();
  const timelineSlides = normalizeMissionTimeline(rawTimelineSlides);
  const slideCount = timelineSlides.length;
  const maxIndex = Math.max(0, slideCount - 1);
  const slideShare = slideCount > 0 ? 100 / slideCount : 100;
  const timelineSignature = timelineSlides
    .map((slide) => `${slide.number}:${slide.background}:${slide.image}`)
    .join("|");

  const wrapperRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const missionLabelRef = useRef<HTMLParagraphElement>(null);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineSlidesRef = useRef(timelineSlides);
  const slideCountRef = useRef(slideCount);
  const maxIndexRef = useRef(maxIndex);
  const slideShareRef = useRef(slideShare);
  const paginationIndexRef = useRef(-1);

  const sectionTopRef = useRef(0);
  const metricsRef = useRef({
    scrollDistance: 0,
    wrapperHeight: 0,
    viewportHeight: 0,
  });
  const progressRef = useRef(0);
  const activeIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const lenisScrollRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  const viewportHeightRef = useRef(0);
  const lastMeasureWidthRef = useRef<number | null>(null);
  const pendingScrollYRef = useRef<number | undefined>(undefined);
  const isMobileLayoutRef = useRef(false);

  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  const resetPinnedStyles = useCallback(() => {
    const pin = pinRef.current;
    const track = trackRef.current;

    if (pin) {
      pin.style.position = "";
      pin.style.top = "";
      pin.style.left = "";
      pin.style.right = "";
      pin.style.width = "";
      pin.style.height = "";
      pin.style.zIndex = "";
    }

    if (track) {
      track.style.transform = "";
      track.style.willChange = "";
    }

    for (let index = 0; index < copyRefs.current.length; index += 1) {
      setMotionVars(copyRefs.current[index], {
        opacity: 1,
        textY: 0,
        textX: 0,
        imageScale: 1,
        imageX: 0,
        imageY: 0,
      });
      setMediaVars(mediaRefs.current[index], {
        opacity: 1,
        textY: 0,
        textX: 0,
        imageScale: 1,
        imageX: 0,
        imageY: 0,
      });
    }
  }, []);

  timelineSlidesRef.current = timelineSlides;
  slideCountRef.current = slideCount;
  maxIndexRef.current = maxIndex;
  slideShareRef.current = slideShare;

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    sectionTopRef.current = getAbsoluteTop(wrapper);

    const width = window.innerWidth;
    const widthChanged =
      lastMeasureWidthRef.current !== null &&
      lastMeasureWidthRef.current !== width;
    const viewportHeight = resolveViewportHeight(viewportHeightRef.current, {
      stabilize: prefersNativeScroll() && !widthChanged,
    });

    viewportHeightRef.current = viewportHeight;
    lastMeasureWidthRef.current = width;
    const mobile = width < 1024;
    isMobileLayoutRef.current = mobile;
    setIsMobileLayout(mobile);

    if (mobile) {
      metricsRef.current = {
        scrollDistance: 0,
        wrapperHeight: 0,
        viewportHeight,
      };
      setWrapperHeight(0);
      resetPinnedStyles();
      return;
    }

    const { totalHeight, scrollDistance } = getTimelineMetrics(
      slideCount,
      viewportHeight,
    );

    metricsRef.current = {
      scrollDistance,
      wrapperHeight: totalHeight,
      viewportHeight,
    };
    setWrapperHeight(totalHeight);
  }, [resetPinnedStyles, slideCount]);

  const applyPinStyles = useCallback((scrollY: number) => {
    const pin = pinRef.current;
    const { scrollDistance, viewportHeight } = metricsRef.current;
    if (!pin || scrollDistance <= 0 || viewportHeight <= 0) {
      if (pin) {
        pin.style.position = "relative";
        pin.style.top = "0";
        pin.style.left = "";
        pin.style.right = "";
        pin.style.width = "";
        pin.style.height = "";
        pin.style.zIndex = "";
      }
      return;
    }

    const pinState = getTimelinePinState(
      scrollY,
      sectionTopRef.current,
      scrollDistance,
    );

    pin.style.position = pinState.position;
    pin.style.top = `${pinState.top}px`;
    pin.style.left = pinState.position === "fixed" ? "0" : "0";
    pin.style.right = pinState.position === "fixed" ? "0" : "";
    pin.style.width = "100%";
    pin.style.height = `${viewportHeight}px`;
    pin.style.zIndex = pinState.position === "fixed" ? "20" : "";
  }, []);

  const applyFrame = useCallback((scrollY: number) => {
    if (isMobileLayoutRef.current) {
      resetPinnedStyles();
      return;
    }

    const track = trackRef.current;
    const { scrollDistance } = metricsRef.current;
    const currentMaxIndex = maxIndexRef.current;
    const currentSlideShare = slideShareRef.current;
    const currentSlideCount = slideCountRef.current;

    if (scrollDistance <= 0 || !track || currentSlideCount <= 0) return;

    const wrapper = wrapperRef.current;
    if (wrapper) {
      sectionTopRef.current = getAbsoluteTop(wrapper);
    }

    applyPinStyles(scrollY);

    const pinStart = sectionTopRef.current;
    const progress = getTimelineProgress(scrollY, pinStart, scrollDistance);
    const slideFloat = progress * currentMaxIndex;
    const translatePercent = progress * currentMaxIndex * currentSlideShare;

    progressRef.current = progress;
    track.style.transform = `translate3d(-${translatePercent}%, 0, 0)`;

    const roundedIndex = Math.min(
      currentMaxIndex,
      Math.max(0, Math.round(slideFloat)),
    );

    // The label sits at the viewport's left edge, which stays over the current
    // slide until the next one has fully scrolled in. Switch its theme on that
    // boundary (floor) so the color doesn't flip early at the midpoint.
    const themeIndex = Math.min(
      currentMaxIndex,
      Math.max(0, Math.floor(slideFloat + 1e-6)),
    );

    activeIndexRef.current = roundedIndex;

    if (paginationIndexRef.current !== themeIndex) {
      paginationIndexRef.current = themeIndex;
      applyPaginationTheme(themeIndex, timelineSlidesRef.current, {
        missionLabel: missionLabelRef.current,
        dots: dotRefs.current,
      });
    }

    const useMotion = !reducedMotionRef.current && !isMobileLayoutRef.current;

    for (let index = 0; index < currentSlideCount; index += 1) {
      const motion = useMotion
        ? getSlideMotion(slideFloat, index)
        : {
            opacity: index === roundedIndex ? 1 : isMobileLayoutRef.current ? 0 : 0.35,
            textY: 0,
            textX: 0,
            imageScale: 1,
            imageX: 0,
            imageY: 0,
          };

      setMotionVars(copyRefs.current[index], motion);
      setMediaVars(mediaRefs.current[index], motion);

      const dot = dotRefs.current[index];
      if (!dot) continue;

      const proximity = getDotProximity(slideFloat, index);
      const scale = 1 + proximity * 0.55;
      const opacity = 0.35 + proximity * 0.65;

      dot.style.opacity = String(opacity);
      dot.style.transform = `scale(${scale})`;
      dot.style.width = proximity > 0.72 ? "1.25rem" : "0.375rem";
      dot.style.height = proximity > 0.72 ? "0.375rem" : "0.375rem";
    }
  }, [applyPinStyles, resetPinnedStyles]);

  const syncProgress = useCallback(
    (scrollY = window.scrollY) => {
      applyFrame(scrollY);
    },
    [applyFrame],
  );

  const scheduleSync = useCallback(
    (scrollY?: number) => {
      pendingScrollYRef.current = scrollY;

      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncProgress(
          pendingScrollYRef.current ?? lenisScrollRef.current ?? window.scrollY,
        );
      });
    },
    [syncProgress],
  );

  useLayoutEffect(() => {
    copyRefs.current.length = slideCount;
    mediaRefs.current.length = slideCount;
    dotRefs.current.length = slideCount;

    reducedMotionRef.current = prefersReducedMotion();
    measure();

    if (isMobileLayoutRef.current) {
      resetPinnedStyles();
      return;
    }

    const clampedIndex = Math.min(activeIndexRef.current, maxIndex);
    activeIndexRef.current = clampedIndex;
    paginationIndexRef.current = -1;

    syncProgress(lenisScrollRef.current || window.scrollY);
    applyPaginationTheme(clampedIndex, timelineSlidesRef.current, {
      missionLabel: missionLabelRef.current,
      dots: dotRefs.current,
    });
    paginationIndexRef.current = clampedIndex;
  }, [
    measure,
    maxIndex,
    resetPinnedStyles,
    slideCount,
    syncProgress,
    timelineSignature,
  ]);

  useEffect(() => {
    if (isMobileLayout) {
      resetPinnedStyles();

      const onResize = () => {
        measure();
      };

      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    const remeasure = () => {
      if (isMobileLayoutRef.current) return;
      measure();
      scheduleSync(lenisScrollRef.current || window.scrollY);
    };

    const onScroll = () => {
      scheduleSync(lenisScrollRef.current || window.scrollY);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        remeasure();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    window.visualViewport?.addEventListener("resize", remeasure);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("app:scroll-lock-change", remeasure);

    const wrapper = wrapperRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && wrapper) {
      resizeObserver = new ResizeObserver(remeasure);
      resizeObserver.observe(wrapper);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
      window.visualViewport?.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("app:scroll-lock-change", remeasure);
      resizeObserver?.disconnect();

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      resetPinnedStyles();
    };
  }, [isMobileLayout, measure, resetPinnedStyles, scheduleSync]);

  useLenis((lenis) => {
    if (isMobileLayoutRef.current) return;
    lenisRef.current = lenis;
    lenisScrollRef.current = lenis.scroll;
    scheduleSync(lenis.scroll);
  }, [scheduleSync]);

  useEffect(() => {
    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = getSectionElement(hash);
      const wrapper = wrapperRef.current;
      if (!(target instanceof HTMLElement) || !wrapper) return;

      const { scrollDistance } = metricsRef.current;
      if (scrollDistance <= 0) return;

      const pinStart = sectionTopRef.current;
      const pinEnd = pinStart + scrollDistance;
      const current = lenisRef.current?.scroll ?? window.scrollY;
      const isInsidePin = current >= pinStart && current <= pinEnd;

      if (!isInsidePin) return;

      event.preventDefault();
      scrollToSectionSmooth(hash, lenisRef.current);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, []);

  if (slideCount <= 0) {
    return null;
  }

  return (
    <section
      id="mission"
      ref={wrapperRef}
      className="relative isolate w-full max-w-full overflow-x-clip"
      style={!isMobileLayout && wrapperHeight > 0 ? { height: wrapperHeight } : undefined}
      aria-label="Our mission"
    >
      <div
        ref={pinRef}
        className={isMobileLayout ? "relative w-full" : "w-full touch-pan-y overflow-hidden"}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 z-20 ${sectionPaddingX} ${
            isMobileLayout
              ? "top-[calc(var(--header-height)+0.375rem)]"
              : "top-[calc(var(--header-height)+1.5rem)] sm:top-[calc(var(--header-height)+2rem)] lg:top-[calc(var(--header-height)+2.5rem)]"
          }`}
        >
          <p
            ref={missionLabelRef}
            className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-navy-800/55 max-lg:leading-tight lg:text-base lg:tracking-[0.24em]"
          >
            Our Journey
          </p>
        </div>

        <div
          ref={trackRef}
          className={isMobileLayout ? "flex w-full flex-col" : "flex h-full will-change-transform"}
          style={
            isMobileLayout
              ? undefined
              : { width: `${slideCount * 100}%` }
          }
        >
          {timelineSlides.map((slide, index) => {
            const isLight = slide.textColor === "light";

            return (
              <article
                key={`${index}-${slide.number}`}
                className={`min-h-0 shrink-0 ${
                  isMobileLayout
                    ? `flex flex-col gap-5 ${sectionPaddingX} ${
                        index === 0
                          ? "pb-10 pt-[calc(var(--header-height)+1.5rem)] sm:pb-12"
                          : "py-10 sm:py-12"
                      } sm:gap-6 ${
                        index < slideCount - 1 ? "border-b border-navy-800/8" : ""
                      }`
                    : `h-full max-lg:grid max-lg:grid-rows-[minmax(0,1fr)_auto] max-lg:gap-4 max-lg:pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))] max-lg:pt-[calc(var(--header-height)+4rem)] sm:max-lg:pt-[calc(var(--header-height)+4.75rem)] lg:flex lg:flex-row lg:items-center lg:gap-12 lg:py-0 ${sectionPaddingX}`
                } ${isLight ? RICH_TEXT_LINKS_LIGHT_CLASS : ""}`}
                style={{
                  width: isMobileLayout ? "100%" : `${slideShare}%`,
                  backgroundColor: slide.background,
                }}
              >
                <div
                  ref={(node) => {
                    copyRefs.current[index] = node;
                  }}
                  className={`timeline-slide-copy flex w-full flex-col gap-2.5 ${
                    isMobileLayout
                      ? ""
                      : "min-h-0 justify-center max-lg:justify-start max-lg:overflow-y-auto max-lg:overscroll-y-contain max-lg:pr-1 lg:flex-1 lg:gap-6"
                  } ${
                    slide.indentContent
                      ? isMobileLayout
                        ? "sm:pl-4"
                        : "pl-0 max-lg:pl-0 sm:pl-6 lg:pl-32"
                      : ""
                  }`}
                >
                  <p
                    className={`text-fluid-timeline-number font-sans font-bold leading-none max-lg:text-[2.5rem] lg:text-[96px] ${
                      isLight ? "text-slate-50/70" : "text-hero-dark"
                    }`}
                  >
                    {slide.number}
                  </p>
                  <h2
                    className={`text-fluid-display-lg font-display leading-[1.05] max-lg:text-[clamp(1.75rem,7vw,2.35rem)] lg:leading-display lg:text-[56px] ${
                      isLight ? "text-slate-50" : "text-hero-dark"
                    }`}
                  >
                    <RichTextContent
                      content={slide.title}
                      inline
                      linkTone={isLight ? "light" : "default"}
                    />
                  </h2>
                  <RichTextContent
                    content={slide.description}
                    linkTone={isLight ? "light" : "default"}
                    className={`max-w-xl text-[0.95rem] leading-[1.5] sm:text-base max-lg:max-w-none lg:text-2xl lg:leading-[1.4] ${
                      isLight ? "text-slate-200" : "text-hero-dark"
                    }`}
                  />
                </div>

                <TimelineSlideMedia
                  slide={slide}
                  index={index}
                  mediaRef={(node) => {
                    mediaRefs.current[index] = node;
                  }}
                />
              </article>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-linear-to-r from-black/10 to-transparent sm:w-24 lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-linear-to-l from-black/10 to-transparent sm:w-24 lg:block"
          aria-hidden
        />

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-end gap-2.5 max-lg:bottom-5 sm:bottom-8 ${sectionPaddingX} ${
            isMobileLayout ? "hidden" : ""
          }`}
          aria-hidden
        >
          {timelineSlides.map((slide, index) => (
            <span
              key={`${index}-${slide.number}`}
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
              className="h-[0.375rem] w-[0.375rem] rounded-full bg-black/35 transition-[background-color] duration-500"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
