"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RichTextContent } from "@/components/cms/RichTextContent";
import { EvidenceResearchTab } from "@/components/evidence/research/EvidenceResearchTab";
import { contentMaxWidthClass, sectionPaddingX } from "@/components/ui/Container";
import { useSection } from "@/lib/cms/hooks";
import { buildFallbackSiteContent } from "@/lib/cms/fallback";

const PAGE_HEADER_FALLBACK =
  buildFallbackSiteContent().sections["evidence.research_tab"] ?? {};

export function ResearchPage() {
  const pageHeader = useSection("evidence.research_tab");
  const title =
    typeof pageHeader.title === "string" && pageHeader.title.trim()
      ? pageHeader.title
      : typeof PAGE_HEADER_FALLBACK.title === "string"
        ? PAGE_HEADER_FALLBACK.title
        : "Research";
  const subtitle =
    typeof pageHeader.subtitle === "string" && pageHeader.subtitle.trim()
      ? pageHeader.subtitle
      : typeof PAGE_HEADER_FALLBACK.subtitle === "string"
        ? PAGE_HEADER_FALLBACK.subtitle
        : "";

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
              <RichTextContent content={title} inline />
            </h1>
            {subtitle ? (
              <RichTextContent
                content={subtitle}
                className="max-w-3xl text-base leading-snug text-[#6b7280] lg:text-[17px] lg:leading-[1.55]"
              />
            ) : null}
          </div>
        </div>
      </div>

      <EvidenceResearchTab />
    </div>
  );
}
