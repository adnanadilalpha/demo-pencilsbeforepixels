"use client";

import { DualLineChartsWithLegend } from "@/components/charts/DualLineChartsWithLegend";
import { LineChartWithLegend } from "@/components/charts/LineChartWithLegend";
import { PisaChartsSection } from "@/components/charts/PisaChartsSection";
import { NaepGradeImagePanel } from "@/components/evidence/research/NaepGradeImagePanel";
import { ResearchBarChart } from "@/components/evidence/research/ResearchBarChart";
import { ResearchOecdScatter } from "@/components/evidence/research/ResearchOecdScatter";
import { ResearchScreenTimeChart } from "@/components/evidence/research/ResearchScreenTimeChart";
import { HandwritingVsTypewriting } from "@/components/evidence/research/HandwritingVsTypewriting";
import {
  ResearchChartCard,
  ResearchChartSection,
} from "@/components/research/ResearchSectionBand";
import {
  researchBodyText,
  researchBodyTextItalic,
  researchChartCaptionDark,
  researchChartCaptionMutedDark,
  researchSectionHeading,
  researchSectionTitle,
} from "@/components/charts/chart-theme";
import { NAEP_GRADE_CHART_IMAGES } from "@/lib/charts/naep-data";
import { useSiteContent, useSection } from "@/lib/cms/hooks";
import { mergeResearchWithFallback } from "@/lib/research/merge";

function NationalSlopeCard({ label, slope }: { label: string; slope: string }) {
  return (
    <div className="rounded-lg border border-navy-50 bg-navy-50 px-3 py-3 text-center md:px-4 md:py-4 lg:px-6 lg:py-5">
      <p className={researchChartCaptionDark}>{label}</p>
      <p className="mt-1.5 text-base font-semibold leading-single text-navy-800 md:mt-2 md:text-lg">
        {slope}
      </p>
      <p className={`mt-1.5 md:mt-2 ${researchChartCaptionMutedDark}`}>
        post-adoption avg. decline
      </p>
    </div>
  );
}

function splitBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function EvidenceResearchTab() {
  const { research } = useSiteContent();
  const data = mergeResearchWithFallback(research);
  const intro = useSection("evidence.intro");
  const introLabel =
    (intro.label as string) ?? "Nebraska in a National Context";
  const introBody =
    (intro.body as string) ??
    "How does Nebraska's trend compare to the broader national pattern?";

  return (
    <div className="flex flex-col">
      <ResearchChartSection showDivider={false} noTopPadding>
        <div className="flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col gap-3 lg:gap-4">
            <p className={`${researchChartCaptionDark} text-gold-500`}>
              {introLabel}
            </p>
            <p className={`max-w-3xl ${researchBodyText}`}>
              {introBody}
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-4 lg:gap-6">
              <h2 className={researchSectionTitle}>
                {data.naepNarrative.heading}
              </h2>
              <div className={`flex flex-col gap-3 md:gap-4 ${researchBodyText}`}>
                {splitBodyParagraphs(data.naepNarrative.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:gap-4">
              {data.nationalSlopes.map((stat) => (
                <NationalSlopeCard
                  key={stat.label}
                  label={stat.label}
                  slope={stat.slope}
                />
              ))}
            </div>
          </div>
        </div>
      </ResearchChartSection>

      <ResearchChartSection showDivider={false} noTopPadding>
        <NaepGradeImagePanel
          heading={data.grade4.heading}
          imageSrc={NAEP_GRADE_CHART_IMAGES.grade4.src}
          imageAlt={NAEP_GRADE_CHART_IMAGES.grade4.alt}
          math={data.grade4.math}
          reading={data.grade4.reading}
        />
      </ResearchChartSection>

      <ResearchChartSection showDivider={false} noTopPadding>
        <NaepGradeImagePanel
          heading={data.grade8.heading}
          imageSrc={NAEP_GRADE_CHART_IMAGES.grade8.src}
          imageAlt={NAEP_GRADE_CHART_IMAGES.grade8.alt}
          math={data.grade8.math}
          reading={data.grade8.reading}
        />
        <div className="mx-auto mt-4 max-w-3xl rounded-lg border border-[#e9e6df] bg-white px-4 py-4 text-center md:mt-5 lg:mt-6">
          <p className={researchBodyTextItalic}>{data.naepNarrative.footnote}</p>
        </div>
      </ResearchChartSection>

      <ResearchChartSection>
        <div className="flex flex-col gap-3 lg:gap-4">
          <h2 className={researchSectionTitle}>
            {data.internationalNarrative.heading}
          </h2>
          <p className={`max-w-3xl ${researchBodyText}`}>
            {data.internationalNarrative.body}
          </p>
        </div>
        <ResearchChartCard className="mt-4 md:mt-5 lg:mt-6">
          <PisaChartsSection
            title={data.pisa.title}
            description={data.pisa.description}
            math={data.pisa.math}
            reading={data.pisa.reading}
            callout={
              <div className="mt-3 rounded-lg border border-navy-50 bg-navy-50 px-3 py-2.5 text-center md:mt-4 md:px-4 md:py-3 lg:mt-6">
                <p className={researchBodyText}>
                  {data.pisa.callout}
                </p>
              </div>
            }
          />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className={researchSectionHeading}>
              {data.oecd.title}
            </h3>
            <p className={researchBodyText}>
              {data.oecd.subtitle}
            </p>
          </div>
          <ResearchOecdScatter chart={data.oecd} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ResearchChartCard>
            <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
              <h3 className={researchSectionHeading}>
                {data.timss.title}
              </h3>
              <p className={researchBodyText}>{data.timss.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3 lg:gap-4">
              <ResearchBarChart
                chart={data.timss.grade4}
                compact
                hideFooter
              />
              <ResearchBarChart
                chart={data.timss.grade8}
                compact
                hideFooter
              />
            </div>
          </ResearchChartCard>

          <ResearchChartCard>
            <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
              <h3 className={researchSectionHeading}>
                {data.pirls.title}
              </h3>
              <p className={researchBodyText}>{data.pirls.description}</p>
              {data.pirls.subtitle ? (
                <p className={researchChartCaptionMutedDark}>
                  {data.pirls.subtitle}
                </p>
              ) : null}
            </div>
            <ResearchBarChart
              chart={data.pirls}
              horizontal
              compact
              hideFooter
              hideTitle
            />
          </ResearchChartCard>
        </div>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className={researchSectionHeading}>
              {data.deviceTime.title}
            </h3>
            <p className={researchBodyText}>
              {data.deviceTime.description}
            </p>
          </div>
          <LineChartWithLegend chart={data.deviceTime.chart} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className={researchSectionHeading}>
              {data.parcc.title}
            </h3>
            <p className={researchBodyText}>
              {data.parcc.description}
            </p>
          </div>
          <DualLineChartsWithLegend
            left={data.parcc.math}
            right={data.parcc.ela}
            separateLegends
          />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className={researchSectionHeading}>
              {data.screenTime.title}
            </h3>
            <p className={researchBodyText}>
              {data.screenTime.description}
            </p>
          </div>
          <ResearchScreenTimeChart data={data.screenTime} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <HandwritingVsTypewriting />
        </ResearchChartCard>
      </ResearchChartSection>
    </div>
  );
}
