import "server-only";

import { mergeSiteCacheSettings } from "@/lib/cache/settings";
import {
  DEFAULT_SITE_CACHE,
  SITE_CACHE_SETTINGS_KEY,
  type SiteCacheSettings,
} from "@/lib/cache/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const NO_STORE_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
} as const;

const EVIDENCE_VERSION_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const EVIDENCE_BOOTSTRAP_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;

export async function getSiteCacheSettings(): Promise<SiteCacheSettings> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SITE_CACHE_SETTINGS_KEY)
      .maybeSingle();

    return mergeSiteCacheSettings(data?.value);
  } catch {
    return { ...DEFAULT_SITE_CACHE };
  }
}

export async function isSiteCacheEnabled(): Promise<boolean> {
  const settings = await getSiteCacheSettings();
  return settings.enabled;
}

export async function getApiCacheHeaders(
  kind: "content" | "evidence-version" | "evidence-bootstrap" | "evidence-data",
): Promise<Record<string, string>> {
  if (!(await isSiteCacheEnabled())) {
    return { ...NO_STORE_CACHE_HEADERS };
  }

  switch (kind) {
    case "evidence-version":
      return { ...EVIDENCE_VERSION_CACHE_HEADERS };
    case "evidence-bootstrap":
      return { ...EVIDENCE_BOOTSTRAP_CACHE_HEADERS };
    case "content":
    case "evidence-data":
    default:
      return { ...NO_STORE_CACHE_HEADERS };
  }
}

export async function getMediaStorageCacheControl(folder: string): Promise<string> {
  if (!(await isSiteCacheEnabled()) || folder === "library") {
    return "0";
  }

  return "3600";
}
