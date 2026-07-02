export type DashboardStatCard = {
  label: string;
  value: number;
  trend?: string;
  trendPositive?: boolean;
  statusLabel?: string;
};

export type AnalyticsStatCard = {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
};

export type AnalyticsRange = "7d" | "30d" | "90d" | "6m";
export type AnalyticsMetric = "views" | "sessions";

export type AnalyticsTimePoint = {
  key: string;
  label: string;
  value: number;
};

export type PopularPageRow = {
  path: string;
  label: string;
  views: number;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type DashboardData = {
  greeting: string;
  user: AdminUserSummary;
  stats: {
    newsletter: DashboardStatCard;
    optOut: DashboardStatCard;
    resources: DashboardStatCard;
    videos: DashboardStatCard;
  };
  analytics: {
    totalVisitors: AnalyticsStatCard;
    uniqueSessions: AnalyticsStatCard;
    avgTimeOnSite: AnalyticsStatCard;
    bounceRate: AnalyticsStatCard;
    visitorsOverTime: AnalyticsTimePoint[];
    popularPages: PopularPageRow[];
    range: AnalyticsRange;
    metric: AnalyticsMetric;
  };
};
