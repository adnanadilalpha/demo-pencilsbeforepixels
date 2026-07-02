import type { AcademicScoreRow, FrlScoreRow } from "@/lib/admin/scores/types";

export type AcademicScoreKey = {
  schoolYear: string;
  grade: string;
  level: string;
  districtId: string;
  subgroupType: string;
  subgroupDesc: string;
  subject: string;
};

export type FrlScoreKey = {
  schoolYear: string;
  level: string;
  districtId: number;
  schoolId: number;
  agencyName: string;
};

export type ScoreRowKey = AcademicScoreKey | FrlScoreKey;

export function academicRowToKey(row: AcademicScoreRow): AcademicScoreKey {
  return {
    schoolYear: row.schoolYear ?? "",
    grade: row.grade ?? "",
    level: row.level ?? "",
    districtId: row.districtId ?? "",
    subgroupType: row.subgroupType ?? "",
    subgroupDesc: row.subgroupDesc ?? "",
    subject: row.subject ?? "",
  };
}

export function frlRowToKey(row: FrlScoreRow): FrlScoreKey {
  return {
    schoolYear: row.schoolYear ?? "",
    level: row.level ?? "",
    districtId: row.districtId ?? 0,
    schoolId: row.schoolId ?? 0,
    agencyName: row.agencyName ?? "",
  };
}

export function scoreRowLabel(
  dataset: "math" | "english" | "frl",
  row: AcademicScoreRow | FrlScoreRow,
): string {
  if (dataset === "frl") {
    const frlRow = row as FrlScoreRow;
    return `${frlRow.agencyName ?? "Unknown agency"} · ${frlRow.schoolYear ?? "—"}`;
  }

  const academicRow = row as AcademicScoreRow;
  return `${academicRow.agencyName ?? "Unknown agency"} · ${academicRow.grade ?? "—"} · ${academicRow.subgroupDesc ?? academicRow.subgroupType ?? "—"}`;
}
