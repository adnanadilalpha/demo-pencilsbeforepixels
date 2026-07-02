"use client";

import type { AnalyticsMetric, AnalyticsTimePoint } from "@/lib/admin/types";
import { formatCount } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

type VisitorsChartProps = {
  data: AnalyticsTimePoint[];
  metric: AnalyticsMetric;
};

export function VisitorsChart({ data, metric }: VisitorsChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const hasData = data.some((point) => point.value > 0);
  const metricLabel = metric === "sessions" ? "sessions" : "page views";

  if (!hasData) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-paper-300 bg-paper-50/60 px-6 text-center text-sm text-body-muted">
        No {metricLabel} in this period yet. Browse the public site to generate
        traffic.
      </div>
    );
  }

  const labelInterval = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="flex min-h-[220px] flex-col">
      <div className="mb-3 flex items-center justify-between text-xs text-body-muted">
        <span className="font-medium uppercase tracking-[0.08em]">
          {metric === "sessions" ? "Unique sessions" : "Page views"}
        </span>
        <span>Peak: {formatCount(maxValue)}</span>
      </div>

      <div className="flex flex-1 items-end gap-1 sm:gap-1.5">
        {data.map((point, index) => {
          const heightPercent = Math.max((point.value / maxValue) * 100, point.value > 0 ? 8 : 0);
          const showLabel = index % labelInterval === 0 || index === data.length - 1;

          return (
            <div
              key={point.key}
              className="group flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div className="mb-1 hidden text-[10px] font-mono text-navy-800/70 sm:block">
                {point.value > 0 ? formatCount(point.value) : ""}
              </div>
              <div className="flex h-40 w-full items-end">
                <div
                  title={`${point.label}: ${formatCount(point.value)} ${metricLabel}`}
                  className={cn(
                    "w-full rounded-t-md bg-linear-to-t from-gold-500 to-gold-accent transition-all duration-300",
                    "group-hover:from-gold-500/90 group-hover:to-gold-accent/90",
                    point.value === 0 && "bg-navy-50 from-navy-50 to-navy-50",
                  )}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              {showLabel ? (
                <span className="mt-2 truncate text-center text-[10px] text-body-muted sm:text-[11px]">
                  {point.label}
                </span>
              ) : (
                <span className="mt-2 h-[14px]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
