import { mergeSiteCacheSettings } from "@/lib/cache/settings";
import type { SiteCacheSettings } from "@/lib/cache/types";

export function resolveSiteCacheSettings(
  cache: SiteCacheSettings | undefined | null,
): SiteCacheSettings {
  return mergeSiteCacheSettings(cache ?? undefined);
}

export function isSiteCacheEnabledFromSettings(
  cache: SiteCacheSettings | undefined | null,
): boolean {
  return resolveSiteCacheSettings(cache).enabled;
}
