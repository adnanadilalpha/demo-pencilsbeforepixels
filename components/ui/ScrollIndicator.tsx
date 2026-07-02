"use client";

import { ChevronDown } from "lucide-react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion, smoothScrollEasing } from "@/lib/motion";

export function ScrollIndicator() {
  const lenis = useLenis();

  const handleClick = () => {
    const target = window.innerHeight * 0.9;

    if (lenis) {
      lenis.scrollTo(target, {
        duration: prefersReducedMotion() ? 0 : 1.35,
        easing: smoothScrollEasing,
      });
      return;
    }

    window.scrollTo({
      top: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to the next section"
      className="group absolute bottom-10 right-16 z-10 hidden flex-col items-center gap-2.5 md:flex max-lg:bottom-[clamp(1.5rem,4vw,2.5rem)] max-lg:right-(--space-section-x)"
    >
      <span className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/75 transition-colors duration-300 group-hover:text-white">
        Scroll
      </span>

      <span
        className="relative h-10 w-px overflow-hidden rounded-full bg-white/25"
        aria-hidden
      >
        <span className="absolute inset-x-0 top-0 h-full w-full animate-scroll-line bg-linear-to-b from-transparent via-white to-transparent" />
      </span>

      <ChevronDown
        className="size-4 text-white/70 animate-scroll-chevron"
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  );
}
