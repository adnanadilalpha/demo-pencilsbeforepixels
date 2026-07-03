"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EvidenceResearchTab } from "@/components/evidence/research/EvidenceResearchTab";
import { contentMaxWidthClass, sectionPaddingX } from "@/components/ui/Container";
import { useSection } from "@/lib/cms/hooks";

export function ResearchPage() {
  const researchSection = useSection("evidence.research_tab");

  const title = (researchSection.title as string) ?? "Research";
  const subtitle =
    (researchSection.subtitle as string) ??
    "Findings from NAEP, PISA, TIMSS, PIRLS and peer-reviewed research — documenting the relationship between digital device use and academic performance across the United States and internationally.";

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div
        className={`${sectionPaddingX} bg-paper-50 pb-4 pt-8 sm:pb-5 sm:pt-10 lg:pb-6 lg:pt-12`}
      >
        <div
          className={`${contentMaxWidthClass} mx-auto flex flex-col gap-8 lg:gap-12`}
        >
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium leading-[18px] text-navy-800 transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} />
              Back
            </Link>
            <div className="h-[18px] w-px bg-[#e9e6df]" aria-hidden />
          </div>

          <div className="flex flex-col gap-4 pb-2">
            <h1 className="font-display text-[32px] leading-display text-[#18263a] sm:text-[40px] lg:text-[48px]">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-snug text-[#6b7280] lg:text-[17px] lg:leading-[1.55]">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <EvidenceResearchTab />
    </div>
  );
}
