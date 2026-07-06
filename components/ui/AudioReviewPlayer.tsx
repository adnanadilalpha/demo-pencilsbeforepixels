"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { RichTextContent } from "@/components/cms/RichTextContent";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { RICH_TEXT_LINKS_LIGHT_CLASS } from "@/lib/cms/rich-text";
import { useSiteContent } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";

export type AudioReviewPlayerProps = {
  src: string;
  title: string;
  label?: string;
  description?: string;
  className?: string;
  variant?: "light" | "dark";
  compact?: boolean;
  layout?: "default" | "featured";
};

const WAVE_BARS = [4, 7, 5, 9, 6, 8, 4, 7, 5, 8, 6, 9, 5, 7, 4];
const FEATURED_WAVE_BARS = [
  3, 6, 4, 8, 5, 9, 7, 4, 8, 6, 9, 5, 7, 10, 6, 8, 4, 9, 5, 7, 8, 4, 6, 5,
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function WaveformBars({
  active,
  size = "sm",
}: {
  active: boolean;
  size?: "sm" | "lg";
}) {
  const bars = size === "lg" ? FEATURED_WAVE_BARS : WAVE_BARS;
  const heightMultiplier = size === "lg" ? 4 : 3;

  return (
    <div
      className={cn(
        "flex items-end justify-center",
        size === "lg" ? "h-16 gap-1" : "h-9 gap-[3px]",
      )}
      aria-hidden
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn(
            "origin-bottom rounded-full bg-gold-accent/70 transition-transform duration-300",
            size === "lg" ? "w-1" : "w-[3px]",
            active && "animate-[audio-bar_1.1s_ease-in-out_infinite]",
          )}
          style={{
            height: `${height * heightMultiplier}px`,
            animationDelay: `${index * 55}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({
  progressId,
  progress,
  isDark,
  onSeek,
  size = "default",
}: {
  progressId: string;
  progress: number;
  isDark: boolean;
  onSeek: (value: number) => void;
  size?: "default" | "large";
}) {
  return (
    <>
      <label htmlFor={progressId} className="sr-only">
        Audio progress
      </label>
      <input
        id={progressId}
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        onChange={(event) => onSeek(Number(event.target.value))}
        className={cn(
          "audio-review-range w-full cursor-pointer appearance-none rounded-full",
          size === "large" ? "h-2" : "h-1.5",
          isDark ? "bg-white/15" : "bg-navy-800/10",
        )}
        style={{
          background: isDark
            ? `linear-gradient(to right, rgba(201,162,39,0.85) 0%, rgba(201,162,39,0.85) ${progress}%, rgba(255,255,255,0.15) ${progress}%, rgba(255,255,255,0.15) 100%)`
            : `linear-gradient(to right, rgba(176,141,36,0.9) 0%, rgba(176,141,36,0.9) ${progress}%, rgba(15,31,61,0.1) ${progress}%, rgba(15,31,61,0.1) 100%)`,
        }}
      />
    </>
  );
}

function PlayButton({
  isPlaying,
  title,
  onClick,
  media,
  size = "default",
  isDark,
}: {
  isPlaying: boolean;
  title: string;
  onClick: () => void;
  media: { icons: { play: string } };
  size?: "compact" | "default" | "large";
  isDark: boolean;
}) {
  const isLarge = size === "large";
  const isCompact = size === "compact";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex shrink-0 items-center justify-center rounded-full border transition-all duration-300",
        isLarge
          ? "size-20 border-2 hover:scale-[1.03] hover:border-gold-accent/60 hover:bg-gold-accent/15"
          : isCompact
            ? "size-10 group-hover:scale-105"
            : "size-12 group-hover:scale-105",
        isDark
          ? "border-gold-accent/40 bg-gold-accent/10"
          : "border-gold-500/35 bg-gold-500/8",
        !isLarge && "group",
      )}
      aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
    >
      {isPlaying ? (
        <span className="flex gap-1.5" aria-hidden>
          <span
            className={cn(
              "rounded-full bg-gold-accent",
              isLarge ? "h-6 w-1" : isCompact ? "h-3 w-[2px]" : "h-4 w-[3px]",
            )}
          />
          <span
            className={cn(
              "rounded-full bg-gold-accent",
              isLarge ? "h-6 w-1" : isCompact ? "h-3 w-[2px]" : "h-4 w-[3px]",
            )}
          />
        </span>
      ) : (
        <ContentImage
          src={media.icons.play}
          alt=""
          width={isLarge ? 28 : isCompact ? 14 : 18}
          height={isLarge ? 28 : isCompact ? 14 : 18}
          className="ml-0.5"
          aria-hidden
        />
      )}
    </button>
  );
}

export function AudioReviewPlayer({
  src,
  title,
  label = "Audio review",
  description,
  className,
  variant = "dark",
  compact = false,
  layout = "default",
}: AudioReviewPlayerProps) {
  const { media } = useSiteContent();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback(
    (value: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = (value / 100) * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [src]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFeatured = layout === "featured";
  const isDark = isFeatured || variant === "dark";

  if (isFeatured) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-hero-dark shadow-[0_12px_48px_rgba(10,22,40,0.25)]",
          RICH_TEXT_LINKS_LIGHT_CLASS,
          className,
        )}
      >
        <audio ref={audioRef} src={src} preload="metadata" />

        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(201,162,39,0.14),transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 48px)",
          }}
          aria-hidden
        />

        {/* Compact layout on mobile/tablet — keeps footprint below the video */}
        <div className="relative p-3 sm:p-4 lg:hidden">
          <div className="flex items-start gap-3">
            <PlayButton
              isPlaying={isPlaying}
              title={title}
              onClick={togglePlayback}
              media={media}
              size="compact"
              isDark
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-gold-accent">
                {label}
              </p>
              <p className="mt-0.5 font-sans text-sm font-medium leading-snug text-slate-50">
                {title}
              </p>
              {description ? (
                <div className="mt-1 text-xs leading-snug text-slate-200/80">
                  <RichTextContent content={description} inline />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <ProgressBar
              progressId={progressId}
              progress={progress}
              isDark={isDark}
              onSeek={handleSeek}
            />
            <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-[300px] grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:grid">
          <div className="flex flex-col justify-center gap-4 border-r border-white/10 px-12 py-14 text-left sm:gap-5">
            <SectionLabel variant="gold-on-dark" className="tracking-[0.25em]">
              {label}
            </SectionLabel>
            <DisplayHeading as="h3" size="md" className="text-slate-50">
              {title}
            </DisplayHeading>
            {description ? (
              <RichTextContent
                content={description}
                className="max-w-xl text-base leading-relaxed text-slate-200/95 sm:text-[17px] sm:leading-[1.6]"
              />
            ) : null}
          </div>

          <div className="flex flex-col items-center justify-center gap-6 px-10 py-14 sm:gap-7 xl:px-12">
            <div className="w-full max-w-md">
              <WaveformBars active={isPlaying} size="lg" />
            </div>

            <PlayButton
              isPlaying={isPlaying}
              title={title}
              onClick={togglePlayback}
              media={media}
              size="large"
              isDark
            />

            <div className="w-full max-w-md space-y-3">
              <ProgressBar
                progressId={progressId}
                progress={progress}
                isDark={isDark}
                onSeek={handleSeek}
                size="large"
              />
              <div className="flex items-center justify-between font-mono text-sm tabular-nums text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl ring-1",
        isDark
          ? `bg-navy-700/80 ring-white/10 ${RICH_TEXT_LINKS_LIGHT_CLASS}`
          : "bg-paper-50 ring-navy-800/8 shadow-[0_1px_3px_rgba(10,22,40,0.06)]",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-[0.35]",
          isDark
            ? "bg-[radial-gradient(circle_at_20%_50%,rgba(201,162,39,0.18),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_0%_50%,rgba(201,162,39,0.12),transparent_50%)]",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex flex-col gap-3",
          compact
            ? "p-3"
            : "gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5",
        )}
      >
        <button
          type="button"
          onClick={togglePlayback}
          className={cn(
            "group flex shrink-0 items-center gap-3 text-left",
            !compact && "sm:min-w-[220px]",
            isDark ? "text-white" : "text-navy-800",
          )}
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-105",
              compact ? "size-10" : "size-12",
              isDark
                ? "border-gold-accent/40 bg-gold-accent/10"
                : "border-gold-500/35 bg-gold-500/8",
            )}
          >
            {isPlaying ? (
              <span className="flex gap-1" aria-hidden>
                <span className="h-4 w-[3px] rounded-full bg-gold-accent" />
                <span className="h-4 w-[3px] rounded-full bg-gold-accent" />
              </span>
            ) : (
              <ContentImage
                src={media.icons.play}
                alt=""
                width={18}
                height={18}
                className="ml-0.5"
                aria-hidden
              />
            )}
          </span>

          <span className="min-w-0">
            {!compact ? (
              <span
                className={cn(
                  "block font-sans text-[10px] font-medium uppercase tracking-[0.2em] lg:text-base",
                  isDark ? "text-gold-accent" : "text-gold-500",
                )}
              >
                {label}
              </span>
            ) : null}
            <span
              className={cn(
                "block font-medium leading-snug",
                compact ? "text-sm" : "mt-1 text-sm sm:text-[15px] lg:text-base",
              )}
            >
              {title}
            </span>
          </span>
        </button>

        {!compact ? (
          <div className="hidden sm:block">
            <WaveformBars active={isPlaying} />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {!compact ? (
            <div className="mb-2 flex items-center justify-between gap-3 sm:hidden">
              <WaveformBars active={isPlaying} />
              <span
                className={cn(
                  "shrink-0 font-mono text-[11px] tabular-nums lg:text-base",
                  isDark ? "text-white/55" : "text-navy-800/55",
                )}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          ) : null}

          <ProgressBar
            progressId={progressId}
            progress={progress}
            isDark={isDark}
            onSeek={handleSeek}
          />

          <div
            className={cn(
              "mt-2 flex items-center justify-between font-mono tabular-nums",
              compact
                ? "text-[10px]"
                : "hidden text-[11px] sm:flex lg:text-base",
              isDark ? "text-white/55" : "text-navy-800/55",
            )}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
