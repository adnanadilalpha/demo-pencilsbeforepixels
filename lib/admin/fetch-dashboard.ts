import "server-only";

import {
  buildAnalyticsForFilters,
  type AnalyticsEventRecord,
  type PageViewRow,
} from "@/lib/admin/analytics";
import { fetchAdminUser } from "@/lib/admin/fetch-user";
import type {
  AnalyticsMetric,
  AnalyticsRange,
  DashboardData,
} from "@/lib/admin/types";
import { getTimeGreeting, getTodayStartIso } from "@/lib/admin/format";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_RANGE: AnalyticsRange = "30d";
const DEFAULT_METRIC: AnalyticsMetric = "users";

function parseRange(value: string | null | undefined): AnalyticsRange {
  if (value === "7d" || value === "30d" || value === "90d" || value === "6m") {
    return value;
  }

  return DEFAULT_RANGE;
}

function parseMetric(value: string | null | undefined): AnalyticsMetric {
  if (value === "users" || value === "views" || value === "sessions") {
    return value;
  }

  return DEFAULT_METRIC;
}

type FetchDashboardOptions = {
  range?: AnalyticsRange;
  metric?: AnalyticsMetric;
};

export async function fetchDashboardData(
  userId: string,
  options: FetchDashboardOptions = {},
): Promise<DashboardData> {
  const range = options.range ?? DEFAULT_RANGE;
  const metric = options.metric ?? DEFAULT_METRIC;
  const supabase = createAdminClient();
  const user = await fetchAdminUser(userId);
  const todayStart = getTodayStartIso();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    newsletterTotalRes,
    newsletterTodayRes,
    optOutTotalRes,
    optOutTodayRes,
    resourcesRes,
    videosRes,
    pageViewsRes,
    analyticsEventsRes,
  ] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("subscribed_at", todayStart),
    supabase.from("opt_out_submissions").select("id", { count: "exact", head: true }),
    supabase
      .from("opt_out_submissions")
      .select("id", { count: "exact", head: true })
      .gte("generated_at", todayStart),
    supabase
      .from("library_items")
      .select("id", { count: "exact", head: true })
      .eq("visible", true),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("visible", true),
    supabase
      .from("page_views")
      .select(
        "session_id, visitor_id, visitor_key, path, duration_seconds, is_bounce, is_internal, view_count, last_seen_at, country_code, region, city, latitude, longitude, created_at",
      )
      .gte("created_at", sixMonthsAgo.toISOString()),
    supabase
      .from("analytics_events")
      .select(
        "session_id, visitor_id, visitor_key, event_name, event_label, is_internal, country_code, region, city, created_at",
      )
      .gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const pageViews = (pageViewsRes.data ?? []) as PageViewRow[];
  const analyticsEvents = (analyticsEventsRes.data ?? []) as AnalyticsEventRecord[];
  const analytics = await buildAnalyticsForFilters(
    pageViews,
    range,
    metric,
    analyticsEvents,
  );

  return {
    greeting: getTimeGreeting(),
    user,
    stats: {
      newsletter: {
        label: "Newsletter",
        value: newsletterTotalRes.count ?? 0,
        trend: `+${newsletterTodayRes.count ?? 0} today`,
        trendPositive: (newsletterTodayRes.count ?? 0) > 0,
      },
      optOut: {
        label: "Opt Out Letters",
        value: optOutTotalRes.count ?? 0,
        trend: `+${optOutTodayRes.count ?? 0} today`,
        trendPositive: (optOutTodayRes.count ?? 0) > 0,
      },
      resources: {
        label: "Resources",
        value: resourcesRes.count ?? 0,
        statusLabel: "Published",
      },
      videos: {
        label: "Videos",
        value: videosRes.count ?? 0,
        statusLabel: "Published",
      },
    },
    analytics: {
      ...analytics,
      range,
      metric,
    },
  };
}

export { parseMetric, parseRange };
