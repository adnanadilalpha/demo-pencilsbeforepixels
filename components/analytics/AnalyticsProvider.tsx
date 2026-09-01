"use client";

import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

/** Mounts first-party analytics and Google Analytics 4 on public routes. */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <GoogleAnalytics />
      <PageViewTracker />
    </>
  );
}
