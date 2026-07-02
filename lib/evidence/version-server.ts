import "server-only";

import { getContentVersionUncached } from "@/lib/cms/fetch-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EvidenceVersion } from "@/lib/evidence/types";

export async function getEvidenceVersionUncached(): Promise<EvidenceVersion> {
  const supabase = createAdminClient();

  const { data: setting } = await supabase
    .from("site_settings")
    .select("value, updated_at")
    .eq("key", "evidence.data_version")
    .maybeSingle();

  const stored = setting?.value as { version?: string } | null;
  if (stored?.version) {
    return {
      version: stored.version,
      updatedAt: setting?.updated_at ?? new Date().toISOString(),
    };
  }

  const [latestYearRes, cmsVersion] = await Promise.all([
    supabase
      .from("math_scores")
      .select("school_year")
      .eq("level", "ST")
      .order("school_year", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getContentVersionUncached(),
  ]);

  const latestYear = latestYearRes.data?.school_year ?? "unknown";

  return {
    version: `${latestYear}:${cmsVersion.version}`,
    updatedAt: cmsVersion.publishedAt,
  };
}
