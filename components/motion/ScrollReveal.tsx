"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";
import {
  HOME_SECTION_REVEAL_EVENT,
  type HomeSectionRevealDetail,
} from "@/lib/navigation";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  offset?: number;
};

function isRevealInView(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight * 0.94);
  const visibleHeight = visibleBottom - visibleTop;

  return visibleHeight / Math.max(rect.height, 1) >= 0.12;
}

export function ScrollReveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  offset = 28,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) reveal();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);

    const onHomeSectionReveal = (event: Event) => {
      const { sectionId } = (event as CustomEvent<HomeSectionRevealDetail>)
        .detail;
      const section = document.getElementById(sectionId);
      if (section?.contains(element)) reveal();
    };

    window.addEventListener(HOME_SECTION_REVEAL_EVENT, onHomeSectionReveal);

    requestAnimationFrame(() => {
      if (isRevealInView(element)) reveal();
    });

    return () => {
      observer.disconnect();
      window.removeEventListener(
        HOME_SECTION_REVEAL_EVENT,
        onHomeSectionReveal,
      );
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        "scroll-reveal transition-[opacity,transform] duration-[1150ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
        visible ? "scroll-reveal-visible" : "scroll-reveal-hidden",
        className,
      )}
      style={{
        transitionDelay: `${delay}s`,
        ["--scroll-reveal-offset" as string]: `${offset}px`,
      }}
    >
      {children}
    </Tag>
  );
}
