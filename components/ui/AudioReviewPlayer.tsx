"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSiteContent } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";

type AudioReviewPlayerProps = {
  src: string;
  title: string;
  label?: string;
  className?: string;
  variant?: "light" | "dark";
};

const WAVE_BARS = [4, 7, 5, 9, 6, 8, 4, 7, 5, 8, 6, 9, 5, 7, 4];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden>
      {WAVE_BARS.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] origin-bottom rounded-full bg-gold-accent/70 transition-transform duration-300",
            active && "animate-[audio-bar_1.1s_ease-in-out_infinite]",
          )}
          style={{
            height: `${height * 3}px`,
            animationDelay: `${index * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function AudioReviewPlayer({
  src,
  title,
  label = "Audio review",
  className,
  variant = "dark",
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
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl ring-1",
        isDark
          ? "bg-navy-700/80 ring-white/10"
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

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <button
          type="button"
          onClick={togglePlayback}
          className={cn(
            "group flex shrink-0 items-center gap-3 text-left sm:min-w-[220px]",
            isDark ? "text-white" : "text-navy-800",
          )}
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-105",
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
            <span
              className={cn(
                "block font-sans text-[10px] font-medium uppercase tracking-[0.2em] lg:text-base",
                isDark ? "text-gold-accent" : "text-gold-500",
              )}
            >
              {label}
            </span>
            <span className="mt-1 block text-sm font-medium leading-snug sm:text-[15px] lg:text-base">
              {title}
            </span>
          </span>
        </button>

        <div className="hidden sm:block">
          <WaveformBars active={isPlaying} />
        </div>

        <div className="min-w-0 flex-1">
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
            onChange={(event) => handleSeek(Number(event.target.value))}
            className={cn(
              "audio-review-range h-1.5 w-full cursor-pointer appearance-none rounded-full",
              isDark ? "bg-white/15" : "bg-navy-800/10",
            )}
            style={{
              background: isDark
                ? `linear-gradient(to right, rgba(201,162,39,0.85) 0%, rgba(201,162,39,0.85) ${progress}%, rgba(255,255,255,0.15) ${progress}%, rgba(255,255,255,0.15) 100%)`
                : `linear-gradient(to right, rgba(176,141,36,0.9) 0%, rgba(176,141,36,0.9) ${progress}%, rgba(15,31,61,0.1) ${progress}%, rgba(15,31,61,0.1) 100%)`,
            }}
          />

          <div
            className={cn(
              "mt-2 hidden items-center justify-between font-mono text-[11px] tabular-nums sm:flex lg:text-base",
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
