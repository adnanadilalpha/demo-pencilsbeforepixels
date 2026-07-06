"use client";

import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { prefersNativeScroll } from "@/lib/motion";
import {
  SECTION_SCROLL_STORAGE_KEY,
  scrollToHomeSection,
} from "@/lib/navigation";

/** One effect: if another page sent us a section target, scroll there once. */
export function HashSectionScroll() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (pathname !== "/") return;

    const pendingId = sessionStorage.getItem(SECTION_SCROLL_STORAGE_KEY);
    if (!pendingId) return;

    const expectsLenis = !prefersNativeScroll();
    if (expectsLenis && !lenis) return;

    sessionStorage.removeItem(SECTION_SCROLL_STORAGE_KEY);

    // Wait for layout + Lenis dimensions before jumping to the section top.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToHomeSection(pendingId, lenis);
      });
    });
  }, [pathname, lenis]);

  return null;
}
