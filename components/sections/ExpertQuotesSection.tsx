"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";

export function ExpertQuotesSection() {
  const section = useSection("homepage.expert_voices");
  const { expertQuotes } = useSiteContent();
  const headline = (section.headline as string) ?? "What the Expert says";

  return (
    <section className="w-full bg-paper-50 py-24 max-lg:py-16">
      <Container>
        <div className="flex flex-col gap-12 max-lg:gap-12">
          <ScrollReveal>
            <DisplayHeading
              as="h2"
              className="uppercase text-navy-800"
            >
              {headline}
            </DisplayHeading>
          </ScrollReveal>

          <div className="flex flex-col gap-12">
            {expertQuotes.map((expert, index) => (
              <ScrollReveal
                key={expert.number}
                as="article"
                delay={index * 0.08}
                offset={36}
                className="relative flex flex-col gap-4 border-b-[0.52px] border-navy-800 pb-4 md:flex-row md:items-start md:gap-8 lg:gap-16"
              >
                <p className="shrink-0 font-sans text-xl leading-none text-navy-800/70 md:text-2xl lg:text-[32px]">
                  {expert.number}
                </p>

                <div className="relative min-w-0 flex-1 md:pr-[100px] xl:grid xl:grid-cols-[minmax(0,1fr)_140px] xl:items-start xl:gap-12 xl:pr-0">
                  <div className="min-w-0">
                    <blockquote className="text-fluid-quote leading-[1.3] tracking-[-0.01em] text-navy-800 lg:text-[36px]">
                      &ldquo;{expert.quote}&rdquo;
                    </blockquote>

                    <div
                      className={`flex flex-col gap-3 ${
                        index === 0 ? "mt-6" : "mt-7"
                      }`}
                    >
                      <cite className="text-lg font-semibold not-italic leading-display text-navy-800/90">
                        {expert.name}
                      </cite>
                      <p className="text-sm leading-snug text-navy-800/70">
                        {expert.title}
                      </p>
                    </div>
                  </div>

                  {expert.image ? (
                    <div className="relative mt-6 h-28 w-24 shrink-0 overflow-hidden rounded-sm md:absolute md:right-0 md:top-6 md:mt-0 md:h-[96px] md:w-[82px] xl:relative xl:mt-0 xl:h-[164px] xl:w-[140px] xl:justify-self-end">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 767px) 96px, (max-width: 1279px) 82px, 140px"
                        unoptimized
                      />
                    </div>
                  ) : null}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
