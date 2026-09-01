import { getOrRefreshSession } from "@/lib/analytics/client-session";
import {
  isClientLocalAnalyticsEnabled,
  isLocalHostname,
} from "@/lib/analytics/env";
import type { AnalyticsEventName } from "@/lib/analytics/event-types";
import { sendGoogleAnalyticsEvent } from "@/lib/analytics/google";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";

/** Mirrors server-side shouldRecordAnalytics gating. */
export function canTrackAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return false;

  if (isClientLocalAnalyticsEnabled()) {
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    return false;
  }

  return !isLocalHostname(window.location.hostname);
}

export async function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: {
    label?: string;
    path?: string;
    metadata?: Record<string, string>;
  } = {},
) {
  if (!canTrackAnalytics()) return;

  const session = getOrRefreshSession();

  const path = normalizeAnalyticsPath(
    options.path ?? window.location.pathname,
  );

  sendGoogleAnalyticsEvent(eventName, {
    label: options.label,
    path,
    metadata: options.metadata,
  });

  await fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      visitorId: session.visitorId,
      eventName,
      eventLabel: options.label ?? null,
      path,
      metadata: options.metadata ?? {},
    }),
    keepalive: true,
  }).catch(() => {
    // analytics should never block UX
  });
}
