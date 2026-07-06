"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { Button } from "@/components/ui/Button";
import { useOptOut } from "@/components/opt-out/OptOutProvider";
import { RichTextContent } from "@/components/cms/RichTextContent";
import { RICH_TEXT_LINKS_LIGHT_CLASS } from "@/lib/cms/rich-text";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";

export function DeviceOptOutSection() {
  const { optOutSteps, media } = useSiteContent();
  const section = useSection("homepage.device_opt_out");
  const { openOptOut } = useOptOut();

  const headline = (section.headline as string) ?? "1 to 1 Device Opt Out";
  const body =
    (section.body as string) ??
    "Parents should have access to clear information and the ability to make informed decisions regarding classroom technology.";
  const primaryCta = (section.primaryCta as string) ?? "Sign Opt Out Letter";

  return (
    <section
      id="opt-out"
      className={`w-full bg-navy-700 py-16 max-lg:py-16 lg:py-24 ${RICH_TEXT_LINKS_LIGHT_CLASS}`}
    >
      <Container>
        <div className="flex w-full flex-col items-start justify-between gap-10 max-lg:gap-10 lg:flex-row lg:gap-12">
          <div className="flex flex-1 flex-col gap-8 max-lg:gap-7 lg:gap-8">
            <ScrollReveal className="flex flex-col gap-5 text-slate-50 max-lg:gap-4 lg:gap-6">
              <DisplayHeading as="h2" className="text-slate-50">
                <RichTextContent content={headline} inline linkTone="light" />
              </DisplayHeading>
              <RichTextContent
                content={body}
                linkTone="light"
                className={sectionSubtextClass}
              />
            </ScrollReveal>

            <ol className="flex flex-col">
              {optOutSteps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  as="li"
                  delay={0.08 + index * 0.1}
                  offset={20}
                  className={`flex gap-4 py-5 max-lg:gap-4 sm:gap-6 sm:py-6 ${
                    index < optOutSteps.length - 1
                      ? "border-b border-[#e9e6df]"
                      : ""
                  }`}
                >
                  <span className="w-6 shrink-0 font-sans text-base font-medium leading-none text-gold-accent">
                    {step.number}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-slate-50 sm:gap-2">
                    <p className="text-base font-semibold leading-snug sm:text-lg sm:leading-display">
                      <RichTextContent content={step.title} inline />
                    </p>
                    <RichTextContent
                      content={step.description}
                      linkTone="light"
                      className="text-base leading-relaxed sm:leading-snug lg:text-base"
                    />
                  </div>
                </ScrollReveal>
              ))}
            </ol>

            <ScrollReveal delay={0.35}>
              <Button onClick={() => openOptOut("device-opt-out-section")}>
                {primaryCta}
              </Button>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} offset={40} className="w-full max-lg:order-last lg:w-[42%]">
            <div className="relative mx-auto aspect-4/5 w-full max-w-md shrink-0 overflow-hidden rounded-lg max-lg:max-w-none lg:max-w-none">
              <ContentImage
                src={media.optOut.letterPreview}
                alt="Sample opt-out letter preview"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
