"use client";

import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { NaepYearZeroChart } from "@/components/evidence/research/NaepYearZeroChart";
import { ResearchBarChart } from "@/components/evidence/research/ResearchBarChart";
import { ResearchMentalHealthChart } from "@/components/evidence/research/ResearchMentalHealthChart";
import { ResearchOecdScatter } from "@/components/evidence/research/ResearchOecdScatter";
import { useSiteContent } from "@/lib/cms/hooks";
import type { ResearchChartsData } from "@/lib/research/types";

function ResearchCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function NationalSlopeCard({ label, slope }: { label: string; slope: string }) {
  return (
    <div className="rounded-lg border border-navy-50 bg-navy-50 px-4 py-4 text-center sm:px-6 sm:py-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-navy-800/60 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold leading-single text-navy-800 sm:text-2xl">
        {slope}
      </p>
      <p className="mt-2 text-[10px] text-navy-800/50">
        post-adoption avg. decline
      </p>
    </div>
  );
}

function NaepGradePanel({
  heading,
  math,
  reading,
}: {
  heading: string;
  math: ResearchChartsData["grade4"]["math"];
  reading: ResearchChartsData["grade4"]["reading"];
}) {
  return (
    <ResearchCard>
      <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-navy-800/60 sm:mb-6 sm:text-xs">
        {heading}
      </p>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <NaepYearZeroChart chart={math} />
        <NaepYearZeroChart chart={reading} />
      </div>
    </ResearchCard>
  );
}

export function EvidenceResearchTab() {
  const { research: data } = useSiteContent();

  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <section className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-gold-500 sm:text-xs">
            Nebraska in a National Context
          </p>
          <p className="max-w-3xl text-base leading-[1.4] text-[#6b7280] sm:text-lg">
            How does Nebraska&apos;s trend compare to the broader national
            pattern?
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl leading-display text-[#18263a] sm:text-2xl">
              The NAEP Evidence: When Digital Adoption Aligns with Score
              Decline
            </h2>
            <div className="flex flex-col gap-4 text-sm leading-[1.4] text-[#6b7280] sm:text-base">
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
                entirely. Unlike most standardized assessments that periodically
                reset their scoring scales, NAEP has remained anchored to its
                original 1992 scale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {data.nationalSlopes.map((stat) => (
              <NationalSlopeCard
                key={stat.label}
                label={stat.label}
                slope={stat.slope}
              />
            ))}
          </div>
        </div>
      </section>

      <NaepGradePanel
        heading={data.grade4.heading}
        math={data.grade4.math}
        reading={data.grade4.reading}
      />

      <NaepGradePanel
        heading={data.grade8.heading}
        math={data.grade8.math}
        reading={data.grade8.reading}
      />

      <div className="mx-auto max-w-3xl rounded-lg border border-[#e9e6df] bg-paper-200 px-4 py-4 text-center">
        <p className="text-xs italic leading-relaxed text-[#6b7280] sm:text-sm">
          Note: The national charts utilize a &quot;Year 0&quot; alignment
          strategy where Year 0 represents the specific year each state reached
          a threshold of digital device saturation in classrooms. Data via NAEP
          (National Assessment of Educational Progress).
        </p>
      </div>

      <section className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl leading-[1.3] text-[#18263a] sm:text-2xl">
            International Research: Screen Time &amp; Academic Performance
          </h2>
          <p className="max-w-3xl text-sm leading-[1.4] text-[#6b7280] sm:text-base">
            Beyond national trends, a robust body of international research has
            examined the relationship between digital device use and academic
            performance. Below are key charts summarizing findings from PISA and
            OECD data, revealing consistent patterns of negative associations
            between screen time and student achievement across multiple countries
            and subjects.
          </p>
        </div>

        <ResearchCard>
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-2">
              <h3 className="text-base text-[#18263a] sm:text-lg">{data.pisa.title}</h3>
              <p className="text-xs leading-relaxed text-[#6b7280] sm:text-sm">
                {data.pisa.description}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { year: "2012", className: "bg-navy-800" },
                { year: "2015", className: "border-t-2 border-dashed border-navy-400 bg-transparent" },
                { year: "2018", className: "border-t-2 border-dashed border-[#8aafd4] bg-transparent" },
              ].map((entry) => (
                <div key={entry.year} className="flex items-center gap-2">
                  <span className={`h-0.5 w-6 ${entry.className}`} aria-hidden />
                  <span className="text-xs text-navy-800/70">{entry.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <EvidenceLineChart chart={data.pisa.math} compact hideTitle={false} showTooltip />
            <EvidenceLineChart
              chart={data.pisa.reading}
              compact
              hideTitle={false}
              showTooltip
            />
          </div>

          <div className="mt-4 rounded-lg border border-navy-50 bg-navy-50 px-4 py-3 text-center sm:mt-6">
            <p className="text-xs leading-relaxed text-[#6b7280] sm:text-sm">
              {data.pisa.callout}
            </p>
          </div>
        </ResearchCard>

        <ResearchCard>
          <div className="mb-4 flex flex-col gap-2">
            <h3 className="text-base text-[#18263a] sm:text-lg">{data.oecd.title}</h3>
            <p className="text-xs text-[#6b7280] sm:text-sm">{data.oecd.subtitle}</p>
          </div>
          <ResearchOecdScatter chart={data.oecd} />
        </ResearchCard>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
          <ResearchCard>
            <div className="mb-4 flex flex-col gap-2">
              <h3 className="text-base text-[#18263a] sm:text-lg">{data.timss.title}</h3>
              <p className="text-xs text-[#6b7280] sm:text-sm">{data.timss.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <ResearchBarChart chart={data.timss.grade4} />
              <ResearchBarChart chart={data.timss.grade8} />
            </div>
          </ResearchCard>

          <ResearchCard>
            <div className="mb-4 flex flex-col gap-2">
              <h3 className="text-base text-[#18263a] sm:text-lg">{data.pirls.title}</h3>
              <p className="text-xs text-[#6b7280] sm:text-sm">{data.pirls.description}</p>
            </div>
            <ResearchBarChart chart={data.pirls} horizontal />
          </ResearchCard>
        </div>

        <ResearchCard>
          <div className="mb-4 flex flex-col gap-2">
            <h3 className="text-base text-[#18263a] sm:text-lg">{data.mentalHealth.title}</h3>
            <p className="text-xs leading-relaxed text-[#6b7280] sm:text-sm">
              {data.mentalHealth.description}
            </p>
          </div>
          <ResearchMentalHealthChart series={data.mentalHealth.series} />
          <div className="mt-4 rounded-lg border border-navy-50 bg-navy-50 px-4 py-3 text-center sm:mt-6">
            <p className="text-xs leading-relaxed text-[#6b7280] sm:text-sm">
              {data.mentalHealth.callout}
            </p>
          </div>
        </ResearchCard>
      </section>
    </div>
  );
}
