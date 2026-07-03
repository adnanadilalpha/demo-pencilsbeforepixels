import type { ReactNode } from "react";
import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { PisaYearLegend } from "@/components/charts/PisaYearLegend";
import {
  buildPisaResearchCharts,
  PISA_CHART_LABELS,
  PISA_RESEARCH_LEGEND_ITEMS,
} from "@/lib/charts/pisa-data";
import type { AcademicChart } from "@/lib/academic-data/types";
import { researchBodyText } from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";

type PisaChartsSectionProps = {
  math: AcademicChart;
  reading: AcademicChart;
  variant: "research" | "academic";
  callout?: ReactNode;
  className?: string;
};

export function PisaChartsSection({
  math,
  reading,
  variant,
  callout,
  className,
}: PisaChartsSectionProps) {
  const isAcademic = variant === "academic";
  const legendItems = PISA_RESEARCH_LEGEND_ITEMS;
  const lightPanelCharts = isAcademic ? buildPisaResearchCharts() : null;
  const mathChart = lightPanelCharts?.math ?? math;
  const readingChart = lightPanelCharts?.reading ?? reading;

  const header = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
      <div className="flex max-w-2xl flex-col gap-1.5 lg:gap-2">
        <h3
          className={
            isAcademic
              ? "font-sans text-sm font-semibold text-navy-800 sm:text-base lg:text-lg"
              : "text-sm text-[#18263a] md:text-base lg:text-lg"
          }
        >
          {PISA_CHART_LABELS.title}
        </h3>
        <p
          className={
            isAcademic
              ? "text-xs leading-relaxed text-navy-800/70 sm:text-sm"
              : researchBodyText
          }
        >
          {PISA_CHART_LABELS.description}
        </p>
      </div>
      <PisaYearLegend items={legendItems} variant={isAcademic ? "light" : "research"} />
    </div>
  );

  const charts = (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-10">
      <EvidenceLineChart
        chart={mathChart}
        research
        hideTitle={false}
        showTooltip
      />
      <EvidenceLineChart
        chart={readingChart}
        research
        hideTitle={false}
        showTooltip
      />
    </div>
  );

  if (isAcademic) {
    return (
      <div
        className={cn(
          "flex flex-col gap-5 rounded-xl border border-white/15 bg-white p-4 sm:gap-6 sm:p-6 lg:p-8",
          className,
        )}
      >
        {header}
        {charts}
        {callout}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-5", className)}>
      {header}
      {charts}
      {callout}
    </div>
  );
}
