"use client";

import { useMemo } from "react";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TextLink } from "@/components/ui/TextLink";
import { RESEARCH_PAGE_CTA } from "@/lib/cms/site-ctas";
import {
  normalizeGoalSectionContent,
  resolveGoalFindings,
} from "@/lib/cms/goal-section-content";
import {
  isDeclineStat,
  parseWhatToDoPoint,
  type WhatToDoPoint,
} from "@/lib/cms/what-to-do-points";
import { useSection } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";

/** 4×3 bento on xl+ — spans must sum to 4 columns per row. Below xl: even 2-column grid. */
const BENTO_SPANS = [
  "xl:col-span-2",
  "xl:col-span-1",
  "xl:col-span-1",
  "xl:col-span-1",
  "xl:col-span-1",
  "xl:col-span-2",
  "xl:col-span-1",
  "xl:col-span-1",
  "xl:col-span-1",
  "xl:col-span-1",
] as const;

function BentoBullet({
  point,
  index,
}: {
  point: WhatToDoPoint;
  index: number;
}) {
  const decline = isDeclineStat(point.stat);
  const number = index + 1;

  return (
    <article className="flex h-full flex-col rounded-xl border border-navy-800/12 bg-white/95 p-4 sm:rounded-2xl sm:p-5 xl:p-5">
      <div className="flex min-h-0 flex-1 items-start gap-3 sm:gap-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-800/[0.07] font-sans text-base font-semibold tabular-nums leading-none text-navy-800"
          aria-hidden
        >
          {number}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5">
          <span className="font-sans text-base font-medium text-navy-800/70">
            {point.source}
          </span>

          {point.stat ? (
            <p
              className={cn(
                "text-pretty font-sans text-lg font-semibold leading-snug xl:text-xl xl:leading-snug",
                decline ? "text-red-900/90" : "text-navy-800",
              )}
            >
              {point.stat}
            </p>
          ) : null}

          <p className="text-pretty font-sans text-base leading-[1.65] text-navy-800/90">
            {point.body}
          </p>
        </div>
      </div>
    </article>
  );
}

export function GoalSection() {
  const rawSection = useSection("homepage.goal");
  const { label, tagline, body, points: rawPoints } =
    normalizeGoalSectionContent(rawSection);
  const points = resolveGoalFindings(rawPoints);

  const bullets = useMemo(
    () => points.map((point, index) => parseWhatToDoPoint(point, index)),
    [points],
  );

  return (
    <section
      id="what-to-do"
      className="relative z-30 w-full bg-[#faf8f2] py-14 sm:py-20 lg:py-24"
    >
      <Container className="relative flex flex-col">
        <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center max-lg:gap-4 lg:gap-4">
          <SectionLabel className="max-lg:tracking-[0.18em] lg:tracking-[0.25em]">
            {label}
          </SectionLabel>
          <h2 className="font-display text-[clamp(1.375rem,4.5vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-navy-800 lg:text-[clamp(1.5rem,3vw,2.25rem)]">
            {tagline}
          </h2>
          <p className={`${sectionSubtextClass} text-navy-800/80 sm:leading-[1.6]`}>
            {body}
          </p>
          <p className="font-sans text-base leading-relaxed text-navy-800/65 xl:hidden">
            Start at{" "}
            <span className="font-semibold text-navy-800">1</span> and read across
            each row.
          </p>
          <p className="hidden font-sans text-base leading-relaxed text-navy-800/65 xl:block">
            Start at{" "}
            <span className="font-semibold text-navy-800">1</span> and read left
            to right, row by row.
          </p>
        </header>

        <div className="mt-8 max-lg:mt-7 lg:mt-10">
          <ul
            className={cn(
              "grid grid-cols-1 gap-4 sm:gap-5",
              "md:grid-cols-2 md:gap-5",
              "xl:grid-cols-4 xl:gap-3",
            )}
            aria-label="Ten research findings, read in order from 1 to 10"
          >
            {bullets.map((point, index) => (
              <li
                key={`${point.source}-${index}`}
                className={cn(
                  "min-h-0 list-none",
                  BENTO_SPANS[index] ?? "xl:col-span-1",
                )}
              >
                <BentoBullet point={point} index={index} />
              </li>
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
