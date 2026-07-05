"use client";

import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { normalizeBeforeOptOutContent } from "@/lib/cms/before-opt-out-content";
import { useSection } from "@/lib/cms/hooks";

export function BeforeOptOutSection() {
  const section = useSection("homepage.before_opt_out");
  const legacySection = useSection("homepage.device_opt_out");
  const {
    reflectionTitle,
    reflectionQuestions,
    reflectionConclusion,
    reflectionCallToAction,
  } = normalizeBeforeOptOutContent(section, legacySection);

  const questions = reflectionQuestions.filter(Boolean);
  if (questions.length === 0) return null;

  return (
    <section
      id="before-opt-out"
      className="w-full bg-[#faf8f2] py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="mx-auto flex w-full max-w-4xl flex-col">
          <ScrollReveal>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] text-navy-800">
              {reflectionTitle}
            </h2>
          </ScrollReveal>

          <ol className="mt-10 flex flex-col gap-8 sm:mt-12 sm:gap-10 lg:gap-12">
            {questions.map((question, index) => (
              <ScrollReveal
                key={`${index}-${question.slice(0, 24)}`}
                as="li"
                delay={0.05 + index * 0.06}
                className="list-none"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
                  <span
                    className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none text-gold-accent/90"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 flex-1 text-pretty font-display text-[clamp(1.5rem,3.2vw,2.375rem)] leading-[1.18] text-navy-800">
                    <span className="sr-only">{`Question ${index + 1}. `}</span>
                    {question}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </ol>

          <ScrollReveal delay={0.28} className="mt-12 border-t border-navy-800/10 pt-8 sm:mt-14 sm:pt-10">
            <div className="flex max-w-3xl flex-col gap-4 sm:gap-5">
              <p className="text-pretty text-[clamp(1.125rem,2.2vw,1.625rem)] font-semibold leading-snug text-navy-800">
                {reflectionConclusion}
              </p>
              <p className="text-pretty text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-navy-800/78">
                {reflectionCallToAction}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
