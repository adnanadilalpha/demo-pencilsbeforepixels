"use client";

import { AudioReviewPlayer } from "@/components/ui/AudioReviewPlayer";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { epicReviewContent } from "@/lib/cms/fallback-data";
import { youTubeUrlToId } from "@/lib/youtube";

export function LearningAppsSection() {
  const section = useSection("homepage.learning_apps");
  const { softwareReviews } = useSiteContent();
  const { epic } = softwareReviews;

  const headline = (section.headline as string) ?? "Epic Reading Platform";
  const body =
    (section.body as string) ??
    "A closer look at how Epic works, what behaviours it encourages, and how it compares with current research on reading comprehension and screen-based learning.";
  const epicVideoId = youTubeUrlToId(epic.youtubeId);
  const audioSrc = epic.audioSrc ?? epicReviewContent.audioSrc;

  return (
    <section className="w-full bg-paper-300 py-20 max-lg:py-16">
      <Container className="flex flex-col gap-10 lg:gap-14">
        <ScrollReveal className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <SectionLabel className="text-gold-500">Platform Review</SectionLabel>
          <DisplayHeading as="h2" className="text-navy-800">
            {headline}
          </DisplayHeading>
          <p className="text-base leading-relaxed text-navy-800/80 sm:text-lg">
            {body}
          </p>
          <p className="rounded-full border border-navy-800/10 bg-paper-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-navy-800/70 lg:text-base">
            Watch the review or listen on the go
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="article"
          delay={0.1}
          className="overflow-hidden rounded-2xl border border-navy-800/10 bg-paper-50 shadow-[0_8px_32px_rgba(15,31,61,0.08)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
            <div className="relative min-h-[56.25vw] bg-black lg:min-h-0 lg:h-full">
              {epicVideoId ? (
                <YouTubeEmbed
                  fill
                  videoId={epicVideoId}
                  title={`${epic.title} reading platform review`}
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-white/70 lg:text-base">
                  Video review coming soon
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-navy-800/10 p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
              <div className="flex flex-col gap-3">
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-gold-500 lg:text-base">
                  Featured review
                </p>
                <DisplayHeading as="h3" size="md" className="text-navy-800">
                  {epic.title}
                </DisplayHeading>
              </div>

              {epic.summary ? (
                <p className="text-base leading-relaxed text-navy-800/85 sm:text-[17px] sm:leading-[1.55]">
                  {epic.summary}
                </p>
              ) : null}

              {audioSrc ? (
                <AudioReviewPlayer
                  src={audioSrc}
                  title={`${epic.title} review`}
                  label="Listen instead"
                  variant="light"
                />
              ) : null}

              <p className="text-sm leading-relaxed text-navy-800/60 lg:text-base">
                Prefer audio? Play the review above while commuting or between
                meetings — the same analysis as the video, in podcast form.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
