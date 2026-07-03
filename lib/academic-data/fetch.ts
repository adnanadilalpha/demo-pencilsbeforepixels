import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { getSiteContent } from "@/lib/cms/cached";
import {
  applyAcademicCopyOverride,
  loadAcademicCopyOverrides,
} from "./copy-overrides";
import { hydrateAcademicStaticDatasets } from "./hydrate-static";
import {
  buildNebraskaEnglishDataset,
  buildNebraskaMathDataset,
  buildNebraskaMathGenderDataset,
  buildWestsideMathGenderDataset,
} from "./builders";
import { stateFederalParccDataset } from "./static";
import type { AcademicDataset } from "./types";

const WESTSIDE_DISTRICT_ID = "66";

function getStateFederalDataset(
  overrides: Map<
    string,
    Pick<AcademicDataset, "label" | "title" | "description" | "insight">
  >,
): AcademicDataset {
  return applyAcademicCopyOverride(stateFederalParccDataset, overrides);
}

export async function getAcademicDatasets(): Promise<AcademicDataset[]> {
  const supabase = createAdminClient();
  const siteContent = await getSiteContent();
  const staticAcademicDatasets = hydrateAcademicStaticDatasets(
    siteContent.academicStatic,
  );

  const [
    copyOverrides,
    nebraskaMathByGrade,
    nebraskaMathGender,
    westsideMathGender,
    nebraskaEnglish,
  ] = await Promise.all([
    loadAcademicCopyOverrides(),
    fetchAllRows((from, to) =>
      supabase
        .from("math_scores")
        .select("school_year, grade, avg_scale_score, count_tested")
        .eq("level", "ST")
        .eq("subgroup_type", "ALL")
        .in("grade", ["03", "04", "05", "06"])
        .order("school_year")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("math_scores")
        .select(
          "school_year, grade, subgroup_desc, avg_scale_score, count_tested, agency_name",
        )
        .eq("level", "ST")
        .eq("subgroup_type", "GENDER")
        .in("grade", ["03", "04", "05", "06"])
        .order("school_year")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("math_scores")
        .select(
          "school_year, grade, subgroup_desc, avg_scale_score, count_tested, agency_name",
        )
        .eq("district_id", WESTSIDE_DISTRICT_ID)
        .eq("level", "DI")
        .eq("subgroup_type", "GENDER")
        .in("grade", ["03", "04", "05", "06"])
        .order("school_year")
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("english_scores")
        .select("school_year, grade, avg_scale_score, count_tested")
        .eq("level", "ST")
        .eq("subgroup_type", "ALL")
        .in("grade", ["03", "04", "05", "06"])
        .order("school_year")
        .range(from, to),
    ),
  ]);

  return [
    applyAcademicCopyOverride(staticAcademicDatasets[0], copyOverrides),
    applyAcademicCopyOverride(staticAcademicDatasets[1], copyOverrides),
    applyAcademicCopyOverride(staticAcademicDatasets[2], copyOverrides),
    applyAcademicCopyOverride(
      buildNebraskaMathDataset(nebraskaMathByGrade),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildNebraskaMathGenderDataset(nebraskaMathGender),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildWestsideMathGenderDataset(westsideMathGender),
      copyOverrides,
    ),
    applyAcademicCopyOverride(
      buildNebraskaEnglishDataset(nebraskaEnglish),
      copyOverrides,
    ),
    getStateFederalDataset(copyOverrides),
  ];
}
