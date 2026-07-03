"use client";

import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { PisaChartsSection } from "@/components/charts/PisaChartsSection";
import { NaepGradeImagePanel } from "@/components/evidence/research/NaepGradeImagePanel";
import { ResearchBarChart } from "@/components/evidence/research/ResearchBarChart";
import { ResearchMentalHealthChart } from "@/components/evidence/research/ResearchMentalHealthChart";
import { ResearchOecdScatter } from "@/components/evidence/research/ResearchOecdScatter";
import { ResearchScreenTimeChart } from "@/components/evidence/research/ResearchScreenTimeChart";
import {
  ResearchChartCard,
  ResearchChartSection,
} from "@/components/research/ResearchSectionBand";
import {
  researchBodyText,
  researchBodyTextItalic,
  researchChartCaptionDark,
  researchChartCaptionMutedDark,
  researchChartLegendDark,
} from "@/components/charts/chart-theme";
import { NAEP_GRADE_CHART_IMAGES } from "@/lib/charts/naep-data";
import { useSiteContent, useSection } from "@/lib/cms/hooks";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import type { AcademicChart } from "@/lib/academic-data/types";

function ChartSeriesLegend({ series }: { series: AcademicChart["series"] }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3 md:mt-4 lg:mt-6 lg:gap-4">
      {series.map((entry) => (
        <div key={entry.label} className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className={researchChartLegendDark}>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}

function NationalSlopeCard({ label, slope }: { label: string; slope: string }) {
  return (
    <div className="rounded-lg border border-navy-50 bg-navy-50 px-3 py-3 text-center md:px-4 md:py-4 lg:px-6 lg:py-5">
      <p className={researchChartCaptionDark}>{label}</p>
      <p className="mt-1.5 text-lg font-semibold leading-single text-navy-800 md:mt-2 md:text-xl lg:text-2xl">
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
            <p className={`max-w-3xl ${researchBodyText} lg:text-lg`}>
              {introBody}
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-4 lg:gap-6">
              <h2 className="text-lg leading-display text-[#18263a] md:text-xl lg:text-2xl">
                The NAEP Evidence: When Digital Adoption Aligns with Score
                Decline
              </h2>
              <div className={`flex flex-col gap-3 md:gap-4 ${researchBodyText}`}>
                <p>
                  Nebraska&apos;s assessment trends don&apos;t exist in isolation.
                  Nationally, researchers have documented a striking pattern:
                  across all 50 states, NAEP scores in Math and Reading rose
                  steadily for years — then plateaued and declined in alignment
                  with each state&apos;s large-scale digital adoption, not with a
                  single calendar year. This{" "}
                  <span className="font-semibold text-[#18263a]">
                    staggered policy adoption
                  </span>{" "}
                  design provides strong evidence that the timing of digital
                  lock-in, not external factors, drives the shift.
                </p>
                <p>
                  The charts below show national NAEP averages aligned to each
                  state&apos;s digital inflection point (Year 0). These results
                  cannot be attributed to COVID because Year 0 for every state
                  occurred before the pandemic and 2022 data was excluded
                  entirely. Unlike most &quot;standardized&quot; educational
                  assessments that periodically reset their scoring scales, NAEP
                  has remained anchored to its original 1992 scale, meaning these
                  declines reflect genuine losses in student learning, not
                  adjustments to the test.
                </p>
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
          <p className={researchBodyTextItalic}>
            Note: The national charts utilize a &quot;Year 0&quot; alignment
            strategy where Year 0 represents the specific year each state reached
            a threshold of digital device saturation in classrooms. Data via NAEP
            (National Assessment of Educational Progress).
          </p>
        </div>
      </ResearchChartSection>

      <ResearchChartSection>
        <div className="flex flex-col gap-3 lg:gap-4">
          <h2 className="text-lg leading-[1.3] text-[#18263a] md:text-xl lg:text-2xl">
            International Research: Screen Time &amp; Academic Performance
          </h2>
          <p className={`max-w-3xl ${researchBodyText}`}>
            Beyond national trends, a robust body of international research has
            examined the relationship between digital device use and academic
            performance. Below are key charts summarizing findings from PISA and
            OECD data, revealing consistent patterns of negative associations
            between screen time and student achievement across multiple countries
            and subjects.
          </p>
        </div>
        <ResearchChartCard className="mt-4 md:mt-5 lg:mt-6">
          <PisaChartsSection
            variant="research"
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
            <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
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
              <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
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
              <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
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
            <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
              {data.deviceTime.title}
            </h3>
            <p className={researchBodyText}>
              {data.deviceTime.description}
            </p>
          </div>
          <EvidenceLineChart
            chart={data.deviceTime.chart}
            research
            hideTitle
            showTooltip
          />
          <ChartSeriesLegend series={data.deviceTime.chart.series} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
              {data.parcc.title}
            </h3>
            <p className={researchBodyText}>
              {data.parcc.description}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <EvidenceLineChart
              chart={data.parcc.math}
              research
              hideTitle={false}
              showTooltip
            />
            <EvidenceLineChart
              chart={data.parcc.ela}
              research
              hideTitle={false}
              showTooltip
            />
          </div>
          <ChartSeriesLegend series={data.parcc.math.series} />
        </ResearchChartCard>
      </ResearchChartSection>

      <ResearchChartSection>
        <ResearchChartCard>
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
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
          <div className="mb-4 flex flex-col gap-1.5 lg:mb-8 lg:gap-2">
            <h3 className="text-sm text-[#18263a] md:text-base lg:text-lg">
              {data.mentalHealth.title}
            </h3>
            <p className={researchBodyText}>
              {data.mentalHealth.description}
            </p>
          </div>
          <ResearchMentalHealthChart series={data.mentalHealth.series} />
          <div className="mt-3 rounded-lg border border-navy-50 bg-navy-50 px-3 py-2.5 text-center md:mt-4 md:px-4 md:py-3 lg:mt-6">
            <p className={researchBodyText}>
              {data.mentalHealth.callout}
            </p>
          </div>
        </ResearchChartCard>
      </ResearchChartSection>
    </div>
  );
}
