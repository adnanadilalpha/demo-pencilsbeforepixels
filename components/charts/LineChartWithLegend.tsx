"use client";

import { ChartSeriesToggleLegend } from "@/components/charts/ChartSeriesToggleLegend";
import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import type { AcademicChart } from "@/lib/academic-data/types";
import { useChartSeriesVisibility } from "@/lib/charts/use-chart-series-visibility";

type LineChartWithLegendProps = {
  chart: AcademicChart;
};

export function LineChartWithLegend({ chart }: LineChartWithLegendProps) {
  const { hiddenSeries, toggleSeries } = useChartSeriesVisibility(chart.series);

  return (
    <>
      <EvidenceLineChart
        chart={chart}
        research
        hideTitle
        showTooltip
        hiddenSeries={hiddenSeries}
      />
      <ChartSeriesToggleLegend
        series={chart.series}
        hiddenSeries={hiddenSeries}
        onToggle={toggleSeries}
        variant="research"
        className="mt-3 md:mt-4 lg:mt-6"
      />
    </>
  );
}
