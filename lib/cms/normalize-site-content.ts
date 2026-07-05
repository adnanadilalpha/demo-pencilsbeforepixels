import { resolveSiteCacheSettings } from "@/lib/cache/resolve";
import type { SiteContent } from "./types";

/** Backfill fields missing from older cached CMS payloads. */
export function ensureSiteContentShape(content: SiteContent): SiteContent {
  return {
    ...content,
    assetsRevision: content.assetsRevision ?? "0",
    cache: resolveSiteCacheSettings(content.cache),
  };
}
