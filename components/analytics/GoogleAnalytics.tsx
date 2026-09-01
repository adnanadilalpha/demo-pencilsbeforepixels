"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import {
  canUseGoogleAnalytics,
  configureGoogleAnalytics,
  GA_MEASUREMENT_ID,
} from "@/lib/analytics/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Loads GA4 on public routes and applies gtag config on each navigation. */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const enabled =
    mounted &&
    Boolean(pathname) &&
    !pathname.startsWith("/admin") &&
    canUseGoogleAnalytics();

  useEffect(() => {
    if (!enabled) return;
    configureGoogleAnalytics(GA_MEASUREMENT_ID);
  }, [enabled, pathname]);

  if (!enabled) return null;

  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
