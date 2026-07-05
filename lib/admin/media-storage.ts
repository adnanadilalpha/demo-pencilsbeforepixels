import "server-only";

import { getMediaStorageCacheControl } from "@/lib/cache/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bucketPathToStoragePath,
  buildPublicUrl as buildPublicUrlFromBase,
  canonicalStoragePath,
  publicUrlToStoragePath,
  storagePathToBucketPath,
  stripUrlCacheBuster,
  withCacheBuster,
} from "@/lib/admin/media-paths";
import {
  normalizeBookCoverImage,
  type BookCoverProcessOptions,
  readImageBytesFromUrl,
} from "@/lib/admin/book-cover-process";

const BUCKET = "site-media";

export type UploadedMedia = {
  id: string;
  publicUrl: string;
  storagePath: string;
};

export {
  bucketPathToStoragePath,
  canonicalStoragePath,
  publicUrlToStoragePath,
  storagePathToBucketPath,
};

function getSupabasePublicBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  return url.replace(/\/$/, "");
}

function buildPublicUrl(bucketPath: string): string {
  return buildPublicUrlFromBase(getSupabasePublicBaseUrl(), bucketPath);
}

function inferMediaType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

type UploadMediaOptions = {
  folder: string;
  filename?: string;
  replaceStoragePath?: string;
  altText?: string;
  title?: string;
  userId?: string;
  bookCover?: BookCoverProcessOptions;
};

function resolveStoragePath(options: UploadMediaOptions, file: File): string {
  if (options.replaceStoragePath) {
    return bucketPathToStoragePath(options.replaceStoragePath);
  }

  if (options.filename) {
    return canonicalStoragePath(options.folder, options.filename);
  }

  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const baseName = file.name.replace(ext, "");
  return `site-media/${options.folder}/${Date.now()}-${baseName.replace(/[^a-z0-9.-]+/gi, "-")}${ext}`;
}

function withPngExtension(storagePath: string) {
  return storagePath.replace(/\.[^.]+$/, ".png");
}

async function prepareUploadBuffer(
  file: File,
  folder: string,
  bookCover?: BookCoverProcessOptions,
): Promise<{ buffer: Buffer; mimeType: string }> {
  let fileBuffer = Buffer.from(await file.arrayBuffer());
  let mimeType = file.type || "application/octet-stream";

  if (folder === "library" && mimeType.startsWith("image/")) {
    fileBuffer = Buffer.from(await normalizeBookCoverImage(fileBuffer, bookCover));
    mimeType = "image/png";
  }

  return { buffer: fileBuffer, mimeType };
}

async function saveProcessedBuffer(
  fileBuffer: Buffer,
  mimeType: string,
  storagePath: string,
  options: UploadMediaOptions,
  fileName: string,
  existingMediaId?: string | null,
  previousStoragePath?: string | null,
): Promise<UploadedMedia> {
  const supabase = createAdminClient();
  const bucketPath = storagePathToBucketPath(storagePath);

  await supabase.storage.from(BUCKET).remove([bucketPath]);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(bucketPath, fileBuffer, {
      upsert: true,
      contentType: mimeType,
      cacheControl: await getMediaStorageCacheControl(options.folder),
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const publicUrl = withCacheBuster(buildPublicUrl(bucketPath));

  const rowPayload = {
    storage_path: storagePath,
    public_url: publicUrl,
    mime_type: mimeType,
    media_type: inferMediaType(mimeType),
    folder: options.folder,
    alt_text: options.altText ?? null,
    title: options.title ?? fileName,
    updated_by: options.userId ?? null,
  };

  let data: { id: string; public_url: string; storage_path: string } | null =
    null;
  let error: { message: string } | null = null;

  if (existingMediaId) {
    const result = await supabase
      .from("media_assets")
      .update(rowPayload)
      .eq("id", existingMediaId)
      .select("id, public_url, storage_path")
      .single();
    data = result.data;
    error = result.error;
  } else {
    const result = await supabase
      .from("media_assets")
      .upsert(rowPayload, { onConflict: "storage_path" })
      .select("id, public_url, storage_path")
      .single();
    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save media record.");
  }

  if (previousStoragePath && previousStoragePath !== storagePath) {
    await supabase.storage
      .from(BUCKET)
      .remove([storagePathToBucketPath(previousStoragePath)]);
    await supabase
      .from("media_assets")
      .delete()
      .eq("storage_path", previousStoragePath)
      .neq("id", data.id);
  }

  return {
    id: data.id,
    publicUrl: data.public_url,
    storagePath: data.storage_path,
  };
}

export async function uploadMediaAsset(
  file: File,
  options: UploadMediaOptions,
): Promise<UploadedMedia> {
  const folder = options.folder;
  let { buffer: fileBuffer, mimeType } = await prepareUploadBuffer(
    file,
    folder,
    options.bookCover,
  );
  let storagePath = resolveStoragePath(options, file);

  if (folder === "library" && mimeType === "image/png") {
    storagePath = withPngExtension(storagePath);
  }

  return saveProcessedBuffer(fileBuffer, mimeType, storagePath, options, file.name);
}

export async function reprocessBookCoverMedia(
  publicUrl: string,
  options: UploadMediaOptions,
): Promise<UploadedMedia> {
  const supabase = createAdminClient();
  const cleanUrl = stripUrlCacheBuster(publicUrl);
  const storagePath =
    publicUrlToStoragePath(cleanUrl) ??
    options.replaceStoragePath ??
    null;

  if (!storagePath) {
    throw new Error("Could not resolve storage path for this cover.");
  }

  const mediaId = await resolveMediaIdByUrl(publicUrl);
  let previousStoragePath: string | null = storagePath;

  if (mediaId) {
    const { data: existing } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", mediaId)
      .maybeSingle();
    previousStoragePath = existing?.storage_path ?? storagePath;
  }

  const source = await readImageBytesFromUrl(publicUrl);
  const fileBuffer = Buffer.from(await normalizeBookCoverImage(source, options.bookCover));
  const mimeType = "image/png";
  const normalizedPath = withPngExtension(storagePath);

  return saveProcessedBuffer(
    fileBuffer,
    mimeType,
    normalizedPath,
    options,
    options.title ?? "book-cover.png",
    mediaId,
    previousStoragePath,
  );
}

export async function resolveMediaIdByUrl(
  publicUrl: string,
): Promise<string | null> {
  if (!publicUrl) return null;

  const supabase = createAdminClient();
  const cleanUrl = stripUrlCacheBuster(publicUrl);
  const storagePath = publicUrlToStoragePath(cleanUrl);

  if (storagePath) {
    const { data } = await supabase
      .from("media_assets")
      .select("id")
      .eq("storage_path", storagePath)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  const { data } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", publicUrl)
    .maybeSingle();
  if (data?.id) return data.id;

  const { data: byCleanUrl } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", cleanUrl)
    .maybeSingle();

  return byCleanUrl?.id ?? null;
}
