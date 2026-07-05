import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  RESEARCH_PAPERS_CATEGORY,
  WALLED_GARDEN_CATEGORY,
} from "@/lib/cms/research-library-content";
import {
  inferLibraryFileKind,
  fileNameFromUrl,
} from "@/lib/cms/library-file";
import { normalizeYouTubeUrl, youTubeUrlToId } from "@/lib/youtube";
import type {
  AdminBook,
  AdminLibraryItem,
  AdminVideo,
  ResourcesCatalog,
} from "./types";

type MediaRecord = {
  publicUrl: string;
  mimeType: string | null;
  title: string | null;
};

async function mediaByIds(ids: string[]): Promise<Map<string, MediaRecord>> {
  if (!ids.length) return new Map();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, public_url, mime_type, title")
    .in("id", ids);

  return new Map(
    (data ?? []).map((row) => [
      row.id,
      {
        publicUrl: row.public_url,
        mimeType: row.mime_type,
        title: row.title,
      },
    ]),
  );
}

type LibraryRow = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  kind: string;
  image_media_id: string | null;
  file_media_id: string | null;
  external_url: string | null;
  video_media_id: string | null;
  sort_order: number;
  visible: boolean;
};

function resolveFileMediaId(row: LibraryRow): string | null {
  return row.file_media_id ?? row.image_media_id;
}

function mapFileFields(
  mediaId: string | null,
  mediaMap: Map<string, MediaRecord>,
): Pick<
  AdminLibraryItem,
  "fileMediaId" | "fileUrl" | "fileName" | "fileKind"
> {
  if (!mediaId) {
    return {
      fileMediaId: null,
      fileUrl: null,
      fileName: null,
      fileKind: null,
    };
  }

  const media = mediaMap.get(mediaId);
  if (!media) {
    return {
      fileMediaId: mediaId,
      fileUrl: null,
      fileName: null,
      fileKind: null,
    };
  }

  const fileKind = inferLibraryFileKind(media.mimeType, media.publicUrl);

  return {
    fileMediaId: mediaId,
    fileUrl: media.publicUrl,
    fileName: media.title ?? fileNameFromUrl(media.publicUrl),
    fileKind,
  };
}

function mapLibraryItem(
  row: LibraryRow,
  mediaMap: Map<string, MediaRecord>,
): AdminLibraryItem {
  const fileMediaId = resolveFileMediaId(row);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    kind: row.kind as AdminLibraryItem["kind"],
    ...mapFileFields(fileMediaId, mediaMap),
    visible: row.visible,
    sortOrder: row.sort_order,
  };
}

function mapBookItem(
  row: LibraryRow,
  mediaMap: Map<string, MediaRecord>,
): AdminBook {
  const cover = row.image_media_id ? mediaMap.get(row.image_media_id) : null;

  return {
    id: row.id,
    title: row.title,
    author: row.subtitle,
    summary: null,
    coverMediaId: row.image_media_id,
    coverUrl: cover?.publicUrl ?? null,
    amazonUrl: null,
    publisherUrl: null,
    viewUrl: row.external_url ?? null,
    featured: false,
    visible: row.visible,
    sortOrder: row.sort_order,
  };
}

function mapVideoItem(
  row: LibraryRow,
  mediaMap: Map<string, MediaRecord>,
): AdminVideo {
  const youtubeUrl = row.external_url
    ? normalizeYouTubeUrl(row.external_url)
    : "";
  const youtubeId = youTubeUrlToId(youtubeUrl);
  const videoMediaId = row.video_media_id;
  const videoUrl = videoMediaId
    ? (mediaMap.get(videoMediaId)?.publicUrl ?? null)
    : null;
  const source: AdminVideo["source"] = videoUrl ? "upload" : "youtube";
  const thumbnail = row.image_media_id
    ? mediaMap.get(row.image_media_id)
    : null;

  return {
    id: row.id,
    title: row.title,
    description: row.subtitle,
    source,
    youtubeId,
    youtubeUrl,
    videoUrl,
    videoMediaId,
    thumbnailMediaId: row.image_media_id,
    thumbnailUrl: thumbnail?.publicUrl ?? null,
    duration: null,
    visible: row.visible,
    sortOrder: row.sort_order,
  };
}

export async function fetchResourcesCatalog(): Promise<ResourcesCatalog> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, category, title, subtitle, kind, image_media_id, file_media_id, external_url, video_media_id, sort_order, visible",
    )
    .order("sort_order");

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as LibraryRow[];
  const mediaIds = rows
    .flatMap((row) => [
      row.image_media_id,
      row.file_media_id,
      row.video_media_id,
    ])
    .filter((id): id is string => Boolean(id));

  const mediaMap = await mediaByIds(mediaIds);

  const paperRows = rows.filter((row) => row.kind === "paper");

  return {
    walledGarden: paperRows
      .filter((row) => row.category === WALLED_GARDEN_CATEGORY)
      .map((row) => mapLibraryItem(row, mediaMap)),
    researchPapers: paperRows
      .filter((row) => row.category === RESEARCH_PAPERS_CATEGORY)
      .map((row) => mapLibraryItem(row, mediaMap)),
    books: rows
      .filter((row) => row.kind === "book")
      .map((row) => mapBookItem(row, mediaMap)),
    videos: rows
      .filter((row) => row.kind === "video")
      .map((row) => mapVideoItem(row, mediaMap)),
    parentResources: rows
      .filter((row) => row.kind === "resource")
      .map((row) => mapLibraryItem(row, mediaMap)),
  };
}
