"use client";

import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { scheduleHashSectionScroll } from "@/lib/navigation";

/**
 * Scrolls to homepage section hashes after client navigation (e.g. /research → /#opt-out).
 * Retries until the section sits under the fixed header — lower sections need layout/Lenis to settle.
 */
export function HashSectionScroll({ scrollReady }: { scrollReady: boolean }) {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (pathname !== "/" || !scrollReady) return;

    let cancelScroll = () => {};

    const scrollToCurrentHash = () => {
      cancelScroll();
      const hash = window.location.hash;
      if (!hash) return;
      cancelScroll = scheduleHashSectionScroll(hash, lenis);
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);
    window.addEventListener("load", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
      window.removeEventListener("load", scrollToCurrentHash);
      cancelScroll();
    };
  }, [pathname, lenis, scrollReady]);

  return null;
}
