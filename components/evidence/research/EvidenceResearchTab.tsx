"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { DualLineChartsWithLegend } from "@/components/charts/DualLineChartsWithLegend";
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
import { useSiteContent } from "@/lib/cms/hooks";
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

export function EvidenceResearchTab() {
  const { research } = useSiteContent();
  const data = mergeResearchWithFallback(research);

  return (
    <div className="flex flex-col">
      <ResearchChartSection showDivider={false} noTopPadding>
        <div className="flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-4 lg:gap-6">
              <h2 className={researchSectionTitle}>
                <RichTextContent content={data.naepNarrative.heading} inline />
              </h2>
              <RichTextContent
                content={data.naepNarrative.body}
                className={`flex flex-col gap-3 md:gap-4 ${researchBodyText}`}
                splitPlainParagraphs
              />
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
          <RichTextContent
            content={data.naepNarrative.footnote}
            className={researchBodyTextItalic}
          />
        </div>
      </ResearchChartSection>

      <ResearchChartSection>
        <div className="flex flex-col gap-3 lg:gap-4">
          <h2 className={researchSectionTitle}>
            <RichTextContent content={data.internationalNarrative.heading} inline />
          </h2>
          <RichTextContent
            content={data.internationalNarrative.body}
            className={`max-w-3xl ${researchBodyText}`}
          />
        </div>
        <ResearchChartCard className="mt-4 md:mt-5 lg:mt-6">
          <PisaChartsSection
            title={data.pisa.title}
            description={data.pisa.description}
            math={data.pisa.math}
            reading={data.pisa.reading}
            callout={
              <div className="mt-3 rounded-lg border border-navy-50 bg-navy-50 px-3 py-2.5 text-center md:mt-4 md:px-4 md:py-3 lg:mt-6">
                <RichTextContent
                  content={data.pisa.callout}
                  className={researchBodyText}
                />
              </div>
            }
          />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className={researchSectionHeading}>
              <RichTextContent content={data.oecd.title} inline />
            </h3>
            <RichTextContent
              content={data.oecd.subtitle}
              className={researchBodyText}
            />
          </div>
          <ResearchOecdScatter chart={data.oecd} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ResearchChartCard>
            <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
              <h3 className={researchSectionHeading}>
                <RichTextContent content={data.timss.title} inline />
              </h3>
              <RichTextContent
                content={data.timss.description}
                className={researchBodyText}
              />
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
                <RichTextContent content={data.pirls.title} inline />
              </h3>
              <RichTextContent
                content={data.pirls.description}
                className={researchBodyText}
              />
              {data.pirls.subtitle ? (
                <RichTextContent
                  content={data.pirls.subtitle}
                  className={researchChartCaptionMutedDark}
                  inline
                />
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
              <RichTextContent content={data.parcc.title} inline />
            </h3>
            <RichTextContent
              content={data.parcc.description}
              className={researchBodyText}
            />
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
              <RichTextContent content={data.screenTime.title} inline />
            </h3>
            <RichTextContent
              content={data.screenTime.description}
              className={researchBodyText}
            />
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
