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

export function parseNavHref(href: string): { path: string; hash: string | null } {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return { path: href || "/", hash: null };
  }

  const path = href.slice(0, hashIndex) || "/";
  const hash = href.slice(hashIndex);

  return { path: path === "" ? "/" : path, hash };
}

export function handleNavLinkClick(
  event: { preventDefault: () => void },
  href: string,
  pathname: string,
  lenis?: Lenis | null,
  onHashScroll?: (hash: string) => void,
): boolean {
  const { path, hash } = parseNavHref(href);
  if (!hash) return false;

  if (pathname !== path) return false;

  event.preventDefault();
  scrollToSection(hash, lenis);
  window.history.pushState(null, "", path === "/" ? hash : `${path}${hash}`);
  onHashScroll?.(hash);
  return true;
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
