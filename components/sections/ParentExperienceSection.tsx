"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { ContentImage } from "@/components/ui/ContentImage";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { isRichTextHtml, splitPlainTextParagraphs } from "@/lib/cms/rich-text";
import { normalizeParentExperienceContent } from "@/lib/cms/parent-experience-content";
import { useSection } from "@/lib/cms/hooks";

function collectLetterParagraphs(lead: string, momentBodies: string[]): string[] {
  const blocks: string[] = [];

  if (lead.trim()) {
    if (isRichTextHtml(lead)) {
      blocks.push(lead.trim());
    } else {
      blocks.push(...splitPlainTextParagraphs(lead));
    }
  }

  for (const body of momentBodies) {
    const trimmed = body.trim();
    if (!trimmed) continue;
    if (isRichTextHtml(trimmed)) {
      blocks.push(trimmed);
    } else {
      blocks.push(...splitPlainTextParagraphs(trimmed));
    }
  }

  return blocks;
}

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

  const letterBlocks = collectLetterParagraphs(
    lead,
    moments.map((moment) => moment.body),
  );

  if (letterBlocks.length === 0) return null;

  const credit = [authorName, authorRole].filter(Boolean).join(", ");

  return (
    <section
      id="parent-experience"
      className="w-full bg-[#faf8f2] py-16 max-lg:py-16 lg:py-24"
    >
      <Container>
        <div className="flex w-full flex-col gap-10 max-lg:gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          <div className="flex min-w-0 flex-1 flex-col gap-8 max-lg:gap-7 lg:gap-10">
            <ScrollReveal>
              <DisplayHeading
                as="h2"
                className="uppercase text-navy-800 max-lg:leading-[1.08]"
              >
                <RichTextContent content={headline} inline />
              </DisplayHeading>
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="flex flex-col gap-5 sm:gap-6">
              {letterBlocks.map((block, index) => (
                <RichTextContent
                  key={`${index}-${block.slice(0, 40)}`}
                  content={block}
                  splitPlainParagraphs={!isRichTextHtml(block)}
                  className={`${sectionSubtextClass} max-w-none text-pretty text-navy-800/82`}
                />
              ))}
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="flex flex-col gap-4 sm:gap-5">
              <p className="text-pretty font-display text-[clamp(1.625rem,6vw,2.75rem)] leading-[1.12] text-navy-800">
                <RichTextContent content={closing} inline />
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal
            delay={0.15}
            offset={40}
            className="w-full lg:sticky lg:top-28 lg:w-[min(100%,22rem)] lg:shrink-0 xl:w-[24rem]"
          >
            <figure className="mx-auto flex w-full max-w-[16.5rem] flex-col gap-3 sm:max-w-[18rem] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg">
                <ContentImage
                  src={image}
                  alt={imageAlt || authorName || "Parent portrait"}
                  fill
                  className="object-cover object-[center_18%]"
                  sizes="(max-width: 1023px) 288px, 384px"
                />
              </div>
              {credit ? (
                <figcaption className="px-0.5">
                  <cite className="text-base font-semibold not-italic leading-display text-navy-800/90">
                    {credit}
                  </cite>
                </figcaption>
              ) : null}
            </figure>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
