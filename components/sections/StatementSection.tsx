"use client";

import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection } from "@/lib/cms/hooks";

export function StatementSection() {
  const section = useSection("homepage.problem");

  const label = (section.label as string) ?? "The Problem";
  const headline = (section.headline as string) ?? "The Classroom Has Changed.";
  const body =
    (section.body as string) ??
    "Instinctively, many parents and teachers feel something has changed.";

  return (
    <section className="w-full bg-hero-dark py-24 max-lg:py-16">
      <Container className="flex flex-col items-center gap-6 text-center">
        <ScrollReveal>
          <SectionLabel variant="gold" className="tracking-[0.25em]">
            {label}
          </SectionLabel>
        </ScrollReveal>
        <ScrollReveal delay={0.08} className="flex w-full flex-col items-center gap-4 lg:w-4/5">
          <DisplayHeading
            as="h2"
            className="leading-[1.3] tracking-[-0.02em] text-slate-50"
          >
            {headline}
          </DisplayHeading>
          <p className="w-full text-base leading-[1.4] text-slate-50 sm:text-lg">
            {body}
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
