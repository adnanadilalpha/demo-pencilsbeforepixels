"use client";

import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { sectionPaddingX } from "@/components/ui/Container";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import type { ResearchNote } from "@/lib/cms/types";
import { youTubeUrlToId } from "@/lib/youtube";

function ResearchNoteBlock({ label, summary, note }: ResearchNote) {
  return (
    <div className="flex flex-col gap-3 border-t border-navy-800/10 pt-5 first:border-t-0 first:pt-0">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-gold-500">
        {label}
      </p>
      <p className="text-base leading-normal text-navy-800">{summary}</p>
      <p className="text-sm leading-[1.45] text-navy-800/65">{note}</p>
    </div>
  );
}

export function LearningAppsSection() {
  const section = useSection("homepage.learning_apps");
  const { softwareReviews } = useSiteContent();
  const { epic, ixl } = softwareReviews;

  const headline = (section.headline as string) ?? "IXL & Epic";
  const body =
    (section.body as string) ??
    "We reviewed two classroom platforms commonly used in schools.";
  const epicVideoId = youTubeUrlToId(epic.youtubeId);

  return (
    <section className="w-full bg-paper-300">
      <ScrollReveal className={`flex flex-col items-center gap-6 pb-12 pt-24 text-center max-lg:pb-12 max-lg:pt-16 ${sectionPaddingX}`}>
        <DisplayHeading as="h2" className="text-navy-800">
          {headline}
        </DisplayHeading>
        <p className="max-w-[500px] text-base leading-[1.4] text-navy-800 sm:text-lg lg:w-2/5">
          {body}
        </p>
      </ScrollReveal>

      <div className="grid w-full grid-cols-1 border-t border-navy-800 lg:grid-cols-2">
        <ScrollReveal
          as="article"
          delay={0.1}
          className={`flex flex-col gap-8 py-12 max-lg:py-8 ${sectionPaddingX}`}
        >
          <DisplayHeading as="h3" size="md" className="text-navy-800">
            {ixl.title}
          </DisplayHeading>

          <div className="flex flex-col gap-5 rounded-sm bg-paper-50 p-6 shadow-[0_1px_3px_rgba(10,22,40,0.08)] ring-1 ring-navy-800/8">
            {ixl.vendorResearch && <ResearchNoteBlock {...ixl.vendorResearch} />}
            {ixl.independentResearch && (
              <ResearchNoteBlock {...ixl.independentResearch} />
            )}
          </div>

          {ixl.referencesNote && (
            <p className="text-base leading-[1.4] text-navy-800">
              {ixl.referencesNote}
            </p>
          )}
        </ScrollReveal>

        <ScrollReveal
          as="article"
          delay={0.18}
          className={`flex flex-col gap-8 border-t border-navy-800 py-12 max-lg:py-8 lg:border-t-0 lg:border-l ${sectionPaddingX}`}
        >
          <DisplayHeading as="h3" size="md" className="text-navy-800">
            {epic.title}
          </DisplayHeading>
          {epicVideoId ? (
            <YouTubeEmbed
              videoId={epicVideoId}
              title="Epic reading platform review"
            />
          ) : null}
          {epic.summary && (
            <p className="text-base leading-[1.4] text-navy-800">{epic.summary}</p>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
