"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { AnalyticsEventName } from "@/lib/analytics/event-types";
import { isClientLocalAnalyticsEnabled, isLocalHostname } from "@/lib/analytics/env";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-1QJDY336ND";

type GtagParams = Record<string, string | number | boolean | undefined>;

/** Mirrors first-party rules: public site only; skip localhost unless opted in. */
export function canUseGoogleAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  if (isLocalHostname(window.location.hostname) && !isClientLocalAnalyticsEnabled()) {
    return false;
  }
  return Boolean(GA_MEASUREMENT_ID);
}

/** GA4 recommended / custom event mapping for existing first-party events. */
export function toGoogleAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: {
    label?: string;
    path?: string;
    metadata?: Record<string, string>;
  } = {},
): { name: string; params: GtagParams } {
  const path = options.path;
  const label = options.label;
  const metadata = options.metadata ?? {};

  switch (eventName) {
    case "newsletter_subscribe":
      return {
        name: "sign_up",
        params: {
          method: "newsletter",
          page_path: path,
          event_label: label,
        },
      };
    case "newsletter_open":
      return {
        name: "view_promotion",
        params: {
          promotion_name: "newsletter_modal",
          page_path: path,
        },
      };
    case "opt_out_submit":
      return {
        name: "generate_lead",
        params: {
          lead_type: "opt_out_letter",
          page_path: path,
        },
      };
    case "opt_out_open":
      return {
        name: "begin_checkout",
        params: {
          item_category: "opt_out_letter",
          page_path: path,
        },
      };
    case "cta_click":
      return {
        name: "select_content",
        params: {
          content_type: "cta",
          item_id: label ?? metadata.cta ?? "cta",
          page_path: path,
        },
      };
    case "nav_click":
      return {
        name: "click",
        params: {
          link_text: label ?? metadata.label,
          link_url: metadata.href ?? metadata.url,
          page_path: path,
        },
      };
    default:
      return {
        name: eventName,
        params: {
          event_label: label,
          page_path: path,
          ...metadata,
        },
      };
  }
}

export function sendGoogleAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: {
    label?: string;
    path?: string;
    metadata?: Record<string, string>;
  } = {},
) {
  if (!canUseGoogleAnalytics()) return;

  const { name, params } = toGoogleAnalyticsEvent(eventName, options);
  sendGAEvent("event", name, params);
}

export function configureGoogleAnalytics(gaId: string) {
  if (!canUseGoogleAnalytics()) return;

  sendGAEvent("config", gaId, {
    send_page_view: true,
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
    allow_google_signals: true,
    allow_ad_personalization_signals: true,
  });
}
