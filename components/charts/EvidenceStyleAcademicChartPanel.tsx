"use client";

import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import {
  DISTRICT_LEGEND_COLOR,
  EvidenceLegendRow,
  EvidenceLegendSwatch,
  StateBenchmarkLegendRow,
} from "@/components/charts/EvidenceChartLegend";
import type { AcademicChart } from "@/lib/academic-data/types";
import { formatDistrictLabel } from "@/lib/utils";

type EvidenceStyleAcademicChartPanelProps = {
  chart: AcademicChart;
  subtitle: string;
  studentGroup?: "all" | "gender";
  selectedDistricts?: { id: string; name: string; color: string }[];
};

export function EvidenceStyleAcademicChartPanel({
  chart,
  subtitle,
  studentGroup = "all",
  selectedDistricts = [],
}: EvidenceStyleAcademicChartPanelProps) {
  const isGender = studentGroup === "gender";
  const showStateReference =
    isGender
      ? chart.series.some((series) =>
          series.label.toLowerCase().includes("state"),
        )
      : chart.series.some(
          (series) => series.label === "State Average Benchmark",
        );

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-white/15 bg-white p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:gap-3">
          <h3 className="font-sans text-lg leading-display text-navy-800 lg:text-xl">
            {chart.title}
          </h3>
          <p className="text-sm leading-snug text-navy-800/75 sm:text-[15px]">
            {subtitle}
          </p>
        </div>
        <EvidenceLineChart chart={chart} hideTitle showTooltip />
      </div>

      <aside className="grid shrink-0 grid-cols-2 gap-4 sm:gap-5 lg:w-[280px] lg:grid-cols-1 lg:gap-6">
        <div className="rounded-xl border border-white/15 bg-white p-4 sm:p-5">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-navy-800/55">
            Line Style
          </h4>
          {isGender ? (
            <div className="flex flex-col gap-4">
              <EvidenceLegendRow
                color={DISTRICT_LEGEND_COLOR}
                marker="circle"
                title="Male"
                subtitle="Solid line"
              />
              <EvidenceLegendRow
                color={DISTRICT_LEGEND_COLOR}
                dashArray="2 4"
                marker="diamond"
                title="Female"
                subtitle="Dotted line"
              />
              <EvidenceLegendRow
                color={DISTRICT_LEGEND_COLOR}
                dashArray="8 3 2 3"
                marker="square"
                title="M+F Combined"
                subtitle="Weighted average"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <EvidenceLegendSwatch
                color={DISTRICT_LEGEND_COLOR}
                marker="circle"
                strokeWidth={2}
              />
              <span className="text-sm text-navy-800/70">All Students</span>
            </div>
          )}
        </div>

        {showStateReference ? (
          <div className="rounded-xl border border-white/15 bg-white p-4 sm:p-5">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-navy-800/55">
              Reference
            </h4>
            <StateBenchmarkLegendRow />
          </div>
        ) : null}

        {selectedDistricts.length > 0 ? (
          <div className="col-span-2 rounded-xl border border-white/15 bg-white p-4 sm:p-5 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-800/55">
                Selected Districts
              </h4>
              <span className="flex size-5 items-center justify-center rounded-full bg-navy-500 text-[11px] font-medium text-white">
                {selectedDistricts.length}
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {selectedDistricts.map((district) => (
                <li key={district.id} className="flex items-center gap-3">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: district.color }}
                    aria-hidden
                  />
                  <span className="text-sm leading-snug text-navy-800/70">
                    {formatDistrictLabel(district.name)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
