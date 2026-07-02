"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { PopularPagesChart } from "@/components/admin/dashboard/PopularPagesChart";
import { VisitorsChart } from "@/components/admin/dashboard/VisitorsChart";
import type {
  AnalyticsMetric,
  AnalyticsRange,
  DashboardData,
} from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "6m", label: "6 months" },
];

const METRIC_OPTIONS: Array<{ value: AnalyticsMetric; label: string }> = [
  { value: "sessions", label: "Sessions" },
  { value: "views", label: "Page views" },
];

type AnalyticsSectionProps = {
  initialAnalytics: DashboardData["analytics"];
};

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-gold-500 text-white"
          : "bg-paper-50 text-body-muted hover:bg-paper-200 hover:text-navy-800",
      )}
    >
      {children}
    </button>
  );
}

export function AnalyticsSection({ initialAnalytics }: AnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [range, setRange] = useState<AnalyticsRange>(initialAnalytics.range);
  const [metric, setMetric] = useState<AnalyticsMetric>(initialAnalytics.metric);
  const [isLoading, setIsLoading] = useState(false);
  const skipInitialFetch = useRef(true);

  const loadAnalytics = useCallback(async (nextRange: AnalyticsRange, nextMetric: AnalyticsMetric) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        range: nextRange,
        metric: nextMetric,
      });
      const response = await fetch(`/api/admin/dashboard?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as DashboardData;
      setAnalytics(data.analytics);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    void loadAnalytics(range, metric);
  }, [range, metric, loadAnalytics]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_views" },
        () => {
          void loadAnalytics(range, metric);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [range, metric, loadAnalytics]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-navy-800">Site analytics</h2>
          <p className="mt-1 text-sm text-body-muted">
            Filter traffic trends and top pages for the selected period.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-navy-800/8 bg-white p-1.5">
            {RANGE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                active={range === option.value}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-navy-800/8 bg-white p-1.5">
            {METRIC_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                active={metric === option.value}
                onClick={() => setMetric(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-4 transition-opacity duration-200",
          isLoading && "opacity-60",
        )}
      >
        <AdminStatCard
          label={analytics.totalVisitors.label}
          value={analytics.totalVisitors.value}
          trend={analytics.totalVisitors.trend}
          trendPositive={analytics.totalVisitors.trendPositive}
          icon={<TrendingUp className="size-3.5" />}
        />
        <AdminStatCard
          label={analytics.uniqueSessions.label}
          value={analytics.uniqueSessions.value}
          trend={analytics.uniqueSessions.trend}
          trendPositive={analytics.uniqueSessions.trendPositive}
        />
        <AdminStatCard
          label={analytics.avgTimeOnSite.label}
          value={analytics.avgTimeOnSite.value}
        />
        <AdminStatCard
          label={analytics.bounceRate.label}
          value={analytics.bounceRate.value}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[14px] border border-navy-800/8 bg-white p-5 shadow-[0_1px_3px_rgba(10,22,40,0.06)] sm:p-6">
          <h3 className="text-sm font-semibold text-navy-800">Visitors over time</h3>
          <div className="mt-5">
            <VisitorsChart data={analytics.visitorsOverTime} metric={metric} />
          </div>
        </article>

        <article className="rounded-[14px] border border-navy-800/8 bg-white p-5 shadow-[0_1px_3px_rgba(10,22,40,0.06)] sm:p-6">
          <h3 className="text-sm font-semibold text-navy-800">Popular pages</h3>
          <div className="mt-5">
            <PopularPagesChart pages={analytics.popularPages} />
          </div>
        </article>
      </div>
    </section>
  );
}
