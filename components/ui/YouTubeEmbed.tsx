"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";
import { disableYouTubeCaptions, youTubeEmbedUrl } from "@/lib/youtube";

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  fill?: boolean;
  className?: string;
};

const THUMBNAIL_QUALITIES = [
  "maxresdefault",
  "sddefault",
  "hqdefault",
] as const;

function posterUrl(
  videoId: string,
  quality: (typeof THUMBNAIL_QUALITIES)[number],
) {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function YouTubeEmbed({
  videoId,
  title,
  fill = false,
  className,
}: YouTubeEmbedProps) {
  const { media } = useSiteContent();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const quality = THUMBNAIL_QUALITIES[qualityIndex];
  const frameClass = cn(
    "relative w-full overflow-hidden bg-black",
    fill ? "absolute inset-0 h-full" : "aspect-560/315 rounded-sm",
    className,
  );

  const enforceCaptionsOff = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    disableYouTubeCaptions(iframe);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    enforceCaptionsOff();
    const intervalId = window.setInterval(enforceCaptionsOff, 750);
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [enforceCaptionsOff, isPlaying, videoId]);

  if (isPlaying) {
    return (
      <div className={frameClass}>
        <iframe
          ref={iframeRef}
          src={youTubeEmbedUrl(videoId, true, origin || undefined)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 size-full border-0"
          onLoad={enforceCaptionsOff}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      className={cn(frameClass, "group text-left")}
      aria-label={`Play video: ${title}`}
    >
      <ContentImage
        src={posterUrl(videoId, quality)}
        alt={title}
        fill
        unoptimized
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 100vw"
        onError={() => {
          setQualityIndex((current) =>
            Math.min(current + 1, THUMBNAIL_QUALITIES.length - 1),
          );
        }}
      />
      <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-[60px] items-center justify-center rounded-full border-[1.5px] border-gold-accent/40 bg-gold-accent/8 transition-transform duration-300 group-hover:scale-105">
          <ContentImage
            src={media.icons.play}
            alt=""
            width={22}
            height={22}
            className="ml-0.5"
            aria-hidden
          />
        </span>
      </div>
    </button>
  );
}
