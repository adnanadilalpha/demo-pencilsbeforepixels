"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Mail, ScrollText, Video } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AnalyticsSection } from "@/components/admin/dashboard/AnalyticsSection";
import type { DashboardData } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";

type DashboardViewProps = {
  initialData: DashboardData;
};

export function DashboardView({ initialData }: DashboardViewProps) {
  const [data, setData] = useState(initialData);

  const refreshStats = useCallback(async () => {
    const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
    if (!response.ok) return;
    const nextData = (await response.json()) as DashboardData;
    setData((current) => ({
      ...nextData,
      analytics: current.analytics,
    }));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-dashboard-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "newsletter_subscribers" },
        () => {
          void refreshStats();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opt_out_submissions" },
        () => {
          void refreshStats();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "library_items" },
        () => {
          void refreshStats();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => {
          void refreshStats();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshStats]);

  return (
    <div className="flex w-full flex-col gap-8">
      <AdminPageHeader
        title="Dashboard"
        description={`${data.greeting}, ${data.user.name}. Here's what's happening.`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={data.stats.newsletter.label}
          value={data.stats.newsletter.value}
          trend={data.stats.newsletter.trend}
          trendPositive={data.stats.newsletter.trendPositive}
          icon={<Mail className="size-3.5" />}
        />
        <AdminStatCard
          label={data.stats.optOut.label}
          value={data.stats.optOut.value}
          trend={data.stats.optOut.trend}
          trendPositive={data.stats.optOut.trendPositive}
          icon={<ScrollText className="size-3.5" />}
        />
        <AdminStatCard
          label={data.stats.resources.label}
          value={data.stats.resources.value}
          statusLabel={data.stats.resources.statusLabel}
          icon={<BookOpen className="size-3.5" />}
        />
        <AdminStatCard
          label={data.stats.videos.label}
          value={data.stats.videos.value}
          statusLabel={data.stats.videos.statusLabel}
          icon={<Video className="size-3.5" />}
        />
      </section>

      <AnalyticsSection initialAnalytics={initialData.analytics} />
    </div>
  );
}
