"use client";

import type { ReactNode } from "react";
import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { PISA_CHART_LABELS } from "@/lib/charts/pisa-data";
import type { AcademicChart } from "@/lib/academic-data/types";
import { researchBodyText, researchSectionHeading } from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";

type PisaChartsSectionProps = {
  math: AcademicChart;
  reading: AcademicChart;
  title?: string;
  description?: string;
  callout?: ReactNode;
  className?: string;
};

export function PisaChartsSection({
  math,
  reading,
  title,
  description,
  callout,
  className,
}: PisaChartsSectionProps) {
  const headerTitle = title ?? PISA_CHART_LABELS.title;
  const headerDescription = description ?? PISA_CHART_LABELS.description;

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-5", className)}>
      <div className="flex max-w-2xl flex-col gap-1.5 lg:gap-2">
        <h3 className={researchSectionHeading}>{headerTitle}</h3>
        <p className={researchBodyText}>{headerDescription}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-10">
        <EvidenceLineChart
          chart={math}
          research
          hideTitle={false}
          showTooltip
        />
        <EvidenceLineChart
          chart={reading}
          research
          hideTitle={false}
          showTooltip
        />
      </div>
      {callout}
    </div>
  );
}
