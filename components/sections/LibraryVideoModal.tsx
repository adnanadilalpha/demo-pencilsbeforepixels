"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  getLibraryVideoSource,
  type LibraryVideoSource,
} from "@/lib/cms/library-video";
import type { LibraryItem } from "@/lib/cms/types";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/modal/body-scroll-lock";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { disableYouTubeCaptions, youTubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type LibraryVideoModalProps = {
  open: boolean;
  item: LibraryItem | null;
  onClose: () => void;
};

function VideoPlayer({
  source,
  title,
}: {
  source: LibraryVideoSource;
  title: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const enforceCaptionsOff = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    disableYouTubeCaptions(iframe);
  }, []);

  useEffect(() => {
    if (source.type !== "youtube") return;

    enforceCaptionsOff();
    const intervalId = window.setInterval(enforceCaptionsOff, 750);
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [enforceCaptionsOff, source]);

  if (source.type === "youtube") {
    return (
      <iframe
        ref={iframeRef}
        src={youTubeEmbedUrl(
          source.videoId,
          true,
          origin || undefined,
          source.startSeconds,
        )}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
        onLoad={enforceCaptionsOff}
      />
    );
  }

  return (
    <video
      src={source.url}
      controls
      autoPlay
      playsInline
      className="absolute inset-0 size-full bg-black object-contain"
    >
      <track kind="captions" />
    </video>
  );
}

export function LibraryVideoModal({
  open,
  item,
  onClose,
}: LibraryVideoModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const source = item ? getLibraryVideoSource(item) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const enterFrame = window.requestAnimationFrame(() => setVisible(true));

    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!mounted || !open || !item || !source) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-navy-800/60 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        className={cn(
          "relative w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#18263a] shadow-2xl transition-all duration-200",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0 pr-2">
            <h2
              id={titleId}
              className="truncate font-display text-lg text-white sm:text-xl"
            >
              {stripRichTextToPlain(item.title)}
            </h2>
            {item.subtitle ? (
              <p className="truncate text-xs uppercase tracking-wide text-white/60 sm:text-sm lg:text-base">
                {stripRichTextToPlain(item.subtitle)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close video"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {visible ? <VideoPlayer source={source} title={item.title} /> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
