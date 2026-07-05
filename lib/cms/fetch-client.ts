"use client";

import {
  readCachedSiteContent,
  readCachedVersion,
  writeCachedSiteContent,
} from "./cache";
import { isClientSiteCacheEnabled } from "@/lib/cache/client-state";
import { ensureSiteContentShape } from "./normalize-site-content";
import type { ContentVersion, SiteContent } from "./types";

export async function fetchContentVersion(): Promise<ContentVersion> {
  const res = await fetch("/api/content/version", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch content version");
  return res.json() as Promise<ContentVersion>;
}

export async function fetchSiteContentBundle(): Promise<SiteContent> {
  const res = await fetch("/api/content/site", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch site content");
  return res.json() as Promise<SiteContent>;
}

function contentCacheKey(version: ContentVersion): string {
  return `${version.version}:${version.assetsRevision}`;
}

export async function getClientSiteContent(
  initial: SiteContent,
): Promise<SiteContent> {
  if (!isClientSiteCacheEnabled()) {
    try {
      return ensureSiteContentShape(await fetchSiteContentBundle());
    } catch {
      return ensureSiteContentShape(initial);
    }
  }

  try {
    const remoteVersion = await fetchContentVersion();
    const remoteKey = contentCacheKey(remoteVersion);

    if (
      remoteVersion.version === initial.version &&
      remoteVersion.assetsRevision === initial.assetsRevision
    ) {
      writeCachedSiteContent(initial, remoteVersion);
      return ensureSiteContentShape(initial);
    }

    const cachedVersion = readCachedVersion();
    const cached = readCachedSiteContent();
    if (
      cachedVersion === remoteKey &&
      cached?.version === remoteVersion.version &&
      cached.assetsRevision === remoteVersion.assetsRevision
    ) {
      return ensureSiteContentShape(cached);
    }

    const bundle = await fetchSiteContentBundle();
    writeCachedSiteContent(bundle, remoteVersion);
    return ensureSiteContentShape(bundle);
  } catch {
    return ensureSiteContentShape(initial);
  }
}
