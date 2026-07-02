import { unstable_cache } from "next/cache";
import { getEvidenceBootstrapUncached } from "@/lib/evidence/fetch";
import { getEvidenceVersionUncached } from "@/lib/evidence/version-server";
import type { EvidenceBootstrap, EvidenceVersion } from "@/lib/evidence/types";

export const getEvidenceVersion = unstable_cache(
  async (): Promise<EvidenceVersion> => getEvidenceVersionUncached(),
  ["evidence-version"],
  { tags: ["evidence-data"], revalidate: 3600 },
);

export const getEvidenceBootstrap = unstable_cache(
  async (): Promise<EvidenceBootstrap> => {
    const [version, bootstrap] = await Promise.all([
      getEvidenceVersionUncached(),
      getEvidenceBootstrapUncached(),
    ]);

    return { ...bootstrap, version: version.version };
  },
  ["evidence-bootstrap"],
  { tags: ["evidence-data"], revalidate: 3600 },
);
