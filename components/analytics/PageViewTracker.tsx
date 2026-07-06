"use client";

import {
  getOrRefreshSession,
  PAGE_VIEW_DEDUPE_MS,
  touchSession,
} from "@/lib/analytics/client-session";
import { canTrackAnalytics } from "@/lib/analytics/track-client";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const VIEW_KEY = "pbp.analytics.view";
const LAST_TRACK_KEY = "pbp.analytics.last-track";

type LastTrack = {
  path: string;
  at: number;
};

function readLastTrack(): LastTrack | null {
  try {
    const raw = sessionStorage.getItem(LAST_TRACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastTrack;
    if (typeof parsed.path === "string" && typeof parsed.at === "number") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeLastTrack(track: LastTrack) {
  sessionStorage.setItem(LAST_TRACK_KEY, JSON.stringify(track));
}

function shouldSkipDuplicate(path: string, now: number) {
  const last = readLastTrack();
  return last?.path === path && now - last.at < PAGE_VIEW_DEDUPE_MS;
}

async function trackPageView(path: string) {
  if (!canTrackAnalytics()) return;

  const session = getOrRefreshSession();
  if (!session.id) return;

  const response = await fetch("/api/analytics/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      visitorId: session.visitorId || null,
      path,
      pageTitle: document.title,
      referrer: document.referrer || null,
    }),
    keepalive: true,
  });

  if (!response.ok) return;

  const payload = (await response.json()) as { id?: string; skipped?: boolean };
  if (payload.skipped) return;

  if (payload.id) {
    sessionStorage.setItem(VIEW_KEY, payload.id);
  }

  writeLastTrack({ path, at: Date.now() });
  touchSession();
}

async function updateDuration(startedAt: number, isBounce: boolean) {
  if (!canTrackAnalytics()) return;

  const viewId = sessionStorage.getItem(VIEW_KEY);
  if (!viewId) return;

  const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

  await fetch("/api/analytics/page-view", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      viewId,
      durationSeconds,
      isBounce,
    }),
    keepalive: true,
  });

  touchSession();
}

export function PageViewTracker() {
  const pathname = usePathname();
  const startedAtRef = useRef(Date.now());
  const trackingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || !canTrackAnalytics()) {
      return;
    }

    const path = normalizeAnalyticsPath(pathname);
    const now = Date.now();

    if (shouldSkipDuplicate(path, now)) {
      return;
    }

    if (trackingRef.current === path) {
      return;
    }
    trackingRef.current = path;

    const previousStartedAt = startedAtRef.current;
    const hasPreviousView = sessionStorage.getItem(VIEW_KEY);

    if (hasPreviousView) {
      void updateDuration(previousStartedAt, false);
    }

    startedAtRef.current = now;
    void trackPageView(path).finally(() => {
      if (trackingRef.current === path) {
        trackingRef.current = null;
      }
    });

    const handlePageHide = () => {
      void updateDuration(startedAtRef.current, true);
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname]);

  return null;
}
