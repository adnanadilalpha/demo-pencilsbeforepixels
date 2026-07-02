import { getPageLabel } from "@/lib/admin/page-labels";
import type {
  AnalyticsMetric,
  AnalyticsRange,
  AnalyticsStatCard,
  AnalyticsTimePoint,
  PopularPageRow,
} from "@/lib/admin/types";
import { formatCount, formatDuration, formatPercentChange } from "@/lib/admin/format";

export type PageViewRow = {
  session_id: string;
  path: string;
  duration_seconds: number | null;
  is_bounce: boolean;
  created_at: string;
};

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "6m": 183,
};

export function getRangeDays(range: AnalyticsRange): number {
  return RANGE_DAYS[range];
}

export function getRangeStart(range: AnalyticsRange, from = new Date()): Date {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  if (range === "6m") {
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    return start;
  }

  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return start;
}

export function getPreviousRangeStart(range: AnalyticsRange, from = new Date()): Date {
  const currentStart = getRangeStart(range, from);

  if (range === "6m") {
    const previous = new Date(currentStart);
    previous.setMonth(previous.getMonth() - 6);
    return previous;
  }

  const previous = new Date(currentStart);
  previous.setDate(previous.getDate() - RANGE_DAYS[range]);
  return previous;
}

function filterViewsByRange(
  views: PageViewRow[],
  range: AnalyticsRange,
  reference = new Date(),
): PageViewRow[] {
  const start = getRangeStart(range, reference);
  return views.filter((view) => new Date(view.created_at) >= start);
}

function filterViewsBetween(
  views: PageViewRow[],
  start: Date,
  end: Date,
): PageViewRow[] {
  return views.filter((view) => {
    const created = new Date(view.created_at);
    return created >= start && created < end;
  });
}

function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bucketKey(date: Date, range: AnalyticsRange): string {
  if (range === "6m") {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }

  if (range === "90d") {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return formatLocalDateKey(weekStart);
  }

  return formatLocalDateKey(date);
}

function bucketLabel(key: string, range: AnalyticsRange): string {
  if (range === "6m") {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month, 1).toLocaleDateString("en-US", {
      month: "short",
    });
  }

  const date = new Date(`${key}T00:00:00`);

  if (range === "90d") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (range === "30d") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function createBucketKeys(range: AnalyticsRange, reference = new Date()): string[] {
  const keys: string[] = [];
  const start = getRangeStart(range, reference);

  if (range === "6m") {
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(reference.getFullYear(), reference.getMonth() - index, 1);
      keys.push(`${date.getFullYear()}-${date.getMonth()}`);
    }
    return keys;
  }

  if (range === "90d") {
    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() - cursor.getDay());
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(reference);
    end.setHours(23, 59, 59, 999);

    while (cursor <= end) {
      keys.push(formatLocalDateKey(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return keys;
  }

  const cursor = new Date(start);
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    keys.push(formatLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function metricValue(
  views: PageViewRow[],
  metric: AnalyticsMetric,
): number {
  if (metric === "sessions") {
    return new Set(views.map((view) => view.session_id)).size;
  }

  return views.length;
}

export function buildVisitorsOverTime(
  views: PageViewRow[],
  range: AnalyticsRange,
  metric: AnalyticsMetric,
): AnalyticsTimePoint[] {
  const keys = createBucketKeys(range);
  const grouped = new Map<string, PageViewRow[]>();

  for (const key of keys) {
    grouped.set(key, []);
  }

  for (const view of views) {
    const key = bucketKey(new Date(view.created_at), range);
    if (!grouped.has(key)) continue;
    grouped.get(key)?.push(view);
  }

  return keys.map((key) => ({
    key,
    label: bucketLabel(key, range),
    value: metricValue(grouped.get(key) ?? [], metric),
  }));
}

export function buildPopularPages(
  views: PageViewRow[],
  limit = 5,
): PopularPageRow[] {
  const counts = new Map<string, number>();

  for (const view of views) {
    counts.set(view.path, (counts.get(view.path) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([path, pageViews]) => ({
      path,
      label: getPageLabel(path),
      views: pageViews,
    }));
}

export function computeBounceRate(views: PageViewRow[]): number {
  const sessions = new Map<string, { count: number; bounced: boolean }>();

  for (const view of views) {
    const existing = sessions.get(view.session_id) ?? { count: 0, bounced: true };
    existing.count += 1;
    if (!view.is_bounce) {
      existing.bounced = false;
    }
    sessions.set(view.session_id, existing);
  }

  if (sessions.size === 0) return 0;

  let bounces = 0;
  for (const session of sessions.values()) {
    if (session.count === 1 && session.bounced) {
      bounces += 1;
    }
  }

  return Math.round((bounces / sessions.size) * 100);
}

export function buildAnalyticsSummary(
  allViews: PageViewRow[],
  range: AnalyticsRange,
  reference = new Date(),
): {
  totalVisitors: AnalyticsStatCard;
  uniqueSessions: AnalyticsStatCard;
  avgTimeOnSite: AnalyticsStatCard;
  bounceRate: AnalyticsStatCard;
  visitorsOverTime: AnalyticsTimePoint[];
  popularPages: PopularPageRow[];
} {
  const currentViews = filterViewsByRange(allViews, range, reference);
  const currentStart = getRangeStart(range, reference);
  const previousStart = getPreviousRangeStart(range, reference);
  const previousViews = filterViewsBetween(allViews, previousStart, currentStart);

  const totalVisitors = currentViews.length;
  const uniqueSessions = new Set(currentViews.map((view) => view.session_id)).size;
  const previousSessions = new Set(previousViews.map((view) => view.session_id)).size;
  const sessionTrend = formatPercentChange(uniqueSessions, previousSessions);

  const durations = currentViews
    .map((view) => view.duration_seconds)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const avgDuration =
    durations.length > 0
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : 0;

  const previousTotal = previousViews.length;
  const visitorTrend = formatPercentChange(totalVisitors, previousTotal);

  return {
    totalVisitors: {
      label: "Total Visitors",
      value: formatCount(totalVisitors),
      trend: `${visitorTrend} vs prior period`,
      trendPositive: totalVisitors >= previousTotal,
    },
    uniqueSessions: {
      label: "Unique Sessions",
      value: formatCount(uniqueSessions),
      trend: `${sessionTrend} vs prior period`,
      trendPositive: uniqueSessions >= previousSessions,
    },
    avgTimeOnSite: {
      label: "Avg. Time on Site",
      value: formatDuration(avgDuration),
    },
    bounceRate: {
      label: "Bounce Rate",
      value: `${computeBounceRate(currentViews)}%`,
    },
    visitorsOverTime: buildVisitorsOverTime(currentViews, range, "sessions"),
    popularPages: buildPopularPages(currentViews),
  };
}

export function buildAnalyticsForFilters(
  allViews: PageViewRow[],
  range: AnalyticsRange,
  metric: AnalyticsMetric,
  reference = new Date(),
) {
  const summary = buildAnalyticsSummary(allViews, range, reference);

  return {
    ...summary,
    visitorsOverTime: buildVisitorsOverTime(
      filterViewsByRange(allViews, range, reference),
      range,
      metric,
    ),
  };
}
