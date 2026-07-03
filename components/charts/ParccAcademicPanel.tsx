"use client";

import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { chartLegendDark } from "@/components/charts/chart-theme";
import type { AcademicChart } from "@/lib/academic-data/types";

type ParccAcademicPanelProps = {
  chart: AcademicChart;
};

function ChartSeriesLegend({ series }: { series: AcademicChart["series"] }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:mt-5 sm:gap-4">
      {series.map((entry) => (
        <div key={entry.label} className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className={chartLegendDark}>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ParccAcademicPanel({ chart }: ParccAcademicPanelProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-white p-4 sm:p-6 lg:p-8">
      <EvidenceLineChart chart={chart} research hideTitle={false} showTooltip />
      <ChartSeriesLegend series={chart.series} />
    </div>
  );
}
