import { unstable_cache } from "next/cache";
import { isSiteCacheEnabled } from "@/lib/cache/server";
import { getEvidenceBootstrapUncached } from "@/lib/evidence/fetch";
import { getEvidenceVersionUncached } from "@/lib/evidence/version-server";
import type { EvidenceBootstrap, EvidenceVersion } from "@/lib/evidence/types";

const getCachedEvidenceVersion = unstable_cache(
  async (): Promise<EvidenceVersion> => getEvidenceVersionUncached(),
  ["evidence-version"],
  { tags: ["evidence-data"], revalidate: 3600 },
);

const getCachedEvidenceBootstrap = unstable_cache(
  async (): Promise<EvidenceBootstrap> => {
    const [version, bootstrap] = await Promise.all([
      getEvidenceVersionUncached(),
      getEvidenceBootstrapUncached(),
    ]);

    return { ...bootstrap, version: version.version };
  },
  ["evidence-bootstrap-v3"],
  { tags: ["evidence-data"], revalidate: 3600 },
);

export async function getEvidenceVersion(): Promise<EvidenceVersion> {
  if (!(await isSiteCacheEnabled())) {
    return getEvidenceVersionUncached();
  }

  return getCachedEvidenceVersion();
}

export async function getEvidenceBootstrap(): Promise<EvidenceBootstrap> {
  if (!(await isSiteCacheEnabled())) {
    const [version, bootstrap] = await Promise.all([
      getEvidenceVersionUncached(),
      getEvidenceBootstrapUncached(),
    ]);

    return { ...bootstrap, version: version.version };
  }

  return getCachedEvidenceBootstrap();
}
