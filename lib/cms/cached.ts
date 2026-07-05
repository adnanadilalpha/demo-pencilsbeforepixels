import { unstable_cache } from "next/cache";
import { isSiteCacheEnabled } from "@/lib/cache/server";
import { getAssetsRevision } from "./assets-revision";
import { getSiteContentUncached } from "./fetch-server";
import { ensureSiteContentShape } from "./normalize-site-content";
import type { SiteContent } from "./types";

const getCachedSiteContent = unstable_cache(
  async (_assetsRevision: string): Promise<SiteContent> =>
    ensureSiteContentShape(await getSiteContentUncached()),
  ["site-content-v3"],
  { tags: ["site-content"], revalidate: 3600 },
);

export async function getSiteContent(): Promise<SiteContent> {
  const assetsRevision = await getAssetsRevision();

  if (!(await isSiteCacheEnabled())) {
    return ensureSiteContentShape(await getSiteContentUncached());
  }

  return getCachedSiteContent(assetsRevision);
}
