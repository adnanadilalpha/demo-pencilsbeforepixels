"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type UploadedVideoPosterProps = {
  src: string;
};

export function UploadedVideoPoster({ src }: UploadedVideoPosterProps) {
  const [ready, setReady] = useState(false);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 bg-[#18263a] transition-opacity duration-300",
          ready ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      />
      <video
        src={src}
        preload="metadata"
        muted
        playsInline
        tabIndex={-1}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
        )}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (!Number.isFinite(video.duration) || video.duration <= 0) {
            setReady(true);
            return;
          }

          video.currentTime = Math.min(0.25, video.duration * 0.05);
        }}
        onSeeked={(event) => {
          event.currentTarget.pause();
          setReady(true);
        }}
        onLoadedData={(event) => {
          event.currentTarget.pause();
          if (!ready) setReady(true);
        }}
        onError={() => setReady(true)}
      />
    </>
  );
}
