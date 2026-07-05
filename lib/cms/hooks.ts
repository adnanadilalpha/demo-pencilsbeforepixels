"use client";

import { createContext, useContext } from "react";
import { isSiteCacheEnabledFromSettings } from "@/lib/cache/resolve";
import type { SectionKey, SiteContent } from "./types";

export const SiteContentContext = createContext<SiteContent | null>(null);

export function useSiteContent(): SiteContent {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

export function useSiteCacheEnabled(): boolean {
  const content = useSiteContent();
  return isSiteCacheEnabledFromSettings(content.cache);
}

export function useSection(key: SectionKey): Record<string, unknown> {
  const content = useSiteContent();
  return content.sections[key] ?? {};
}

