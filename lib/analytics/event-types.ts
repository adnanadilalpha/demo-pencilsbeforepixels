export const ANALYTICS_EVENTS = {
  CTA_CLICK: "cta_click",
  NEWSLETTER_OPEN: "newsletter_open",
  NEWSLETTER_SUBSCRIBE: "newsletter_subscribe",
  OPT_OUT_OPEN: "opt_out_open",
  OPT_OUT_SUBMIT: "opt_out_submit",
  NAV_CLICK: "nav_click",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventName, string> = {
  cta_click: "CTA click",
  newsletter_open: "Newsletter opened",
  newsletter_subscribe: "Newsletter signup",
  opt_out_open: "Opt-out started",
  opt_out_submit: "Opt-out letter generated",
  nav_click: "Navigation click",
};
