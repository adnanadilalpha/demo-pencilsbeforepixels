"use client";

import { useMemo } from "react";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { TextLink } from "@/components/ui/TextLink";
import { RESEARCH_PAGE_CTA } from "@/lib/cms/site-ctas";
import {
  normalizeGoalSectionContent,
  resolveGoalFindingItems,
  type GoalFinding,
} from "@/lib/cms/goal-section-content";
import { useSection } from "@/lib/cms/hooks";

function FindingChip({
  finding,
  index,
}: {
  finding: GoalFinding;
  index: number;
}) {
  const number = index + 1;

  return (
    <li className="list-none">
      <article className="flex h-full flex-col gap-1.5 rounded-2xl border border-navy-800/12 bg-white/95 p-3.5 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-2.5">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-800/[0.07] font-sans text-[11px] font-semibold tabular-nums leading-none text-navy-800 sm:size-7 sm:text-xs"
            aria-hidden
          >
            {number}
          </span>

          {finding.headline ? (
            <h3 className="min-w-0 flex-1 text-pretty font-sans text-base font-semibold leading-snug text-navy-800 sm:text-lg sm:leading-snug">
              <span className="sr-only">{`Finding ${number}. `}</span>
              {finding.headline}
            </h3>
          ) : (
            <span className="sr-only">{`Finding ${number}`}</span>
          )}
        </div>

        {finding.body ? (
          <p className="text-pretty font-sans text-sm leading-[1.55] text-navy-800/85 sm:text-[0.9375rem] sm:leading-[1.6]">
            {finding.body}
          </p>
        ) : null}
      </article>
    </li>
  );
}

export function GoalSection() {
  const rawSection = useSection("homepage.goal");
  const { tagline, body, findings: rawFindings } =
    normalizeGoalSectionContent(rawSection);
  const findings = resolveGoalFindingItems(rawFindings);

  const bullets = useMemo(() => findings, [findings]);

  return (
    <section
      id="what-to-do"
      className="relative z-30 w-full bg-[#faf8f2] py-14 sm:py-20 lg:py-24"
    >
      <Container className="relative flex flex-col">
        <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center max-lg:gap-4 lg:gap-4">
          <DisplayHeading as="h2" className="text-gold-accent" size="md">
            {tagline}
          </DisplayHeading>
          <p className={`${sectionSubtextClass} text-navy-800/80 sm:leading-[1.6]`}>
            {body}
          </p>
        </header>

        <div className="mx-auto mt-8 w-full max-w-3xl max-lg:mt-7 lg:mt-10">
          <ul
            className="flex flex-col gap-3 sm:gap-3.5"
            aria-label="Ten research findings, read in order from 1 to 10"
          >
            {bullets.map((finding, index) => (
              <FindingChip
                key={`${finding.headline}-${index}`}
                finding={finding}
                index={index}
              />
            ))}
          </ul>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-navy-800/10 pt-6 text-center max-lg:gap-5 sm:flex-row sm:text-left lg:mt-12">
          <p className="font-sans text-base text-navy-800/60 max-lg:max-w-md">
            Sources: NAEP, PISA, TIMSS, PIRLS, OECD
          </p>
          <TextLink href={RESEARCH_PAGE_CTA.href} variant="dark" className="text-base">
            {RESEARCH_PAGE_CTA.label}
          </TextLink>
        </footer>
      </Container>
    </section>
  );
}
