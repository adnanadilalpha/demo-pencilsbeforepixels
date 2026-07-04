"use client";

import {
  chartLegendDark,
  chartLegendLight,
  researchChartLegendDark,
} from "@/components/charts/chart-theme";
import type { ChartSeries } from "@/lib/academic-data/types";
import { cn } from "@/lib/utils";

type ChartSeriesToggleLegendProps = {
  series: ChartSeries[];
  hiddenSeries: ReadonlySet<string>;
  onToggle: (label: string) => void;
  variant?: "research" | "academic" | "light";
  className?: string;
};

function LegendSwatch({
  color,
  dashArray,
  muted,
}: {
  color: string;
  dashArray?: string;
  muted: boolean;
}) {
  if (dashArray) {
    return (
      <span
        className={cn(
          "h-0 w-6 shrink-0 border-t-2 bg-transparent lg:w-7",
          muted && "opacity-35",
        )}
        style={{ borderTopColor: color, borderTopStyle: "dashed" }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "h-0.5 w-6 shrink-0 rounded-full lg:w-7",
        muted && "opacity-35",
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function ChartSeriesToggleLegend({
  series,
  hiddenSeries,
  onToggle,
  variant = "research",
  className,
}: ChartSeriesToggleLegendProps) {
  const labelClass =
    variant === "research"
      ? researchChartLegendDark
      : variant === "light"
        ? chartLegendLight
        : chartLegendDark;

  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5",
        className,
      )}
      role="group"
      aria-label="Chart series legend"
    >
      {series.map((entry) => {
        const isVisible = !hiddenSeries.has(entry.label);

        return (
          <button
            key={entry.label}
            type="button"
            onClick={() => onToggle(entry.label)}
            aria-pressed={isVisible}
            className={cn(
              "flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition-opacity",
              "hover:opacity-80 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold-accent",
              !isVisible && "opacity-45",
            )}
          >
            <LegendSwatch
              color={entry.color}
              dashArray={entry.dashArray}
              muted={!isVisible}
            />
            <span
              className={cn(
                labelClass,
                "leading-snug",
                !isVisible && "line-through",
              )}
            >
              {entry.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
