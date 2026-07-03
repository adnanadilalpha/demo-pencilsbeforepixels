"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import { UploadedVideoPoster } from "@/components/sections/UploadedVideoPoster";
import type { LibraryItem } from "@/lib/cms/types";
import { youTubeUrlToId } from "@/lib/youtube";

type VideoThumbnailProps = {
  item: LibraryItem;
};

export function VideoThumbnail({ item }: VideoThumbnailProps) {
  if (item.image) {
    return (
      <ContentImage
        src={item.image}
        alt={item.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    );
  }

  if (item.youtubeUrl) {
    const videoId = youTubeUrlToId(item.youtubeUrl);
    if (videoId) {
      return (
        <ContentImage
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
      );
    }
  }

  if (item.videoUrl) {
    return <UploadedVideoPoster src={item.videoUrl} />;
  }

  return null;
}

export function hasVideoThumbnail(item: LibraryItem): boolean {
  if (item.kind !== "video") return false;
  if (item.image || item.videoUrl) return true;
  if (item.youtubeUrl && youTubeUrlToId(item.youtubeUrl)) return true;
  return false;
}
