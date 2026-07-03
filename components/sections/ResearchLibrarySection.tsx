"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { useState, type ReactNode } from "react";
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
import { isLibraryVideoPlayable } from "@/lib/cms/library-video";
import type { LibraryCategory, LibraryItem } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { LibraryVideoModal } from "@/components/sections/LibraryVideoModal";
import {
  LibraryDocumentModal,
  openLibraryDocument,
} from "@/components/sections/LibraryDocumentModal";
import { LibraryDocumentPreview } from "@/components/sections/LibraryDocumentPreview";
import {
  hasVideoThumbnail,
  VideoThumbnail,
} from "@/components/sections/VideoThumbnail";

const CARD_WIDTH = "w-[200px] sm:w-[220px] lg:w-[240px]";

const cardFrameClassName =
  "relative aspect-square w-full overflow-hidden rounded-xl border border-[rgba(220,218,212,0.3)] bg-overlay p-[15%] shadow-[0_10px_15px_-3px_rgba(24,38,58,0.05),0_4px_6px_-4px_rgba(24,38,58,0.05)]";

const videoCardFrameClassName =
  "relative aspect-square w-full overflow-hidden rounded-xl border border-[rgba(220,218,212,0.3)] bg-[#18263a] shadow-[0_10px_15px_-3px_rgba(24,38,58,0.05),0_4px_6px_-4px_rgba(24,38,58,0.05)]";

function libraryItemKey(item: LibraryItem, category: LibraryCategory): string {
  return `${category}-${item.kind}-${item.title}-${item.subtitle}`;
}

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
        <ContentImage
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

const documentCardFrameClassName = videoCardFrameClassName;

function isLibraryDocument(item: LibraryItem): boolean {
  return item.kind === "paper" || item.kind === "resource";
}

function DocumentCardMedia({
  item,
  onOpen,
  children,
}: {
  item: LibraryItem;
  onOpen?: () => void;
  children: ReactNode;
}) {
  const frame = <div className="absolute inset-0">{children}</div>;

  if (!item.fileUrl || !onOpen) {
    return <div className={documentCardFrameClassName}>{frame}</div>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open document: ${item.title}`}
      className={cn(
        documentCardFrameClassName,
        "cursor-pointer text-left transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold-accent",
      )}
    >
      {frame}
    </button>
  );
}

function PlayOverlay({ playIcon }: { playIcon: string }) {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-800/20">
      <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
        <ContentImage
          src={playIcon}
          alt=""
          width={18}
          height={18}
          className="ml-0.5"
          aria-hidden
        />
      </span>
    </span>
  );
}

function VideoCardMedia({
  item,
  playIcon,
  onPlay,
  children,
}: {
  item: LibraryItem;
  playIcon: string;
  onPlay?: () => void;
  children: ReactNode;
}) {
  const playable = isLibraryVideoPlayable(item);
  const frame = (
    <>
      <div className="absolute inset-0">{children}</div>
      {playable ? <PlayOverlay playIcon={playIcon} /> : null}
    </>
  );

  if (!playable || !onPlay) {
    return <div className={videoCardFrameClassName}>{frame}</div>;
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play video: ${item.title}`}
      className={cn(
        videoCardFrameClassName,
        "cursor-pointer text-left transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold-accent",
      )}
    >
      {frame}
    </button>
  );
}

function LibraryMedia({
  item,
  playIcon,
  onPlay,
  onDocumentOpen,
}: {
  item: LibraryItem;
  playIcon: string;
  onPlay?: () => void;
  onDocumentOpen?: () => void;
}) {
  if (item.kind === "book" && item.image) {
    return (
      <div className={cardFrameClassName}>
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <ContentImage
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </div>
    );
  }

  if (isLibraryDocument(item)) {
    if (item.fileUrl) {
      return (
        <DocumentCardMedia item={item} onOpen={onDocumentOpen}>
          <LibraryDocumentPreview
            fileKind={item.fileKind ?? "document"}
            fileName={item.fileName}
          />
        </DocumentCardMedia>
      );
    }

    return (
      <div className={cardFrameClassName}>
        {item.kind === "paper" ? (
          <PaperPlaceholder />
        ) : (
          <ResourcePlaceholder />
        )}
      </div>
    );
  }

  if (item.kind === "video") {
    if (hasVideoThumbnail(item) || isLibraryVideoPlayable(item)) {
      return (
        <VideoCardMedia item={item} playIcon={playIcon} onPlay={onPlay}>
          {hasVideoThumbnail(item) ? (
            <VideoThumbnail item={item} />
          ) : (
            <VideoPlaceholder playIcon={playIcon} />
          )}
        </VideoCardMedia>
      );
    }

    return (
      <div className={cardFrameClassName}>
        <VideoPlaceholder playIcon={playIcon} />
      </div>
    );
  }

  return (
    <div className={cardFrameClassName}>
      {item.kind === "paper" && <PaperPlaceholder />}
      {item.kind === "resource" && <ResourcePlaceholder />}
    </div>
  );
}

function LibraryCard({
  item,
  playIcon,
  onVideoPlay,
  onDocumentOpen,
}: {
  item: LibraryItem;
  playIcon: string;
  onVideoPlay?: () => void;
  onDocumentOpen?: () => void;
}) {
  return (
    <article
      className={cn(
        "timeline-snap-slide flex shrink-0 flex-col gap-4 sm:gap-5",
        CARD_WIDTH,
      )}
    >
      <LibraryMedia
        item={item}
        playIcon={playIcon}
        onPlay={onVideoPlay}
        onDocumentOpen={onDocumentOpen}
      />
      <div className="flex min-h-17 flex-col gap-2">
        <h3 className="line-clamp-2 font-display text-lg leading-snug text-[#18263a] sm:text-xl sm:leading-display">
          {item.title}
        </h3>
        <p className="line-clamp-1 text-xs uppercase leading-ui-label text-body-muted sm:text-sm lg:text-base">
          {item.subtitle}
        </p>
        {item.kind === "book" && item.viewUrl ? (
          <a
            href={item.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center justify-center rounded-full border border-navy-800/20 px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-800/5 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold-accent lg:text-base"
          >
            View
          </a>
        ) : null}
      </div>
    </article>
  );
}

function CategoryNavButton({
  category,
  index,
  isActive,
  count,
  onSelect,
}: {
  category: LibraryCategory;
  index: number;
  isActive: boolean;
  count: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`library-panel-${index}`}
      id={`library-tab-${index}`}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 border-l-[2.6px] py-4 pl-6 pr-5 text-left transition-colors md:flex-1 md:shrink-0 md:justify-center md:border-l-0 md:px-4 lg:flex-none lg:w-full lg:justify-start lg:border-l-[2.6px] lg:py-4 lg:pl-6 lg:pr-5",
        isActive
          ? "border-gold-accent bg-gold-accent/6 text-navy-800 md:border-l-[2.6px]"
          : "border-transparent text-navy-800 hover:bg-white/30",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "shrink-0 font-sans text-xs font-medium leading-none tabular-nums lg:text-base",
            isActive ? "text-navy-800" : "text-body-muted",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "truncate text-sm leading-single lg:text-base",
            isActive ? "font-semibold" : "font-normal",
          )}
        >
          {category}
        </span>
      </span>
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums lg:inline lg:text-base",
          isActive ? "bg-navy-800/8 text-navy-800" : "bg-white/50 text-body-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function ResearchLibrarySection() {
  const { libraryCategories, libraryContent, media } = useSiteContent();
  const section = useSection("homepage.research_library");
  const [activeCategory, setActiveCategory] =
    useState<LibraryCategory>("Books");
  const [activeVideo, setActiveVideo] = useState<LibraryItem | null>(null);
  const [activeDocument, setActiveDocument] = useState<LibraryItem | null>(null);

  const handleDocumentOpen = (item: LibraryItem) => {
    const action = openLibraryDocument(item);
    if (action === "modal") {
      setActiveDocument(item);
    }
  };

  const headline = (section.headline as string) ?? "Research Library";
  const body =
    (section.body as string) ??
    "Essential reading and viewing for the modern parent.";

  const activeItems = libraryContent[activeCategory] ?? [];
  const activeIndex = libraryCategories.indexOf(activeCategory);

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

        <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-10">
          <aside className="w-full shrink-0 lg:w-[220px] xl:w-[240px] lg:border-r lg:border-white/[0.07]">
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
                      <span className="text-body-muted">
                        {" "}
                        ({libraryContent[category]?.length ?? 0})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <nav
              className="hidden md:flex md:flex-row md:overflow-x-auto md:pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
              aria-label="Library categories"
              role="tablist"
            >
              {libraryCategories.map((category, index) => (
                <CategoryNavButton
                  key={category}
                  category={category}
                  index={index}
                  isActive={category === activeCategory}
                  count={libraryContent[category]?.length ?? 0}
                  onSelect={() => setActiveCategory(category)}
                />
              ))}
            </nav>
          </aside>

          <div
            role="tabpanel"
            id={`library-panel-${activeIndex}`}
            aria-labelledby={`library-tab-${activeIndex}`}
            className="min-w-0 flex-1"
            aria-label={`${activeCategory} resources`}
          >
            {activeItems.length === 0 ? (
              <p className="rounded-xl border border-navy-800/8 bg-white/40 px-6 py-10 text-center text-sm text-body-muted lg:text-base">
                No {activeCategory.toLowerCase()} yet.
              </p>
            ) : (
              <div
                className="timeline-snap-track -mx-1 flex flex-row gap-5 overflow-x-auto px-1 pb-2 sm:gap-6 lg:gap-8"
                data-lenis-prevent-horizontal
                data-lenis-prevent-touch
              >
                {activeItems.map((item) => (
                  <LibraryCard
                    key={libraryItemKey(item, activeCategory)}
                    item={item}
                    playIcon={media.icons.play}
                    onVideoPlay={
                      isLibraryVideoPlayable(item)
                        ? () => setActiveVideo(item)
                        : undefined
                    }
                    onDocumentOpen={
                      item.fileUrl ? () => handleDocumentOpen(item) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      <LibraryVideoModal
        open={activeVideo !== null}
        item={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      <LibraryDocumentModal
        open={activeDocument !== null}
        item={activeDocument}
        onClose={() => setActiveDocument(null)}
      />
    </section>
  );
}
