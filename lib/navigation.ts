import type Lenis from "lenis";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  getAnchorScrollDuration,
  prefersReducedMotion,
  smoothScrollEasing,
} from "@/lib/motion";

export const HEADER_SCROLL_OFFSET = -90;
export const SECTION_SCROLL_STORAGE_KEY = "pbp:section-scroll-target";
export const HOME_SECTION_REVEAL_EVENT = "pbp:reveal-home-section";

export type HomeSectionRevealDetail = {
  sectionId: string;
};

export function revealHomeSectionContent(sectionId: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<HomeSectionRevealDetail>(HOME_SECTION_REVEAL_EVENT, {
      detail: { sectionId },
    }),
  );
}

export function getHeaderScrollOffset() {
  if (typeof window === "undefined") return HEADER_SCROLL_OFFSET;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const px = parseFloat(raw);

  return Number.isFinite(px) ? -px : HEADER_SCROLL_OFFSET;
}

export function resolveNavHref(href: string, pathname: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return `/${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  if (pathname !== "/") return `/${trimmed}`;
  return trimmed;
}

export function parseNavHref(href: string): { path: string; hash: string | null } {
  const trimmed = href.trim();
  const hashIndex = trimmed.indexOf("#");
  if (hashIndex === -1) {
    return { path: trimmed || "/", hash: null };
  }

  const path = trimmed.slice(0, hashIndex) || "/";
  const hashBody = trimmed.slice(hashIndex + 1).split("#")[0];
  const hash = hashBody ? `#${hashBody}` : null;

  return { path: path === "" ? "/" : path, hash };
}

export function hashToSectionId(hash: string) {
  return hash.replace(/^#/, "").split("#")[0];
}

export function getSectionElement(hash: string): HTMLElement | null {
  if (!hash || hash === "#") return null;

  const id = decodeURIComponent(hash.replace(/^#/, "").split("#")[0]);
  if (!id) return null;

  const target = document.getElementById(id);
  return target instanceof HTMLElement ? target : null;
}

function getSectionScrollTop(element: HTMLElement, offset: number) {
  return Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY + offset,
  );
}

/** Scroll to a homepage section by id — single code path for cross-page arrival. */
export function scrollToHomeSection(
  sectionId: string,
  lenis?: Lenis | null,
): boolean {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  const offset = getHeaderScrollOffset();
  const scrollTop = getSectionScrollTop(target, offset);

  if (lenis) {
    lenis.resize();
    lenis.scrollTo(scrollTop, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: scrollTop, left: 0, behavior: "auto" });
  }

  window.history.replaceState(null, "", `/#${sectionId}`);
  requestAnimationFrame(() => {
    revealHomeSectionContent(sectionId);
  });
  return true;
}

export function scrollToSectionSmooth(
  hash: string,
  lenis?: Lenis | null,
): boolean {
  const target = getSectionElement(hash);
  if (!target) return false;

  const offset = getHeaderScrollOffset();

  if (prefersReducedMotion()) {
    return scrollToHomeSection(hashToSectionId(hash), lenis);
  }

  if (lenis) {
    const distance = Math.abs(
      target.getBoundingClientRect().top + window.scrollY + offset - lenis.scroll,
    );
    lenis.scrollTo(target, {
      offset,
      duration: getAnchorScrollDuration(distance),
      easing: smoothScrollEasing,
    });
    return true;
  }

  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY + offset,
  );
  window.scrollTo({ top, behavior: "smooth" });
  return true;
}

/** Cross-page: remember section, go home without hash, scroll once on arrival. */
export function navigateToHomeSection(
  sectionId: string,
  router: Pick<AppRouterInstance, "push">,
) {
  sessionStorage.setItem(SECTION_SCROLL_STORAGE_KEY, sectionId);
  router.push("/", { scroll: false });
}

export function handleNavLinkClick(
  event: { preventDefault: () => void },
  href: string,
  pathname: string,
  lenis?: Lenis | null,
  onHashScroll?: (hash: string) => void,
  router?: Pick<AppRouterInstance, "push">,
): boolean {
  const { path, hash } = parseNavHref(href);
  if (!hash) return false;

  const sectionId = hashToSectionId(hash);
  const targetUrl = buildHashNavUrl(path, hash);

  event.preventDefault();

  if (pathname === path) {
    scrollToSectionSmooth(hash, lenis);
    window.history.pushState(null, "", targetUrl);
    onHashScroll?.(hash);
    return true;
  }

  if (router) {
    navigateToHomeSection(sectionId, router);
    return true;
  }

  return false;
}

export function buildHashNavUrl(path: string, hash: string) {
  const normalizedPath = path.split("#")[0] || "/";
  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;
  return `${normalizedPath}${normalizedHash}`;
}

export function normalizeBrowserHashUrl() {
  if (typeof window === "undefined") return;

  const { pathname, hash } = window.location;
  if (!hash) return;

  const segments = hash.split("#").filter(Boolean);
  if (segments.length <= 1) return;

  window.history.replaceState(null, "", buildHashNavUrl(pathname, `#${segments[0]}`));
}
