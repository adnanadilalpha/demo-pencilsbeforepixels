import type { LibraryItem } from "@/lib/cms/types";
import { youTubeUrlToId } from "@/lib/youtube";

export type LibraryVideoSource =
  | { type: "youtube"; videoId: string }
  | { type: "upload"; url: string };

export function getLibraryVideoSource(
  item: LibraryItem,
): LibraryVideoSource | null {
  if (item.kind !== "video") return null;

  if (item.videoUrl) {
    return { type: "upload", url: item.videoUrl };
  }

  if (item.youtubeUrl) {
    const videoId = youTubeUrlToId(item.youtubeUrl);
    if (videoId) {
      return { type: "youtube", videoId };
    }
  }

  return null;
}

export function isLibraryVideoPlayable(item: LibraryItem): boolean {
  return getLibraryVideoSource(item) !== null;
}
