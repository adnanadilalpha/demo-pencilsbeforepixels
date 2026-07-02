import "server-only";

import type {
  AcademicScoreKey,
  FrlScoreKey,
} from "@/lib/admin/scores/keys";
import { getScoreDatasetMeta, type ScoreDataset } from "@/lib/admin/scores/types";
import { createAdminClient } from "@/lib/supabase/admin";

type FilterableQuery = {
  eq: (column: string, value: string | number) => FilterableQuery;
};

function applyAcademicKey<T extends FilterableQuery>(
  builder: T,
  key: AcademicScoreKey,
): T {
  return builder
    .eq("school_year", key.schoolYear)
    .eq("grade", key.grade)
    .eq("level", key.level)
    .eq("district_id", key.districtId)
    .eq("subgroup_type", key.subgroupType)
    .eq("subgroup_desc", key.subgroupDesc)
    .eq("subject", key.subject) as T;
}

function applyFrlKey<T extends FilterableQuery>(
  builder: T,
  key: FrlScoreKey,
): T {
  return builder
    .eq("school_year", key.schoolYear)
    .eq("level", key.level)
    .eq("district_id", key.districtId)
    .eq("school_id", key.schoolId)
    .eq("agency_name", key.agencyName) as T;
}

export type AcademicScorePatch = {
  agencyName?: string | null;
  avgScaleScore?: number | null;
  countDeveloping?: string | null;
  pctDeveloping?: string | null;
  countOnTrack?: string | null;
  pctOnTrack?: string | null;
  countAdvanced?: string | null;
  pctAdvanced?: string | null;
  countTested?: number | null;
  countNotTested?: string | null;
  pctNotTested?: string | null;
  dataAsOf?: string | null;
  pctBasic?: string | null;
  pctProficient?: string | null;
};

export type FrlScorePatch = {
  agencyName?: string | null;
  pctFrl?: number | null;
  countFrl?: string | null;
  dataAsOf?: string | null;
};

function mapAcademicPatch(patch: AcademicScorePatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};

  if (patch.agencyName !== undefined) dbPatch.agency_name = patch.agencyName;
  if (patch.avgScaleScore !== undefined) dbPatch.avg_scale_score = patch.avgScaleScore;
  if (patch.countDeveloping !== undefined) {
    dbPatch.count_developing = patch.countDeveloping;
  }
  if (patch.pctDeveloping !== undefined) dbPatch.pct_developing = patch.pctDeveloping;
  if (patch.countOnTrack !== undefined) dbPatch.count_ontrack = patch.countOnTrack;
  if (patch.pctOnTrack !== undefined) dbPatch.pct_ontrack = patch.pctOnTrack;
  if (patch.countAdvanced !== undefined) dbPatch.count_advanced = patch.countAdvanced;
  if (patch.pctAdvanced !== undefined) dbPatch.pct_advanced = patch.pctAdvanced;
  if (patch.countTested !== undefined) dbPatch.count_tested = patch.countTested;
  if (patch.countNotTested !== undefined) {
    dbPatch.count_not_tested = patch.countNotTested;
  }
  if (patch.pctNotTested !== undefined) dbPatch.pct_not_tested = patch.pctNotTested;
  if (patch.dataAsOf !== undefined) dbPatch.data_as_of = patch.dataAsOf;
  if (patch.pctBasic !== undefined) dbPatch.pct_basic = patch.pctBasic;
  if (patch.pctProficient !== undefined) dbPatch.pct_proficient = patch.pctProficient;

  return dbPatch;
}

function mapFrlPatch(patch: FrlScorePatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};

  if (patch.agencyName !== undefined) dbPatch.agency_name = patch.agencyName;
  if (patch.pctFrl !== undefined) dbPatch.pct_frl = patch.pctFrl;
  if (patch.countFrl !== undefined) dbPatch.count_frl = patch.countFrl;
  if (patch.dataAsOf !== undefined) dbPatch.data_as_of = patch.dataAsOf;

  return dbPatch;
}

export async function deleteScoreRows(
  dataset: ScoreDataset,
  keys: Array<AcademicScoreKey | FrlScoreKey>,
): Promise<number> {
  if (!keys.length) return 0;

  const meta = getScoreDatasetMeta(dataset);
  const supabase = createAdminClient();
  let deleted = 0;

  for (const key of keys) {
    let builder = supabase.from(meta.table).delete();
    builder =
      dataset === "frl"
        ? applyFrlKey(builder, key as FrlScoreKey)
        : applyAcademicKey(builder, key as AcademicScoreKey);

    const { error } = await builder;
    if (error) throw new Error(error.message);
    deleted += 1;
  }

  return deleted;
}

export async function updateAcademicScoreRow(
  dataset: "math" | "english",
  key: AcademicScoreKey,
  patch: AcademicScorePatch,
): Promise<void> {
  const meta = getScoreDatasetMeta(dataset);
  const dbPatch = mapAcademicPatch(patch);

  if (!Object.keys(dbPatch).length) {
    throw new Error("No fields to update.");
  }

  const supabase = createAdminClient();
  let builder = supabase.from(meta.table).update(dbPatch);
  builder = applyAcademicKey(builder, key);

  const { error } = await builder;
  if (error) throw new Error(error.message);
}

export async function updateFrlScoreRow(
  key: FrlScoreKey,
  patch: FrlScorePatch,
): Promise<void> {
  const meta = getScoreDatasetMeta("frl");
  const dbPatch = mapFrlPatch(patch);

  if (!Object.keys(dbPatch).length) {
    throw new Error("No fields to update.");
  }

  const supabase = createAdminClient();
  let builder = supabase.from(meta.table).update(dbPatch);
  builder = applyFrlKey(builder, key);

  const { error } = await builder;
  if (error) throw new Error(error.message);
}
