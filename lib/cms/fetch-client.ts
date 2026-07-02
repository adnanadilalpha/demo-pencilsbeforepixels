"use client";

import {
  readCachedSiteContent,
  readCachedVersion,
  writeCachedSiteContent,
} from "./cache";
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

export async function getClientSiteContent(
  initial: SiteContent,
): Promise<SiteContent> {
  try {
    const remoteVersion = await fetchContentVersion();

    // SSR payload is already up to date for the current publish version.
    if (remoteVersion.version === initial.version) {
      writeCachedSiteContent(initial, remoteVersion);
      return initial;
    }

    // Publish bumped the version but this document still has older SSR data.
    const cachedVersion = readCachedVersion();
    if (
      cachedVersion === remoteVersion.version &&
      readCachedSiteContent()?.version === remoteVersion.version
    ) {
      const cached = readCachedSiteContent();
      if (cached) return cached;
    }

    const bundle = await fetchSiteContentBundle();
    writeCachedSiteContent(bundle, remoteVersion);
    return bundle;
  } catch {
    return initial;
  }
}
