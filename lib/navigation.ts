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

export function getSectionElement(hash: string): HTMLElement | null {
  if (!hash || hash === "#") return null;

  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return null;

  const target = document.getElementById(id);
  return target instanceof HTMLElement ? target : null;
}

export function isSectionScrollAligned(hash: string): boolean {
  const target = getSectionElement(hash);
  if (!target) return false;

  const headerHeight = -getHeaderScrollOffset();
  const top = target.getBoundingClientRect().top;

  return Math.abs(top - headerHeight) < 48;
}

export function handleNavLinkClick(
  event: { preventDefault: () => void },
  href: string,
  pathname: string,
  lenis?: Lenis | null,
  onHashScroll?: (hash: string) => void,
  navigate?: (url: string) => void,
): boolean {
  const { path, hash } = parseNavHref(href);
  if (!hash) return false;

  const targetUrl = buildHashNavUrl(path, hash);

  if (pathname === path) {
    event.preventDefault();
    scheduleHashSectionScroll(hash, lenis);
    window.history.pushState(null, "", targetUrl);
    onHashScroll?.(hash);
    return true;
  }

  if (navigate) {
    event.preventDefault();
    navigate(targetUrl);
    return true;
  }

  return false;
}

export function scrollToSection(hash: string, lenis?: Lenis | null) {
  if (!hash || hash === "#") return false;

  const target = getSectionElement(hash);
  if (!target) return false;

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

const HASH_SCROLL_MAX_ATTEMPTS = 24;
const HASH_SCROLL_RETRY_MS = [0, 50, 100, 150, 200, 300, 400, 500, 650, 800, 1000, 1200];

/** Retry scroll until the section is aligned under the header (post client navigation / Lenis init). */
export function scheduleHashSectionScroll(
  hash: string,
  lenis?: Lenis | null,
): () => void {
  if (!hash || hash === "#") return () => {};

  let cancelled = false;
  let attempts = 0;
  let timer = 0;

  const tryScroll = () => {
    if (cancelled) return;

    if (!getSectionElement(hash)) {
      scheduleRetry();
      return;
    }

    scrollToSection(hash, lenis);

    if (isSectionScrollAligned(hash)) {
      return;
    }

    scheduleRetry();
  };

  const scheduleRetry = () => {
    attempts += 1;
    if (attempts >= HASH_SCROLL_MAX_ATTEMPTS) {
      return;
    }

    const delay =
      HASH_SCROLL_RETRY_MS[Math.min(attempts, HASH_SCROLL_RETRY_MS.length - 1)] ??
      150;
    timer = window.setTimeout(tryScroll, delay);
  };

  tryScroll();

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}

export function buildHashNavUrl(path: string, hash: string) {
  return `${path}${hash}`;
}
