"use client";

import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection } from "@/lib/cms/hooks";

export function GoalSection() {
  const section = useSection("homepage.goal");

  const label = (section.label as string) ?? "What to do";
  const tagline =
    (section.tagline as string) ??
    "Focus over distraction and cognitive friction over swiping.";
  const goalTitle = (section.goalTitle as string) ?? "The Goal";
  const goalBody = (section.goalBody as string) ?? "";
  const solutionTitle = (section.solutionTitle as string) ?? "The Solution";
  const solutionBody = (section.solutionBody as string) ?? "";

  return (
    <section id="mission" className="w-full bg-[#faf8f2] py-24 max-lg:py-16">
      <Container className="flex flex-col items-center gap-12 max-lg:gap-12">
        <ScrollReveal className="flex flex-col items-center gap-6">
          <SectionLabel className="tracking-[0.25em]">{label}</SectionLabel>
          <p className="text-center font-sans text-2xl leading-[1.3] text-navy-800 sm:text-3xl lg:w-4/5 lg:text-[46px] lg:leading-none">
            {tagline}
          </p>
        </ScrollReveal>

        <div className="grid w-full grid-cols-1 gap-12 max-lg:gap-12 lg:grid-cols-2">
          <ScrollReveal delay={0.1} offset={36}>
            <div className="flex h-full flex-col gap-6 rounded-lg bg-overlay p-8">
              <DisplayHeading as="h3" size="sm" className="text-gold-accent uppercase">
                {goalTitle}
              </DisplayHeading>
              <p className="text-base font-medium leading-[1.4] text-slate-50 sm:text-lg lg:text-xl">
                {goalBody}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} offset={36}>
            <div className="flex h-full flex-col gap-4 rounded-lg border-l-[3.65px] border-gold-accent bg-[#18263a] p-8 shadow-[0_20px_60px_rgba(24,38,58,0.12)]">
              <DisplayHeading as="h3" size="sm" className="text-gold-accent uppercase">
                {solutionTitle}
              </DisplayHeading>
              <p className="text-base font-medium leading-[1.4] text-white sm:text-lg lg:text-xl">
                {solutionBody}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
