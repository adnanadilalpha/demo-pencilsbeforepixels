"use client";

import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection } from "@/lib/cms/hooks";

export function AcademicDataIntro() {
  const section = useSection("homepage.academic_data");

  const label = (section.label as string) ?? "Academic Data";
  const headline = (section.headline as string) ?? label;
  const body =
    (section.body as string) ??
    "Explore international, national, state and district data through interactive charts and supporting research.";

  return (
    <ScrollReveal className="flex flex-col gap-6">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.24em] text-gold-accent lg:text-base">
        {label}
      </p>
      <DisplayHeading as="h2" className="text-white">
        {headline}
      </DisplayHeading>
      <p className="text-base leading-[1.4] text-white/70 sm:text-lg">
        {body}
      </p>
    </ScrollReveal>
  );
}
