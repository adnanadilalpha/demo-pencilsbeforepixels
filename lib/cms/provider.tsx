"use client";

import { useEffect, useState } from "react";
import { isSiteCacheEnabledFromSettings } from "@/lib/cache/resolve";
import { setClientSiteCacheEnabled } from "@/lib/cache/client-state";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { clearSiteContentCache } from "./cache";
import { getClientSiteContent } from "./fetch-client";
import { SiteContentContext } from "./hooks";
import { ensureSiteContentShape } from "./normalize-site-content";
import { clearEvidenceCache } from "@/lib/evidence/cache";
import type { SiteContent } from "./types";

function normalizeSiteContent(content: SiteContent): SiteContent {
  const shaped = ensureSiteContentShape(content);

  return {
    ...shaped,
    research: mergeResearchWithFallback(shaped.research),
  };
}

type SiteContentProviderProps = {
  initialContent: SiteContent;
  children: React.ReactNode;
};

export function SiteContentProvider({
  initialContent,
  children,
}: SiteContentProviderProps) {
  const cacheEnabled = isSiteCacheEnabledFromSettings(initialContent.cache);

  setClientSiteCacheEnabled(cacheEnabled);

  const [content, setContent] = useState<SiteContent>(() =>
    normalizeSiteContent(initialContent),
  );

  useEffect(() => {
    if (!cacheEnabled) {
      clearSiteContentCache();
      clearEvidenceCache();
    }

    let cancelled = false;

    getClientSiteContent(initialContent)
      .then((next) => {
        if (!cancelled) setContent(normalizeSiteContent(next));
      })
      .catch(() => {
        // Keep server-hydrated content on cache errors.
      });

    return () => {
      cancelled = true;
    };
  }, [initialContent, cacheEnabled]);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}
