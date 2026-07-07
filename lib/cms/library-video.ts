import type { LibraryItem } from "@/lib/cms/types";
import {
  parseYouTubeStartSeconds,
  youTubeUrlToId,
} from "@/lib/youtube";

export type LibraryVideoSource =
  | { type: "youtube"; videoId: string; startSeconds?: number }
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
      const startSeconds = parseYouTubeStartSeconds(item.youtubeUrl);
      return {
        type: "youtube",
        videoId,
        ...(startSeconds && startSeconds > 0 ? { startSeconds } : {}),
      };
    }
  }

  return null;
}

export function isLibraryVideoPlayable(item: LibraryItem): boolean {
  return getLibraryVideoSource(item) !== null;
}
