import type Lenis from "lenis";
import {
  getAnchorScrollDuration,
  prefersReducedMotion,
  smoothScrollEasing,
} from "@/lib/motion";

export const HEADER_SCROLL_OFFSET = -90;

export function getHeaderScrollOffset() {
  if (typeof window === "undefined") return HEADER_SCROLL_OFFSET;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const px = parseFloat(raw);

  return Number.isFinite(px) ? -px : HEADER_SCROLL_OFFSET;
}

export function resolveNavHref(href: string, pathname: string) {
  if (href.startsWith("/")) return href;
  if (pathname !== "/") return `/${href}`;
  return href;
}

export function scrollToSection(hash: string, lenis?: Lenis | null) {
  if (!hash || hash === "#") return false;

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return false;

  if (lenis) {
    const current = lenis.scroll;
    const offset = getHeaderScrollOffset();
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY + offset;
    const distance = targetTop - current;

    lenis.scrollTo(target, {
      offset,
      duration: prefersReducedMotion() ? 0 : getAnchorScrollDuration(distance),
      easing: smoothScrollEasing,
    });
    return true;
  }

  const offset = getHeaderScrollOffset();
  const top =
    target.getBoundingClientRect().top + window.scrollY + offset;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });

  return true;
}
