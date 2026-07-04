"use client";

import { AudioReviewPlayer } from "@/components/ui/AudioReviewPlayer";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { epicReviewContent } from "@/lib/cms/fallback-data";
import { youTubeUrlToId } from "@/lib/youtube";

function readSectionText(
  section: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = section[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function LearningAppsSection() {
  const section = useSection("homepage.learning_apps");
  const { softwareReviews } = useSiteContent();
  const { epic } = softwareReviews;

  const headline = (section.headline as string) ?? epic.title ?? "Epic";
  const body =
    (section.body as string) ??
    "A closer look at how Epic works, what behaviours it encourages, and how it compares with current research on reading comprehension and screen-based learning.";
  const epicVideoId = youTubeUrlToId(epic.youtubeId);
  const audioSrc =
    readSectionText(section, "audioSrc") ??
    epic.audioSrc ??
    epicReviewContent.audioSrc;
  const audioTitle =
    readSectionText(section, "audioTitle") ??
    epic.audioTitle ??
    epicReviewContent.audioTitle;
  const audioDescription =
    readSectionText(section, "audioDescription") ??
    (epic.audioDescription?.trim() ||
      epic.summary?.trim() ||
      epicReviewContent.audioDescription?.trim() ||
      undefined);

  return (
    <section className="w-full bg-paper-300 py-16 max-lg:py-16 lg:py-20">
      <Container className="flex flex-col gap-10 max-lg:gap-10 lg:gap-16">
        <ScrollReveal className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center max-lg:gap-4 lg:gap-5">
          <DisplayHeading as="h2" className="text-navy-800">
            {headline}
          </DisplayHeading>
          <p className={`${sectionSubtextClass} text-navy-800/85 sm:leading-[1.6]`}>
            {body}
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="article"
          delay={0.08}
          className="overflow-hidden rounded-xl border border-navy-800/10 bg-paper-50 shadow-[0_8px_32px_rgba(15,31,61,0.08)] max-lg:rounded-2xl lg:rounded-2xl"
        >
          <div className="relative aspect-video w-full bg-black">
            {epicVideoId ? (
              <YouTubeEmbed
                fill
                videoId={epicVideoId}
                title={`${epic.title} reading platform review`}
              />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-white/70 sm:text-base">
                Video review coming soon
              </div>
            )}
          </div>
        </ScrollReveal>

        {audioSrc ? (
          <ScrollReveal delay={0.16}>
            <AudioReviewPlayer
              src={audioSrc}
              title={audioTitle}
              label="Audio review"
              description={audioDescription}
              layout="featured"
            />
          </ScrollReveal>
        ) : null}
      </Container>
    </section>
  );
}
