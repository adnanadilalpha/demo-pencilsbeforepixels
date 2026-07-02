"use client";

import { useEffect, useState } from "react";
import { getClientSiteContent } from "./fetch-client";
import { SiteContentContext } from "./hooks";
import type { SiteContent } from "./types";

type SiteContentProviderProps = {
  initialContent: SiteContent;
  children: React.ReactNode;
};

export function SiteContentProvider({
  initialContent,
  children,
}: SiteContentProviderProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);

  useEffect(() => {
    let cancelled = false;

    getClientSiteContent(initialContent)
      .then((next) => {
        if (!cancelled) setContent(next);
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
