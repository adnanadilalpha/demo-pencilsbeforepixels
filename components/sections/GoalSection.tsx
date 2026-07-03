"use client";

import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TextLink } from "@/components/ui/TextLink";
import {
  buildEvidenceStoryChapters,
  isDeclineStat,
  whatToDoPoints,
  type WhatToDoPoint,
} from "@/lib/cms/what-to-do-points";
import { useSection } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";

function resolvePoints(sectionPoints: unknown): string[] {
  if (!Array.isArray(sectionPoints)) {
    return [...whatToDoPoints];
  }

  const filtered = sectionPoints.filter(
    (point): point is string => typeof point === "string" && point.trim().length > 0,
  );

  return filtered.length > 0 ? filtered : [...whatToDoPoints];
}

function EvidenceSourceBadge({ source }: { source: WhatToDoPoint["source"] }) {
  return (
    <span className="inline-flex items-center rounded-full border border-navy-800/10 bg-navy-50 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-navy-800/55 lg:text-base">
      {source}
    </span>
  );
}

function EvidencePointCard({
  point,
  index,
  isLast,
}: {
  point: WhatToDoPoint;
  index: number;
  isLast: boolean;
}) {
  const decline = isDeclineStat(point.stat);
  const number = String(index + 1).padStart(2, "0");

  return (
    <li className="relative list-none pl-8 sm:pl-10">
      <span
        className="absolute left-0 top-6 size-2.5 -translate-x-1/2 rounded-full border-2 border-gold-500 bg-[#faf8f2] sm:top-7"
        aria-hidden
      />
      {!isLast ? (
        <span
          className="absolute bottom-0 left-0 top-8 w-px -translate-x-1/2 bg-gradient-to-b from-gold-500/45 via-gold-500/20 to-transparent sm:top-9"
          aria-hidden
        />
      ) : null}

      <article className="group relative rounded-xl border border-navy-800/8 bg-white/80 p-4 shadow-[0_12px_40px_-28px_rgba(15,31,61,0.35)] transition-[border-color,background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gold-500/25 hover:bg-white hover:shadow-[0_18px_48px_-24px_rgba(15,31,61,0.22)] sm:p-5 lg:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <EvidenceSourceBadge source={point.source} />
          <span
            className="font-display text-sm leading-none tracking-tight text-navy-800/16 transition-colors duration-500 group-hover:text-gold-500/35"
            aria-hidden
          >
            {number}
          </span>
        </div>

        {point.stat ? (
          <p
            className={cn(
              "font-display text-[clamp(1.5rem,3vw,2rem)] leading-[1.05] tracking-[-0.03em]",
              decline ? "text-red-900" : "text-navy-800",
            )}
          >
            {point.stat}
          </p>
        ) : null}

        <p
          className={cn(
            "text-[15px] leading-[1.7] text-navy-800/76 sm:text-base sm:leading-[1.65]",
            point.stat ? "mt-3" : "",
          )}
        >
          {point.body}
        </p>
      </article>
    </li>
  );
}

function EvidenceStoryChapter({
  chapter,
  startIndex,
}: {
  chapter: ReturnType<typeof buildEvidenceStoryChapters>[number];
  startIndex: number;
}) {
  return (
    <ScrollReveal offset={24} className="relative">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4 lg:mb-10">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-display text-3xl leading-none tracking-tight text-gold-500/35 sm:text-4xl">
            {chapter.number}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl leading-tight tracking-[-0.02em] text-navy-800 sm:text-2xl">
              {chapter.title}
            </h3>
          </div>
        </div>
        <p className="max-w-2xl text-[15px] leading-[1.65] text-navy-800/62 sm:text-base sm:leading-[1.6]">
          {chapter.lead}
        </p>
      </div>

      <ol className="relative flex flex-col gap-4 sm:gap-5">
        {chapter.points.map((point, index) => (
          <EvidencePointCard
            key={`${chapter.id}-${index}`}
            point={point}
            index={startIndex + index}
            isLast={index === chapter.points.length - 1}
          />
        ))}
      </ol>
    </ScrollReveal>
  );
}

export function GoalSection() {
  const section = useSection("homepage.goal");

  const label = (section.label as string) ?? "The Evidence";
  const tagline =
    (section.tagline as string) ??
    "From NAEP to PISA, the pattern is consistent — more classroom screen time, weaker outcomes.";
  const points = resolvePoints(section.points);
  const chapters = buildEvidenceStoryChapters(points);

  let runningIndex = 0;

  return (
    <section
      id="what-to-do"
      className="relative z-30 w-full overflow-hidden bg-[#faf8f2] py-16 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,162,39,0.07),transparent_55%)]"
        aria-hidden
      />

      <Container className="relative">
        <header className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center lg:mb-16">
          <SectionLabel className="tracking-[0.25em]">{label}</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.15] tracking-[-0.02em] text-navy-800">
            {tagline}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-navy-800/62 sm:text-base sm:leading-[1.6]">
            {points.length} findings from national assessments and international
            studies — grouped so you can follow the story from U.S. classrooms to
            OECD nations and back to early childhood.
          </p>
          <div
            className="mt-7 flex w-full max-w-[7rem] items-center gap-3"
            aria-hidden
          >
            <span className="h-px flex-1 bg-navy-800/10" />
            <span className="size-1 shrink-0 rounded-full bg-gold-500" />
            <span className="h-px flex-1 bg-navy-800/10" />
          </div>
        </header>

        <div className="mx-auto flex max-w-3xl flex-col gap-14 lg:gap-20">
          {chapters.map((chapter) => {
            const startIndex = runningIndex;
            runningIndex += chapter.points.length;

            return (
              <EvidenceStoryChapter
                key={chapter.id}
                chapter={chapter}
                startIndex={startIndex}
              />
            );
          })}
        </div>

        <footer className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 border-t border-navy-800/8 pt-8 sm:flex-row sm:justify-between sm:gap-6 lg:mt-20 lg:pt-10">
          <p className="text-center font-sans text-[11px] uppercase tracking-[0.2em] text-navy-800/38 sm:text-left lg:text-base">
            NAEP · PISA · TIMSS · PIRLS · OECD
          </p>
          <TextLink href="/research" variant="dark">
            Explore the full research
          </TextLink>
        </footer>
      </Container>
    </section>
  );
}
