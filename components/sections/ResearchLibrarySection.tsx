"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import type { LibraryCategory, LibraryItem } from "@/lib/cms/types";

const cardFrameClassName =
  "relative aspect-square w-full overflow-hidden rounded-xl border border-[rgba(220,218,212,0.3)] bg-overlay p-[15%] shadow-[0_10px_15px_-3px_rgba(24,38,58,0.05),0_4px_6px_-4px_rgba(24,38,58,0.05)]";

function PaperPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 rounded-sm border border-white/10 bg-white/4 px-5 py-6">
      <div className="h-1 w-2/3 rounded-full bg-white/25" />
      <div className="h-1 w-full rounded-full bg-white/12" />
      <div className="h-1 w-full rounded-full bg-white/12" />
      <div className="h-1 w-4/5 rounded-full bg-white/12" />
      <div className="mt-2 h-1 w-1/2 rounded-full bg-white/8" />
    </div>
  );
}

function VideoPlaceholder({ playIcon }: { playIcon: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-white/4">
      <span className="flex size-[60px] items-center justify-center rounded-full border-[1.5px] border-gold-accent/40 bg-gold-accent/8">
        <Image
          src={playIcon}
          alt=""
          width={22}
          height={22}
          className="ml-0.5"
          aria-hidden
        />
      </span>
    </div>
  );
}

function ResourcePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border border-white/10 bg-white/4 px-5 py-6">
      <div className="h-10 w-8 rounded-sm border border-white/20 bg-white/6" />
      <div className="h-1 w-2/3 rounded-full bg-white/15" />
      <div className="h-1 w-1/2 rounded-full bg-white/10" />
    </div>
  );
}

function LibraryMedia({
  item,
  playIcon,
}: {
  item: LibraryItem;
  playIcon: string;
}) {
  if (item.kind === "book" && item.image) {
    return (
      <div className={cardFrameClassName}>
        <div className="relative h-full w-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>
      </div>
    );
  }

  if (item.kind === "resource" && item.image) {
    return (
      <div className={cardFrameClassName}>
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cardFrameClassName}>
      {item.kind === "paper" && <PaperPlaceholder />}
      {item.kind === "video" && <VideoPlaceholder playIcon={playIcon} />}
      {item.kind === "resource" && <ResourcePlaceholder />}
    </div>
  );
}

function LibraryCard({
  item,
  playIcon,
}: {
  item: LibraryItem;
  playIcon: string;
}) {
  return (
    <article className="timeline-snap-slide flex w-[200px] shrink-0 flex-col gap-5 md:flex-1 md:gap-6 lg:w-auto lg:flex-1">
      <LibraryMedia item={item} playIcon={playIcon} />
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl leading-display text-[#18263a]">
          {item.title}
        </h3>
        <p className="text-sm uppercase leading-ui-label text-body-muted sm:leading-single">
          {item.subtitle}
        </p>
      </div>
    </article>
  );
}

export function ResearchLibrarySection() {
  const { libraryCategories, libraryContent, media } = useSiteContent();
  const section = useSection("homepage.research_library");
  const [activeCategory, setActiveCategory] =
    useState<LibraryCategory>("Books");

  const headline = (section.headline as string) ?? "Research Library";
  const body =
    (section.body as string) ??
    "Essential reading and viewing for the modern parent.";
  const activeItems = libraryContent[activeCategory];

  return (
    <section id="resources" className="w-full bg-paper-200 py-24 max-lg:py-16">
      <Container className="flex flex-col gap-12 max-lg:gap-8">
        <ScrollReveal className="flex flex-col gap-4">
          <DisplayHeading as="h2" className="text-[#18263a]">
            {headline}
          </DisplayHeading>
          <p className="text-base leading-[1.4] text-body-muted sm:text-lg">
            {body}
          </p>
        </ScrollReveal>

        <div className="flex w-full flex-col items-start gap-6 md:gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 self-stretch lg:w-[21%] lg:border-r lg:border-white/[0.07]">
            <div className="md:hidden">
              <Select
                value={activeCategory}
                onValueChange={(value) =>
                  setActiveCategory(value as LibraryCategory)
                }
              >
                <SelectTrigger className="h-auto w-full rounded-full border-navy-800/10 bg-paper-300 px-8 py-3 text-sm font-semibold text-navy-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {libraryCategories.map((category, index) => (
                    <SelectItem key={category} value={category}>
                      <span className="text-body-muted tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>{" "}
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <nav
              className="hidden border-white/[0.07] md:flex md:flex-row md:overflow-x-auto md:pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:border-r-0"
              aria-label="Library categories"
            >
              {libraryCategories.map((category, index) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`library-panel-${index}`}
                    id={`library-tab-${index}`}
                    onClick={() => setActiveCategory(category)}
                    className={`flex w-full items-center gap-2 border-l-[2.6px] py-4 pl-6 pr-6 text-left transition-colors md:flex-1 md:shrink-0 md:justify-center md:border-l-0 md:p-4 lg:flex-none lg:w-full lg:justify-start lg:border-l-[2.6px] lg:py-4 lg:pl-6 lg:pr-6 ${
                      isActive
                        ? "border-gold-accent bg-gold-accent/6 text-navy-800 md:border-l-[2.6px] lg:border-gold-accent"
                        : "border-transparent text-navy-800 hover:bg-white/30"
                    }`}
                  >
                    <span
                      className={`shrink-0 font-sans text-xs font-medium leading-none tabular-nums ${
                        isActive ? "text-navy-800" : "text-body-muted"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-sm leading-single ${
                        isActive ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div
            role="tabpanel"
            id={`library-panel-${libraryCategories.indexOf(activeCategory)}`}
            aria-labelledby={`library-tab-${libraryCategories.indexOf(activeCategory)}`}
            className="timeline-snap-track flex min-w-0 w-full flex-1 flex-row gap-6 overflow-x-auto pb-2 lg:gap-10 lg:overflow-visible lg:pb-0"
            aria-label={`${activeCategory} resources`}
            data-lenis-prevent-horizontal
            data-lenis-prevent-touch
          >
            {activeItems.map((item) => (
              <LibraryCard
                key={`${activeCategory}-${item.title}`}
                item={item}
                playIcon={media.icons.play}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
