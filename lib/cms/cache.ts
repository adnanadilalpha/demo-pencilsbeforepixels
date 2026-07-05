"use client";

import { isClientSiteCacheEnabled } from "@/lib/cache/client-state";
import { ensureSiteContentShape } from "./normalize-site-content";
import type { ContentVersion, SiteContent } from "./types";

const VERSION_KEY = "pbp:content-version";
const CONTENT_KEY = "pbp:site-content";

export function readCachedSiteContent(): SiteContent | null {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return null;
    return ensureSiteContentShape(JSON.parse(raw) as SiteContent);
  } catch {
    return null;
  }
}

export function readCachedVersion(): string | null {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return null;
  return localStorage.getItem(VERSION_KEY);
}

export function writeCachedSiteContent(
  content: SiteContent,
  version: ContentVersion,
): void {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return;
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  localStorage.setItem(VERSION_KEY, `${version.version}:${version.assetsRevision}`);
}

export function clearSiteContentCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONTENT_KEY);
  localStorage.removeItem(VERSION_KEY);
}
