"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { ContentImage } from "@/components/ui/ContentImage";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { normalizeParentExperienceContent } from "@/lib/cms/parent-experience-content";
import { useSection } from "@/lib/cms/hooks";

export function ParentExperienceSection() {
  const section = useSection("homepage.parent_experience");
  const {
    headline,
    lead,
    moments,
    closing,
    authorName,
    authorRole,
    image,
    imageAlt,
  } = normalizeParentExperienceContent(section);

  const visibleMoments = moments.filter((moment) => moment.body.trim());

  if (!lead.trim() && visibleMoments.length === 0) return null;

  return (
    <section
      id="parent-experience"
      className="w-full bg-[#faf8f2] py-16 max-lg:py-16 lg:py-24"
    >
      <Container>
        <div className="flex w-full flex-col gap-10 max-lg:gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          <div className="flex min-w-0 flex-1 flex-col gap-8 max-lg:gap-7 lg:gap-8">
            <ScrollReveal className="flex flex-col gap-5 max-lg:gap-4 lg:gap-6">
              <DisplayHeading
                as="h2"
                className="uppercase text-navy-800 max-lg:leading-[1.08]"
              >
                <RichTextContent content={headline} inline />
              </DisplayHeading>
              {lead ? (
                <RichTextContent
                  content={lead}
                  splitPlainParagraphs
                  className={`${sectionSubtextClass} max-w-none space-y-4 text-pretty text-navy-800/80`}
                />
              ) : null}
            </ScrollReveal>

            {visibleMoments.length > 0 ? (
              <ol className="flex flex-col">
                {visibleMoments.map((moment, index) => (
                  <ScrollReveal
                    key={moment.number}
                    as="li"
                    delay={0.08 + index * 0.1}
                    offset={20}
                    className={`flex gap-3 py-5 max-lg:gap-3.5 sm:gap-6 sm:py-6 ${
                      index < visibleMoments.length - 1
                        ? "border-b border-navy-800/12"
                        : ""
                    }`}
                  >
                    <span className="w-7 shrink-0 font-sans text-sm font-medium leading-none text-gold-500 sm:w-10 sm:text-base">
                      {moment.number}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-navy-800 sm:gap-2">
                      {moment.title ? (
                        <p className="text-pretty text-base font-semibold leading-snug sm:text-lg sm:leading-display">
                          <RichTextContent content={moment.title} inline />
                        </p>
                      ) : null}
                      <RichTextContent
                        content={moment.body}
                        className="text-pretty text-base leading-relaxed text-navy-800/75 sm:leading-[1.55]"
                      />
                    </div>
                  </ScrollReveal>
                ))}
              </ol>
            ) : null}

            <ScrollReveal
              delay={0.35}
              className="border-t border-navy-800/12 pt-6 sm:pt-7"
            >
              <p className="text-pretty font-display text-[clamp(1.625rem,6vw,2.75rem)] leading-[1.12] text-navy-800">
                <RichTextContent content={closing} inline />
              </p>
              <div className="mt-4 flex flex-col gap-0.5 sm:mt-5 lg:hidden">
                <cite className="text-base font-semibold not-italic leading-display text-navy-800/90">
                  {authorName}
                </cite>
                {authorRole ? (
                  <p className="text-sm leading-snug text-navy-800/70 sm:text-base">
                    {authorRole}
                  </p>
                ) : null}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal
            delay={0.15}
            offset={40}
            className="w-full max-lg:order-first lg:sticky lg:top-28 lg:w-[min(100%,22rem)] lg:shrink-0 xl:w-[24rem]"
          >
            <figure className="mx-auto flex w-full max-w-[16.5rem] flex-col gap-3 sm:max-w-[18rem] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg">
                <ContentImage
                  src={image}
                  alt={imageAlt || authorName}
                  fill
                  className="object-cover object-[center_18%]"
                  sizes="(max-width: 1023px) 288px, 384px"
                />
              </div>
              <figcaption className="hidden flex-col gap-1 px-0.5 lg:flex">
                <cite className="text-base font-semibold not-italic leading-display text-navy-800/90">
                  {authorName}
                </cite>
                {authorRole ? (
                  <p className="text-base leading-snug text-navy-800/70">
                    {authorRole}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
