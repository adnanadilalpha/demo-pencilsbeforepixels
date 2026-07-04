"use client";

import { ChartSeriesToggleLegend } from "@/components/charts/ChartSeriesToggleLegend";
import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import type { AcademicChart, ChartSeries } from "@/lib/academic-data/types";
import { useChartSeriesVisibility } from "@/lib/charts/use-chart-series-visibility";

type DualLineChartsWithLegendProps = {
  left: AcademicChart;
  right: AcademicChart;
  /** Used for a single shared legend when `separateLegends` is false. */
  legendSeries?: ChartSeries[];
  /** When true, each chart gets its own legend (e.g. PARCC Math vs. ELA). */
  separateLegends?: boolean;
  legendVariant?: "research" | "academic" | "light";
  className?: string;
};

function ChartWithLegend({
  chart,
  legendVariant,
}: {
  chart: AcademicChart;
  legendVariant: "research" | "academic" | "light";
}) {
  const { hiddenSeries, toggleSeries } = useChartSeriesVisibility(chart.series);

  return (
    <div className="flex min-w-0 flex-col">
      <EvidenceLineChart
        chart={chart}
        research
        hideTitle={false}
        showTooltip
        hiddenSeries={hiddenSeries}
      />
      <ChartSeriesToggleLegend
        series={chart.series}
        hiddenSeries={hiddenSeries}
        onToggle={toggleSeries}
        variant={legendVariant}
        className="mt-3 md:mt-4 lg:mt-5"
      />
    </div>
  );
}

export function DualLineChartsWithLegend({
  left,
  right,
  legendSeries,
  separateLegends = false,
  legendVariant = "research",
  className,
}: DualLineChartsWithLegendProps) {
  const sharedSeries = legendSeries ?? left.series;
  const { hiddenSeries, toggleSeries } = useChartSeriesVisibility(sharedSeries);

  if (separateLegends) {
    return (
      <div className={className}>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ChartWithLegend chart={left} legendVariant={legendVariant} />
          <ChartWithLegend chart={right} legendVariant={legendVariant} />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <EvidenceLineChart
          chart={left}
          research
          hideTitle={false}
          showTooltip
          hiddenSeries={hiddenSeries}
        />
        <EvidenceLineChart
          chart={right}
          research
          hideTitle={false}
          showTooltip
          hiddenSeries={hiddenSeries}
        />
      </div>
      <ChartSeriesToggleLegend
        series={sharedSeries}
        hiddenSeries={hiddenSeries}
        onToggle={toggleSeries}
        variant={legendVariant}
        className="mt-4 sm:mt-5"
      />
    </div>
  );
}
