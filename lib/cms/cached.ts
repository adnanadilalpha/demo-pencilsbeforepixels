import { unstable_cache } from "next/cache";
import { getSiteContentUncached } from "./fetch-server";
import type { SiteContent } from "./types";

export const getSiteContent = unstable_cache(
  async (): Promise<SiteContent> => getSiteContentUncached(),
  ["site-content"],
  { tags: ["site-content"], revalidate: 3600 },
);
