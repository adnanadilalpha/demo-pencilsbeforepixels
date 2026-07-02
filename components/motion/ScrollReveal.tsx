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

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  offset?: number;
};

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
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
