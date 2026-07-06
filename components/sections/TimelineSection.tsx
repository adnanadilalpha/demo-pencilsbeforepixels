"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { ContentImage } from "@/components/ui/ContentImage";
import {
  RICH_TEXT_LINKS_LIGHT_CLASS,
  stripRichTextToPlain,
  isRichTextHtml,
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
import { getSectionElement, scrollToSection } from "@/lib/navigation";

const MISSION_GOAL_EMPHASIS =
  "focus over distraction and cognitive friction over swiping.";

function MissionSlideDescription({
  description,
  className,
  linkTone = "default",
}: {
  description: string;
  className?: string;
  linkTone?: "default" | "light";
}) {
  if (isRichTextHtml(description)) {
    return (
      <RichTextContent
        content={description}
        className={className}
        inline
        linkTone={linkTone}
      />
    );
  }

  const index = description.indexOf(MISSION_GOAL_EMPHASIS);
  if (index === -1) {
    return <>{description}</>;
  }

  return (
    <>
      {description.slice(0, index)}
      <strong className="font-bold italic">{MISSION_GOAL_EMPHASIS}</strong>
      {description.slice(index + MISSION_GOAL_EMPHASIS.length)}
    </>
  );
}

function getAbsoluteTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY;
}

function getPaginationColors(slide: TimelineSlide) {
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

export function TimelineSection() {
  const { timeline: rawTimelineSlides } = useSiteContent();
  const timelineSlides = normalizeMissionTimeline(rawTimelineSlides);
  const slideCount = timelineSlides.length;
  const maxIndex = Math.max(0, slideCount - 1);
  const slideShare = slideCount > 0 ? 100 / slideCount : 100;

  const wrapperRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const paginationColors = getPaginationColors(
    timelineSlides[activeIndex] ?? timelineSlides[0]!,
  );

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
  }, [slideCount]);

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
    const wrapper = wrapperRef.current;
    const { scrollDistance } = metricsRef.current;
    if (scrollDistance <= 0 || !trackRef.current) return;

    if (wrapper) {
      sectionTopRef.current = getAbsoluteTop(wrapper);
    }

    applyPinStyles(scrollY);

    const pinStart = sectionTopRef.current;
    const progress = getTimelineProgress(scrollY, pinStart, scrollDistance);
    const slideFloat = progress * maxIndex;
    const translatePercent = progress * maxIndex * slideShare;

    progressRef.current = progress;
    trackRef.current.style.transform = `translate3d(-${translatePercent}%, 0, 0)`;

    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${progress})`;
    }

    const roundedIndex = Math.min(
      maxIndex,
      Math.max(0, Math.round(slideFloat)),
    );

    if (roundedIndex !== activeIndexRef.current) {
      activeIndexRef.current = roundedIndex;
      setActiveIndex(roundedIndex);
    }

    const useMotion = !reducedMotionRef.current;

    timelineSlides.forEach((_, index) => {
      const motion = useMotion
        ? getSlideMotion(slideFloat, index)
        : {
            opacity: index === roundedIndex ? 1 : 0.35,
            textY: 0,
            textX: 0,
            imageScale: 1,
            imageX: 0,
            imageY: 0,
          };

      setMotionVars(copyRefs.current[index], motion);
      setMediaVars(mediaRefs.current[index], motion);

      const dot = dotRefs.current[index];
      if (!dot) return;

      const proximity = getDotProximity(slideFloat, index);
      const scale = 1 + proximity * 0.55;
      const opacity = 0.35 + proximity * 0.65;

      dot.style.opacity = String(opacity);
      dot.style.transform = `scale(${scale})`;
      dot.style.width = proximity > 0.72 ? "1.25rem" : "0.375rem";
      dot.style.height = proximity > 0.72 ? "0.375rem" : "0.375rem";
    });
  }, [applyPinStyles, maxIndex, slideShare, timelineSlides]);

  const syncProgress = useCallback(
    (scrollY = window.scrollY) => {
      applyFrame(scrollY);
    },
    [applyFrame],
  );

  const scheduleSync = useCallback(
    (scrollY?: number) => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncProgress(scrollY);
      });
    },
    [syncProgress],
  );

  useLayoutEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();
    measure();
    syncProgress();
  }, [measure, syncProgress]);

  useEffect(() => {
    const remeasure = () => {
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
    window.visualViewport?.addEventListener("scroll", remeasure);
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
      window.visualViewport?.removeEventListener("scroll", remeasure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("app:scroll-lock-change", remeasure);
      resizeObserver?.disconnect();

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      const pin = pinRef.current;
      if (pin) {
        pin.style.position = "";
        pin.style.top = "";
        pin.style.left = "";
        pin.style.right = "";
        pin.style.width = "";
        pin.style.height = "";
        pin.style.zIndex = "";
      }
    };
  }, [measure, scheduleSync]);

  useLenis((lenis) => {
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
      scrollToSection(hash, lenisRef.current);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, []);

  return (
    <section
      id="mission"
      ref={wrapperRef}
      className="relative isolate w-full max-w-full overflow-x-clip"
      style={wrapperHeight > 0 ? { height: wrapperHeight } : undefined}
      aria-label="Our mission"
    >
      <div
        ref={pinRef}
        className="w-full touch-pan-y overflow-hidden"
      >
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{
            width: `${slideCount * 100}%`,
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {timelineSlides.map((slide, index) => {
            const isLight = slide.textColor === "light";

            return (
              <article
                key={slide.number}
                className={`flex h-full min-h-0 shrink-0 flex-col items-center gap-5 py-8 max-lg:justify-center max-lg:gap-6 max-lg:py-10 lg:flex-row lg:gap-12 lg:py-0 ${sectionPaddingX} ${
                  isLight ? RICH_TEXT_LINKS_LIGHT_CLASS : ""
                }`}
                style={{
                  width: `${slideShare}%`,
                  backgroundColor: slide.background,
                }}
              >
                <div
                  ref={(node) => {
                    copyRefs.current[index] = node;
                  }}
                  className={`timeline-slide-copy flex min-h-0 w-full flex-1 flex-col justify-center gap-3 max-lg:max-w-xl max-lg:gap-4 lg:gap-6 ${
                    slide.indentContent ? "pl-4 max-lg:pl-5 sm:pl-6 lg:pl-32" : ""
                  }`}
                >
                  <p
                    className={`text-fluid-timeline-number font-sans font-bold leading-none lg:text-[96px] ${
                      isLight ? "text-slate-50/70" : "text-hero-dark"
                    }`}
                  >
                    {slide.number}
                  </p>
                  <h2
                    className={`text-fluid-display-lg font-display leading-display lg:text-[56px] ${
                      isLight ? "text-slate-50" : "text-hero-dark"
                    }`}
                  >
                    <RichTextContent
                      content={slide.title}
                      inline
                      linkTone={isLight ? "light" : "default"}
                    />
                  </h2>
                  <p
                    className={`max-w-xl text-base leading-[1.55] max-lg:leading-[1.5] lg:text-2xl lg:leading-[1.4] ${
                      isLight ? "text-slate-200" : "text-hero-dark"
                    }`}
                  >
                    <MissionSlideDescription
                      description={slide.description}
                      linkTone={isLight ? "light" : "default"}
                    />
                  </p>
                </div>

                <div
                  ref={(node) => {
                    mediaRefs.current[index] = node;
                  }}
                  className={`timeline-slide-media relative h-[min(38vh,280px)] w-full max-w-xl shrink-0 overflow-hidden rounded-sm shadow-[0_28px_90px_rgba(10,22,40,0.22)] sm:h-[min(42vh,320px)] lg:h-[min(72vh,560px)] lg:max-w-none lg:flex-1 ${
                    isLight ? "ring-1 ring-white/15" : "ring-1 ring-navy-800/10"
                  }`}
                >
                  <ContentImage
                    src={slide.image}
                    alt={stripRichTextToPlain(slide.title)}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 50vw, 42vw"
                    priority={slide.number === "01"}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div
          className={`pointer-events-none absolute inset-x-0 top-20 z-20 max-lg:top-16 sm:top-24 ${sectionPaddingX}`}
          aria-hidden
        >
          <p
            className={`font-sans text-sm font-medium uppercase tracking-[0.18em] max-lg:tracking-[0.14em] lg:text-base lg:tracking-[0.24em] ${paginationColors.muted}`}
          >
            Our Mission
          </p>
          <div
            className={`mt-4 h-px w-full overflow-hidden ${paginationColors.track}`}
          >
            <div
              ref={progressFillRef}
              className={`h-full origin-left ${paginationColors.fill}`}
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-black/10 to-transparent sm:w-24"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-black/10 to-transparent sm:w-24"
          aria-hidden
        />

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-end gap-2.5 max-lg:bottom-5 sm:bottom-8 ${sectionPaddingX}`}
          aria-hidden
        >
          {timelineSlides.map((slide, index) => (
            <span
              key={slide.number}
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
              className={`rounded-full transition-[background-color] duration-500 ${
                index === activeIndex
                  ? paginationColors.active
                  : paginationColors.inactive
              }`}
              style={{
                width: index === 0 ? "1.25rem" : "0.375rem",
                height: "0.375rem",
                opacity: index === 0 ? 1 : 0.35,
                transform: index === 0 ? "scale(1)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
