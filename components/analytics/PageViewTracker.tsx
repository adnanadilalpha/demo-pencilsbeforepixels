"use client";

import {
  appendViewDuration,
  getSessionPathCount,
  getSessionViewId,
  getViewDurationTotal,
  rememberSessionPath,
  setSessionViewId,
} from "@/lib/analytics/session-analytics-storage";
import {
  getOrRefreshSession,
  touchSession,
} from "@/lib/analytics/client-session";
import { canTrackAnalytics } from "@/lib/analytics/track-client";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";
import { VisibleTimer } from "@/lib/analytics/visible-timer";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const VIEW_KEY = "pbp.analytics.view";
const HEARTBEAT_MS = 15_000;

async function patchPageView(
  viewId: string,
  options: { durationSeconds?: number; isBounce?: boolean } = {},
) {
  await fetch("/api/analytics/page-view", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      viewId,
      durationSeconds: options.durationSeconds,
      isBounce: options.isBounce,
    }),
    keepalive: true,
  });

  touchSession();
}

async function trackPageView(path: string, sessionId: string) {
  if (!canTrackAnalytics()) return null;

  const response = await fetch("/api/analytics/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      visitorId: getOrRefreshSession().visitorId || null,
      path,
      pageTitle: document.title,
      referrer: document.referrer || null,
    }),
    keepalive: true,
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    id?: string;
    skipped?: boolean;
    deduped?: boolean;
  };

  if (payload.skipped || !payload.id) return null;

  try {
    sessionStorage.setItem(VIEW_KEY, payload.id);
  } catch {
    // ignore blocked storage
  }

  setSessionViewId(sessionId, path, payload.id);
  rememberSessionPath(sessionId, path);
  touchSession();
  return payload.id;
}

function readCurrentViewId(): string | null {
  try {
    return sessionStorage.getItem(VIEW_KEY);
  } catch {
    return null;
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const trackingRef = useRef<string | null>(null);
  const timerRef = useRef(new VisibleTimer());

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || !canTrackAnalytics()) {
      return;
    }

    const path = normalizeAnalyticsPath(pathname);

    if (trackingRef.current === path) {
      return;
    }
    trackingRef.current = path;

    const session = getOrRefreshSession();

    const flushDuration = async (
      viewId: string,
      options: { isBounce?: boolean; includeSegment?: boolean } = {},
    ) => {
      const includeSegment = options.includeSegment ?? true;
      let total = 0;

      if (includeSegment) {
        const segment = timerRef.current.captureSegmentSeconds();
        total = appendViewDuration(viewId, segment);
      } else {
        total = getViewDurationTotal(viewId);
      }

      if (total <= 0 && options.isBounce === undefined) return;

      await patchPageView(viewId, {
        durationSeconds: total > 0 ? total : undefined,
        isBounce: options.isBounce,
      });
    };

    const existingViewId = getSessionViewId(session.id, path);
    const previousViewId = readCurrentViewId();

    if (previousViewId && previousViewId !== existingViewId) {
      void flushDuration(previousViewId, { isBounce: false });
    }

    timerRef.current.reset();

    if (existingViewId) {
      try {
        sessionStorage.setItem(VIEW_KEY, existingViewId);
      } catch {
        // ignore blocked storage
      }
      rememberSessionPath(session.id, path);
      void patchPageView(existingViewId, { isBounce: false }).finally(() => {
        if (trackingRef.current === path) {
          trackingRef.current = null;
        }
      });
    } else {
      void trackPageView(path, session.id).finally(() => {
        if (trackingRef.current === path) {
          trackingRef.current = null;
        }
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        timerRef.current.onVisible();
        return;
      }

      timerRef.current.onHidden();
      const viewId = readCurrentViewId();
      if (!viewId) return;
      void flushDuration(viewId);
    };

    const handlePageHide = () => {
      const viewId = readCurrentViewId();
      if (!viewId) return;

      void flushDuration(viewId, {
        isBounce: getSessionPathCount(session.id) <= 1,
      });
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        timerRef.current.reset();
      }
    };

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;

      const viewId = readCurrentViewId();
      if (!viewId) return;

      void flushDuration(viewId);
    }, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname]);

  return null;
}
