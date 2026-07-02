const BUCKET = "site-media";

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function canonicalStoragePath(folder: string, filename: string): string {
  return `site-media/${folder}/${sanitizeFilename(filename)}`;
}

export function stripUrlCacheBuster(publicUrl: string): string {
  if (!publicUrl) return publicUrl;

  try {
    if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
      const parsed = new URL(publicUrl);
      return `${parsed.origin}${parsed.pathname}`;
    }
  } catch {
    // Fall through to string split.
  }

  return publicUrl.split("?")[0].split("#")[0];
}

export function withCacheBuster(publicUrl: string, token = Date.now()): string {
  const base = stripUrlCacheBuster(publicUrl);
  return `${base}?v=${token}`;
}

export function storagePathToBucketPath(storagePath: string): string {
  return storagePath.replace(/^site-media\//, "");
}

export function bucketPathToStoragePath(bucketPath: string): string {
  return bucketPath.startsWith("site-media/")
    ? bucketPath
    : `site-media/${bucketPath.replace(/^\//, "")}`;
}

export function publicUrlToStoragePath(publicUrl: string): string | null {
  const cleanUrl = stripUrlCacheBuster(publicUrl);
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = cleanUrl.indexOf(marker);
  if (index === -1) return null;
  const bucketPath = cleanUrl.slice(index + marker.length);
  return bucketPathToStoragePath(bucketPath);
}

export function buildPublicUrl(
  supabaseUrl: string,
  bucketPath: string,
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const normalized = bucketPath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${normalized}`;
}
