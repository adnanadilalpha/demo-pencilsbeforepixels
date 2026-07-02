import { unstable_cache } from "next/cache";
import {
  getContentVersionUncached,
  getSiteContentUncached,
} from "./fetch-server";
import type { ContentVersion, SiteContent } from "./types";

export const getSiteContent = unstable_cache(
  async (): Promise<SiteContent> => getSiteContentUncached(),
  ["site-content"],
  { tags: ["site-content"], revalidate: 3600 },
);

export const getContentVersion = unstable_cache(
  async (): Promise<ContentVersion> => {
    const v = await getContentVersionUncached();
    return { version: v.version, publishedAt: v.publishedAt };
  },
  ["content-version"],
  { tags: ["site-content"], revalidate: 3600 },
);
