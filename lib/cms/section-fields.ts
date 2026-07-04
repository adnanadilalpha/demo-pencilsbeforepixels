import { buildFallbackSiteContent } from "./fallback";
import type { SectionKey } from "./types";

export function resolveSectionTextField(
  content: Record<string, unknown> | undefined,
  fallback: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = content?.[key];
  if (typeof value === "string" && value.trim()) return value;

  const fallbackValue = fallback?.[key];
  return typeof fallbackValue === "string" ? fallbackValue : "";
}

export function mergeSectionWithFallback(
  sectionKey: SectionKey,
  stored: Record<string, unknown> | undefined,
  fallbackSections?: Partial<Record<SectionKey, Record<string, unknown>>>,
): Record<string, unknown> {
  const fallbacks = fallbackSections ?? buildFallbackSiteContent().sections;
  const fallback = fallbacks[sectionKey] ?? {};
  const merged: Record<string, unknown> = { ...fallback };

  for (const [key, value] of Object.entries(stored ?? {})) {
    if (typeof value === "string") {
      if (value.trim()) merged[key] = value;
      continue;
    }

    if (value !== undefined && value !== null) {
      merged[key] = value;
    }
  }

  return merged;
}
