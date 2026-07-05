import {
  DEFAULT_SITE_CACHE,
  type SiteCacheSettings,
} from "@/lib/cache/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mergeSiteCacheSettings(value: unknown): SiteCacheSettings {
  const record = asRecord(value);

  if (typeof record.enabled === "boolean") {
    return { enabled: record.enabled };
  }

  return { ...DEFAULT_SITE_CACHE };
}
