"use client";

import { useEffect, useState } from "react";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { getClientSiteContent } from "./fetch-client";
import { SiteContentContext } from "./hooks";
import type { SiteContent } from "./types";

function normalizeSiteContent(content: SiteContent): SiteContent {
  return {
    ...content,
    research: mergeResearchWithFallback(content.research),
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
  const [content, setContent] = useState<SiteContent>(() =>
    normalizeSiteContent(initialContent),
  );

  useEffect(() => {
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
  }, [initialContent]);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}
