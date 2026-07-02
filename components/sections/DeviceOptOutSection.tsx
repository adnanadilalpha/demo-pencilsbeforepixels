"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useOptOut } from "@/components/opt-out/OptOutProvider";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { TextLink } from "@/components/ui/TextLink";
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
  const secondaryCta = (section.secondaryCta as { label: string; href: string }) ?? {
    label: "Explore Evidence",
    href: "/evidence",
  };

  return (
    <section id="opt-out" className="w-full bg-navy-700 py-24 max-lg:py-16">
      <Container>
        <div className="flex w-full flex-col items-start justify-between gap-12 max-lg:gap-8 lg:flex-row">
          <div className="flex flex-1 flex-col gap-8">
            <ScrollReveal className="flex flex-col gap-6 text-slate-50">
              <DisplayHeading as="h2" className="text-slate-50">
                {headline}
              </DisplayHeading>
              <p className="text-base leading-[1.4] sm:text-lg">{body}</p>
            </ScrollReveal>

            <ol className="flex flex-col">
              {optOutSteps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  as="li"
                  delay={0.08 + index * 0.1}
                  offset={20}
                  className={`flex gap-8 py-6 ${
                    index < optOutSteps.length - 1
                      ? "border-b border-[#e9e6df]"
                      : ""
                  }`}
                >
                  <span className="font-sans text-base font-medium leading-none text-gold-accent">
                    {step.number}
                  </span>
                  <div className="flex flex-col gap-2 text-slate-50">
                    <p className="text-lg font-semibold leading-display">
                      {step.title}
                    </p>
                    <p className="text-sm leading-snug">{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </ol>

            <ScrollReveal delay={0.35}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-8">
                <Button onClick={openOptOut}>{primaryCta}</Button>
                <TextLink href={secondaryCta.href}>{secondaryCta.label}</TextLink>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} offset={40} className="w-full max-lg:order-last lg:w-[42%]">
            <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-lg">
              <Image
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
