"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { ContentImage } from "@/components/ui/ContentImage";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";

export function ExpertQuotesSection() {
  const section = useSection("homepage.expert_voices");
  const { expertQuotes } = useSiteContent();
  const headline = (section.headline as string) ?? "What the Expert says";

  return (
    <section className="w-full bg-paper-50 py-16 max-lg:py-16 lg:py-24">
      <Container>
        <div className="flex flex-col gap-10 max-lg:gap-10 lg:gap-12">
          <ScrollReveal>
            <DisplayHeading
              as="h2"
              className="uppercase text-navy-800 max-lg:leading-[1.08]"
            >
              <RichTextContent content={headline} inline />
            </DisplayHeading>
          </ScrollReveal>

          <div className="flex flex-col gap-10 max-lg:gap-10 lg:gap-12">
            {expertQuotes.map((expert, index) => (
              <ScrollReveal
                key={expert.number}
                as="article"
                delay={index * 0.08}
                offset={36}
                className="relative flex flex-col gap-4 border-b-[0.52px] border-navy-800 pb-6 max-lg:gap-5 lg:flex-row lg:items-start lg:gap-16 lg:pb-4"
              >
                <p className="shrink-0 font-sans text-xl leading-none text-navy-800/70 max-lg:text-2xl lg:text-[32px]">
                  {expert.number}
                </p>

                <div className="relative min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_140px] lg:items-start lg:gap-12">
                  <div className="min-w-0">
                    <blockquote className="text-xl leading-[1.35] tracking-[-0.01em] text-navy-800 max-lg:text-[clamp(1.125rem,3.8vw,1.5rem)] md:text-2xl md:leading-[1.32] lg:text-[32px] lg:leading-[1.3]">
                      &ldquo;
                      <RichTextContent content={expert.quote} inline />
                      &rdquo;
                    </blockquote>

                    <div
                      className={`flex flex-col gap-2 max-lg:gap-2.5 ${
                        index === 0 ? "mt-5 max-lg:mt-6 lg:mt-6" : "mt-6 max-lg:mt-7 lg:mt-7"
                      }`}
                    >
                      <cite className="text-base font-semibold not-italic leading-display text-navy-800/90">
                        {expert.name}
                      </cite>
                      <p className="text-base leading-snug text-navy-800/70">
                        <RichTextContent content={expert.title} inline />
                      </p>
                    </div>
                  </div>

                  {expert.image ? (
                    <div className="relative mt-5 h-32 w-28 shrink-0 overflow-hidden rounded-sm max-lg:mt-6 sm:h-36 sm:w-32 lg:mt-0 lg:h-[164px] lg:w-[140px] lg:justify-self-end">
                      <ContentImage
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1023px) 128px, 140px"
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
