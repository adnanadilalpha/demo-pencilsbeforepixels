import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ScoreTable = "math_scores" | "english_scores";

export type EditableScoreRow = {
  table: ScoreTable;
  schoolYear: string;
  grade: string;
  level: string;
  districtId: string;
  subgroupType: string;
  subgroupDesc: string;
  subject: string;
  agencyName: string;
  avgScaleScore: number | null;
};

type ScoreQuery = {
  table: ScoreTable;
  filters: Record<string, string | string[]>;
};

const NEBRASKA_QUERIES: ScoreQuery[] = [
  {
    table: "math_scores",
    filters: {
      level: "ST",
      subgroup_type: "ALL",
      grade: ["03", "04", "05", "06", "07", "08", "ALL"],
    },
  },
  {
    table: "math_scores",
    filters: { level: "ST", subgroup_type: "GENDER", grade: "ALL" },
  },
  {
    table: "english_scores",
    filters: {
      level: "ST",
      subgroup_type: "ALL",
      grade: ["03", "04", "05", "06", "07", "08", "ALL"],
    },
  },
  {
    table: "math_scores",
    filters: { level: "ST", subgroup_type: "ALL", grade: "08" },
  },
  {
    table: "english_scores",
    filters: { level: "ST", subgroup_type: "ALL", grade: "08" },
  },
];

const DISTRICT_66_QUERIES: ScoreQuery[] = [
  {
    table: "math_scores",
    filters: {
      district_id: "66",
      level: "DI",
      subgroup_type: "GENDER",
      grade: "ALL",
    },
  },
  {
    table: "math_scores",
    filters: {
      district_id: "66",
      level: "SC",
      subgroup_type: "ALL",
      grade: ["03", "04", "05", "06", "07", "08"],
    },
  },
  {
    table: "english_scores",
    filters: {
      district_id: "66",
      level: "SC",
      subgroup_type: "ALL",
      grade: ["03", "04", "05", "06", "07", "08"],
    },
  },
];

function mapRow(table: ScoreTable, row: Record<string, unknown>): EditableScoreRow {
  return {
    table,
    schoolYear: String(row.school_year ?? ""),
    grade: String(row.grade ?? ""),
    level: String(row.level ?? ""),
    districtId: String(row.district_id ?? ""),
    subgroupType: String(row.subgroup_type ?? ""),
    subgroupDesc: String(row.subgroup_desc ?? ""),
    subject: String(row.subject ?? ""),
    agencyName: String(row.agency_name ?? ""),
    avgScaleScore:
      row.avg_scale_score === null || row.avg_scale_score === undefined
        ? null
        : Number(row.avg_scale_score),
  };
}

async function fetchScoreQuery(query: ScoreQuery): Promise<EditableScoreRow[]> {
  const supabase = createAdminClient();
  let builder = supabase.from(query.table).select(
    "school_year, grade, level, district_id, subgroup_type, subgroup_desc, subject, agency_name, avg_scale_score",
  );

  for (const [key, value] of Object.entries(query.filters)) {
    const column = key === "district_id" ? "district_id" : key;
    if (Array.isArray(value)) {
      builder = builder.in(column, value);
    } else {
      builder = builder.eq(column, value);
    }
  }

  const { data, error } = await builder
    .order("school_year")
    .order("grade")
    .order("subgroup_desc");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapRow(query.table, row));
}

export async function loadEvidenceScores(
  scope: "nebraska" | "district66",
): Promise<EditableScoreRow[]> {
  const queries = scope === "nebraska" ? NEBRASKA_QUERIES : DISTRICT_66_QUERIES;
  const batches = await Promise.all(queries.map((query) => fetchScoreQuery(query)));
  const seen = new Set<string>();

  return batches.flat().filter((row) => {
    const key = [
      row.table,
      row.schoolYear,
      row.grade,
      row.level,
      row.districtId,
      row.subgroupType,
      row.subgroupDesc,
      row.subject,
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function saveEvidenceScores(rows: EditableScoreRow[]): Promise<void> {
  const supabase = createAdminClient();

  await Promise.all(
    rows.map(async (row) => {
      const { data: existing } = await supabase
        .from(row.table)
        .select("school_year")
        .eq("school_year", row.schoolYear)
        .eq("grade", row.grade)
        .eq("level", row.level)
        .eq("district_id", row.districtId)
        .eq("subgroup_type", row.subgroupType)
        .eq("subgroup_desc", row.subgroupDesc)
        .eq("subject", row.subject)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from(row.table)
          .update({ avg_scale_score: row.avgScaleScore })
          .eq("school_year", row.schoolYear)
          .eq("grade", row.grade)
          .eq("level", row.level)
          .eq("district_id", row.districtId)
          .eq("subgroup_type", row.subgroupType)
          .eq("subgroup_desc", row.subgroupDesc)
          .eq("subject", row.subject);

        if (error) throw new Error(`Failed to update score: ${error.message}`);
        return;
      }

      const { error } = await supabase.from(row.table).insert({
        school_year: row.schoolYear,
        grade: row.grade,
        level: row.level,
        district_id: row.districtId,
        subgroup_type: row.subgroupType,
        subgroup_desc: row.subgroupDesc,
        subject: row.subject,
        agency_name: row.agencyName || null,
        avg_scale_score: row.avgScaleScore,
      });

      if (error) throw new Error(`Failed to insert score: ${error.message}`);
    }),
  );
}
