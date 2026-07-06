"use client";

import { ResearchMentalHealthChart } from "@/components/evidence/research/ResearchMentalHealthChart";
import { RichTextContent } from "@/components/cms/RichTextContent";
import { RICH_TEXT_LINKS_LIGHT_CLASS } from "@/lib/cms/rich-text";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { TextLink } from "@/components/ui/TextLink";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { resolveResearchPageCta } from "@/lib/cms/site-ctas";
import type { MentalHealthSeries } from "@/lib/research/types";

function applyLegendColors(
  series: MentalHealthSeries[],
  legend: { label: string; color: string }[],
): MentalHealthSeries[] {
  return series.map((entry) => {
    const match = legend.find(
      (item) => item.label.toLowerCase() === entry.label.toLowerCase(),
    );
    return match ? { ...entry, color: match.color } : entry;
  });
}

export function MentalHealthSection() {
  const section = useSection("homepage.mental_health");
  const { mentalHealthLegend, research } = useSiteContent();
  const chartSeries = applyLegendColors(
    mergeResearchWithFallback(research).mentalHealth.series,
    mentalHealthLegend,
  );

  const headline =
    (section.headline as string) ?? "Behaviour & Mental Health";
  const body =
    (section.body as string) ??
    "Researchers continue to study how increased screen exposure may influence attention, behaviour and emotional wellbeing.";
  const cta = resolveResearchPageCta(
    section.cta as { label?: string; href?: string } | undefined,
  );

  return (
    <section
      className={`w-full bg-[#0b1e2e] py-16 max-lg:py-16 lg:py-24 ${RICH_TEXT_LINKS_LIGHT_CLASS}`}
    >
      <Container className="flex flex-col gap-10 max-lg:gap-8 lg:gap-12">
        <ScrollReveal className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center max-lg:gap-4 lg:gap-6">
          <DisplayHeading as="h2" className="text-gold-accent">
            <RichTextContent content={headline} inline />
          </DisplayHeading>
          <RichTextContent
            content={body}
            linkTone="light"
            className={`${sectionSubtextClass} text-white/70 sm:leading-[1.6]`}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.12} offset={32} className="flex w-full flex-col gap-12 max-lg:gap-10 lg:gap-16">
          <div className="flex flex-col gap-5 max-lg:gap-4 lg:gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3 max-lg:gap-x-5 sm:gap-x-8">
              {mentalHealthLegend.map((item) => (
                <div key={item.label} className="flex min-w-[9rem] items-center gap-2 sm:min-w-0">
                  <span
                    className="h-0.5 w-6 shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="text-base leading-snug text-white/55 max-lg:text-base lg:text-base">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative w-full overflow-x-auto pt-2 max-lg:-mx-1 max-lg:px-1 lg:overflow-hidden lg:pt-5">
              <ResearchMentalHealthChart
                series={chartSeries}
                variant="home"
                showLegend={false}
              />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="flex justify-center max-lg:px-2">
          <div className="inline-flex rounded-full bg-navy-50 px-4 py-2 lg:px-6 lg:py-3">
            <TextLink
              href={cta.href}
              variant="dark"
              className="text-sm lg:text-base"
            >
              {cta.label}
            </TextLink>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
