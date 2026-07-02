"use client";

import { createContext, useContext } from "react";
import type { SectionKey, SiteContent } from "./types";

export const SiteContentContext = createContext<SiteContent | null>(null);

export function useSiteContent(): SiteContent {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

export function useSection(key: SectionKey): Record<string, unknown> {
  const content = useSiteContent();
  return content.sections[key] ?? {};
}

