import { unstable_cache } from "next/cache";
import { isSiteCacheEnabled } from "@/lib/cache/server";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { getAssetsRevision } from "./assets-revision";
import { getSiteContentUncached } from "./fetch-server";
import { ensureSiteContentShape } from "./normalize-site-content";
import type { SiteContent } from "./types";

function withLiveResearchMerge(content: SiteContent): SiteContent {
  const shaped = ensureSiteContentShape(content);
  return {
    ...shaped,
    research: mergeResearchWithFallback(shaped.research),
  };
}

const getCachedSiteContent = unstable_cache(
  async (_assetsRevision: string): Promise<SiteContent> =>
    withLiveResearchMerge(await getSiteContentUncached()),
  ["site-content-v4"],
  { tags: ["site-content"], revalidate: 3600 },
);

export async function getSiteContent(): Promise<SiteContent> {
  const assetsRevision = await getAssetsRevision();

  if (!(await isSiteCacheEnabled())) {
    return withLiveResearchMerge(await getSiteContentUncached());
  }

  return withLiveResearchMerge(await getCachedSiteContent(assetsRevision));
}
