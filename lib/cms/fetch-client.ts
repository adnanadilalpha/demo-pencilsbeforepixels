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
  const remoteVersion = await fetchContentVersion();
  const cachedVersion = readCachedVersion();

  if (cachedVersion === remoteVersion.version) {
    const cached = readCachedSiteContent();
    if (cached) return cached;
  }

  const bundle =
    initial.version === remoteVersion.version
      ? initial
      : await fetchSiteContentBundle();

  writeCachedSiteContent(bundle, remoteVersion);
  return bundle;
}
