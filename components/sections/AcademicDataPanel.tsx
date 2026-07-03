"use client";

import { useMemo, useState } from "react";
import { AcademicLineChart } from "@/components/charts/AcademicLineChart";
import { EvidenceStyleAcademicChartPanel } from "@/components/charts/EvidenceStyleAcademicChartPanel";
import { NaepGradeAcademicPanel } from "@/components/charts/NaepGradeAcademicPanel";
import { ParccAcademicPanel } from "@/components/charts/ParccAcademicPanel";
import { PisaChartsSection } from "@/components/charts/PisaChartsSection";
import { NewsletterTrigger } from "@/components/newsletter/NewsletterTrigger";
import { AcademicDatasetSelector } from "@/components/sections/AcademicDatasetSelector";
import { TextLink } from "@/components/ui/TextLink";
import { combineAcademicCharts } from "@/lib/academic-data/combine-charts";
import type { AcademicDataset, InsightSegment } from "@/lib/academic-data/types";
import {
  NAEP_GRADE_CHART_IMAGES,
  NAEP_GRADE_SECTIONS,
} from "@/lib/charts/naep-data";

type AcademicDataPanelProps = {
  datasets: AcademicDataset[];
};

function InsightText({ segments }: { segments: InsightSegment[] }) {
  return (
    <p className="text-sm leading-relaxed text-white/65 sm:text-[15px] lg:text-base">
      {segments.map((segment, index) => {
        if (segment.emphasis === "gold") {
          return (
            <strong key={index} className="text-gold-accent">
              {segment.text}
            </strong>
          );
        }
        if (segment.emphasis === "white") {
          return (
            <strong key={index} className="text-white">
              {segment.text}
            </strong>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </p>
  );
}

export function AcademicDataPanel({ datasets }: AcademicDataPanelProps) {
  const [activeId, setActiveId] = useState(datasets[0]?.id ?? "");
  const active = datasets.find((dataset) => dataset.id === activeId) ?? datasets[0];

  const combinedChart = useMemo(() => {
    if (
      !active ||
      active.sharedYearLegend ||
      active.naepGradeKey ||
      active.evidenceChartLayout ||
      active.parccChartLayout
    ) {
      return null;
    }
    return combineAcademicCharts(active.charts);
  }, [active]);

  const chartsToRender = combinedChart ? [combinedChart] : (active?.charts ?? []);
  const isPisaLayout = Boolean(active?.sharedYearLegend);
  const isEvidenceChart = Boolean(active?.evidenceChartLayout);
  const isParccChart = Boolean(active?.parccChartLayout);
  const evidenceChart = isEvidenceChart ? active.charts[0] : null;
  const parccChart = isParccChart ? active.charts[0] : null;
  const naepGradeKey = active?.naepGradeKey;
  const naepSection = naepGradeKey ? NAEP_GRADE_SECTIONS[naepGradeKey] : null;
  const naepImage = naepGradeKey ? NAEP_GRADE_CHART_IMAGES[naepGradeKey] : null;
  const pisaMath = isPisaLayout ? active.charts[0] : null;
  const pisaReading = isPisaLayout ? active.charts[1] : null;

  const hasChartContent =
    isPisaLayout ||
    Boolean(naepSection && naepImage) ||
    Boolean(isEvidenceChart && evidenceChart) ||
    Boolean(isParccChart && parccChart) ||
    chartsToRender.length > 0;

  if (!active || !hasChartContent) return null;

  return (
    <div className="w-full overflow-hidden border border-white/[0.07]">
      <div className="border-b border-white/[0.07] px-4 py-4 sm:px-6 sm:py-5">
        <AcademicDatasetSelector
          datasets={datasets}
          activeId={active.id}
          onChange={setActiveId}
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-5 sm:py-6 lg:px-6">
          {isPisaLayout && pisaMath && pisaReading ? (
            <PisaChartsSection
              variant="academic"
              math={pisaMath}
              reading={pisaReading}
            />
          ) : naepSection && naepImage ? (
            <NaepGradeAcademicPanel
              heading={naepSection.heading}
              imageSrc={naepImage.academicSrc}
              imageAlt={naepImage.alt}
              math={naepSection.math}
              reading={naepSection.reading}
            />
          ) : isParccChart && parccChart ? (
            <ParccAcademicPanel chart={parccChart} />
          ) : isEvidenceChart && evidenceChart ? (
            <EvidenceStyleAcademicChartPanel
              chart={evidenceChart}
              subtitle={
                active.performanceSubtitle ??
                (active.evidenceStudentGroup === "gender"
                  ? "By Gender · Solid = Male · Dotted = Female"
                  : "All Students · Weighted average across selected grades")
              }
              studentGroup={active.evidenceStudentGroup ?? "all"}
              selectedDistricts={active.evidenceSelectedDistricts}
            />
          ) : (
            <div
              className={
                chartsToRender.length > 1
                  ? "grid min-h-[440px] w-full grid-cols-1 gap-6 lg:grid-cols-2"
                  : "min-h-[480px] w-full sm:min-h-[540px] lg:min-h-[560px]"
              }
            >
              {chartsToRender.map((chart) => (
                <div
                  key={chart.title || chart.series.map((s) => s.label).join("-")}
                  className="h-full min-h-[480px] w-full sm:min-h-[540px]"
                >
                  <AcademicLineChart chart={chart} />
                </div>
              ))}
            </div>
          )}

          <div className="shrink-0 bg-gold-accent/[0.07] px-4 py-4 sm:px-5">
            <InsightText segments={active.insight} />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/6 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-[15px] lg:text-base">
              {active.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <NewsletterTrigger source="academic-data">
                Join Newsletter
              </NewsletterTrigger>
              <TextLink href="/evidence">Explore Nebraska Data</TextLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
