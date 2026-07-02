import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/cms/cached";
import {
  applyAcademicCopyOverride,
  loadAcademicCopyOverrides,
} from "./copy-overrides";
import {
  buildNebraskaEnglishDataset,
  buildNebraskaMathDataset,
  buildNebraskaMathGenderDataset,
  buildStateFederalDataset,
  buildWestsideMathGenderDataset,
} from "./builders";
import type { AcademicDataset } from "./types";

const WESTSIDE_DISTRICT_ID = "66";

export async function getAcademicDatasets(): Promise<AcademicDataset[]> {
  const supabase = createAdminClient();
  const siteContent = await getSiteContent();
  const staticAcademicDatasets = siteContent.academicStatic;

  const [
    copyOverrides,
    nebraskaMathByGrade,
    nebraskaMathGender,
    westsideMathGender,
    nebraskaEnglish,
    mathProficiency,
    englishProficiency,
  ] = await Promise.all([
    loadAcademicCopyOverrides(),
    supabase
      .from("math_scores")
      .select("school_year, grade, avg_scale_score")
      .eq("level", "ST")
      .eq("subgroup_type", "ALL")
      .in("grade", ["03", "04", "05", "06", "07", "08"])
      .order("school_year"),
    supabase
      .from("math_scores")
      .select("school_year, subgroup_desc, avg_scale_score")
      .eq("level", "ST")
      .eq("subgroup_type", "GENDER")
      .eq("grade", "ALL")
      .order("school_year"),
    supabase
      .from("math_scores")
      .select("school_year, subgroup_desc, avg_scale_score")
      .eq("district_id", WESTSIDE_DISTRICT_ID)
      .eq("level", "DI")
      .eq("subgroup_type", "GENDER")
      .eq("grade", "ALL")
      .order("school_year"),
    supabase
      .from("english_scores")
      .select("school_year, grade, avg_scale_score")
      .eq("level", "ST")
      .eq("subgroup_type", "ALL")
      .in("grade", ["03", "04", "05", "06", "07", "08", "ALL"])
      .order("school_year"),
    supabase
      .from("math_scores")
      .select("school_year, pct_ontrack, pct_advanced, pct_developing")
      .eq("level", "ST")
      .eq("subgroup_type", "ALL")
      .eq("grade", "08")
      .order("school_year"),
    supabase
      .from("english_scores")
      .select("school_year, pct_ontrack, pct_advanced, pct_developing")
      .eq("level", "ST")
      .eq("subgroup_type", "ALL")
      .eq("grade", "08")
      .order("school_year"),
  ]);

  const errors = [
    nebraskaMathByGrade.error,
    nebraskaMathGender.error,
    westsideMathGender.error,
    nebraskaEnglish.error,
    mathProficiency.error,
    englishProficiency.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error("Academic data fetch errors:", errors);
  }

  return [
    applyAcademicCopyOverride(staticAcademicDatasets[0], copyOverrides),
    applyAcademicCopyOverride(staticAcademicDatasets[1], copyOverrides),
    applyAcademicCopyOverride(staticAcademicDatasets[2], copyOverrides),
    applyAcademicCopyOverride(
      buildNebraskaMathDataset(nebraskaMathByGrade.data ?? []),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildNebraskaMathGenderDataset(nebraskaMathGender.data ?? []),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildWestsideMathGenderDataset(westsideMathGender.data ?? []),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildNebraskaEnglishDataset(nebraskaEnglish.data ?? []),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildStateFederalDataset(
        mathProficiency.data ?? [],
        englishProficiency.data ?? [],
      ),
      copyOverrides,
    ),
  ];
}
