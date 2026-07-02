"use client";

import { useState } from "react";
import { AcademicLineChart } from "@/components/charts/AcademicLineChart";
import { NewsletterTrigger } from "@/components/newsletter/NewsletterTrigger";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { TextLink } from "@/components/ui/TextLink";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AcademicChart, AcademicDataset, InsightSegment } from "@/lib/academic-data/types";

type AcademicDataPanelProps = {
  datasets: AcademicDataset[];
};

const EMPTY_CHART: AcademicChart = {
  title: "",
  yLabel: "",
  xLabel: "",
  categories: ["", "", "", "", "", ""],
  yTicks: [0, 0, 0, 0],
  series: [],
};

function InsightText({ segments }: { segments: InsightSegment[] }) {
  return (
    <p className="text-sm leading-[1.4] text-white/65">
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

function chartSlots(charts: AcademicChart[]): [AcademicChart, AcademicChart] {
  return [charts[0] ?? EMPTY_CHART, charts[1] ?? EMPTY_CHART];
}

export function AcademicDataPanel({ datasets }: AcademicDataPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = datasets[activeIndex] ?? datasets[0];

  if (!active) return null;

  const [leftChart, rightChart] = chartSlots(active.charts);
  const rightEmpty = active.charts.length < 2;

  return (
    <div className="w-full overflow-hidden border border-white/[0.07]">
      <div className="flex w-full flex-col lg:h-[577px] lg:flex-row">
        <aside className="hidden w-full shrink-0 flex-col border-b border-white/[0.07] lg:flex lg:h-full lg:w-[280px] lg:border-b-0 lg:border-r">
          <p className="shrink-0 border-b border-white/[0.07] px-6 py-5 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
            Datasets
          </p>
          <ul className="flex flex-1 flex-col justify-between">
            {datasets.map((dataset, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={dataset.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-2 border-l-[2.6px] py-4 pr-6 text-left transition-colors ${
                      isActive
                        ? "border-gold-accent bg-gold-accent/6 pl-[26px] text-white"
                        : "border-transparent pl-[26px] text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`w-4 shrink-0 text-xs font-medium leading-none ${
                        isActive ? "text-gold-accent" : ""
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-sm leading-ui-label sm:leading-single ${
                        isActive ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {dataset.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5 lg:hidden">
            <p className="shrink-0 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/70">
              Datasets
            </p>
            <Select
              value={String(activeIndex)}
              onValueChange={(value) => setActiveIndex(Number(value))}
            >
              <SelectTrigger className="h-auto w-full max-w-[264px] rounded-full border-navy-800/10 bg-paper-300 px-8 py-3 text-sm font-semibold text-navy-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset, index) => (
                  <SelectItem key={dataset.id} value={String(index)}>
                    {String(index + 1).padStart(2, "0")} {dataset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="shrink-0 border-b border-gold-500/50 px-6 py-6">
            <DisplayHeading as="h3" size="md" className="text-white">
              {active.title}
            </DisplayHeading>
          </div>

          <div className="flex flex-col gap-6 px-6 pt-6 lg:min-h-0 lg:flex-1">
            <div className="flex flex-col gap-8 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-8">
              <div className="h-[296px] w-full shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
                <AcademicLineChart chart={leftChart} />
              </div>
              <div className="h-[296px] w-full shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
                <AcademicLineChart chart={rightChart} empty={rightEmpty} />
              </div>
            </div>

            <div className="shrink-0 bg-gold-accent/[0.07] px-5 py-4">
              <InsightText segments={active.insight} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/6 px-6 py-6">
            <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <p className="max-w-[500px] text-sm leading-[1.4] text-white/70">
                {active.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-8">
                <NewsletterTrigger source="academic-data">
                  Join Newsletter
                </NewsletterTrigger>
                <TextLink href="/evidence">Explore Evidence</TextLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
