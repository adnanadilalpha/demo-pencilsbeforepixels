"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "pbp.analytics.session";
const VIEW_KEY = "pbp.analytics.view";

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

async function trackPageView(path: string) {
  const response = await fetch("/api/analytics/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      path,
      pageTitle: document.title,
      referrer: document.referrer || null,
    }),
    keepalive: true,
  });

  if (!response.ok) return;

  const payload = (await response.json()) as { id?: string };
  if (payload.id) {
    sessionStorage.setItem(VIEW_KEY, payload.id);
  }
}

async function updateDuration(startedAt: number, isBounce: boolean) {
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
}

export function PageViewTracker() {
  const pathname = usePathname();
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const previousStartedAt = startedAtRef.current;
    const hasPreviousView = sessionStorage.getItem(VIEW_KEY);

    if (hasPreviousView) {
      void updateDuration(previousStartedAt, false);
    }

    startedAtRef.current = Date.now();
    void trackPageView(pathname);

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
