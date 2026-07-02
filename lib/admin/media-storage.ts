import "server-only";

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

export async function uploadMediaAsset(
  file: File,
  options: UploadMediaOptions,
): Promise<UploadedMedia> {
  const supabase = createAdminClient();
  const mimeType = file.type || "application/octet-stream";
  const mediaType = inferMediaType(mimeType);
  const storagePath = resolveStoragePath(options, file);
  const bucketPath = storagePathToBucketPath(storagePath);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Remove first so same-path replaces always write fresh bytes to storage.
  await supabase.storage.from(BUCKET).remove([bucketPath]);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(bucketPath, fileBuffer, {
      upsert: true,
      contentType: mimeType,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const publicUrl = withCacheBuster(buildPublicUrl(bucketPath));

  const { data, error } = await supabase
    .from("media_assets")
    .upsert(
      {
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: mimeType,
        media_type: mediaType,
        folder: options.folder,
        alt_text: options.altText ?? null,
        title: options.title ?? file.name,
        updated_by: options.userId ?? null,
      },
      { onConflict: "storage_path" },
    )
    .select("id, public_url, storage_path")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save media record.");
  }

  return {
    id: data.id,
    publicUrl: data.public_url,
    storagePath: data.storage_path,
  };
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
