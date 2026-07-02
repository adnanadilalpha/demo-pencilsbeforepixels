export type EvidenceScoreRow = {
  school_year: string;
  agency_name?: string;
  level?: string;
  grade: string;
  subgroup_desc?: string;
  subgroup_type?: string;
  avg_scale_score: number | string | null;
  count_tested?: number | string | null;
};

export function getYear(schoolYear: string): number {
  const parts = schoolYear.split("-");
  const suffix = parts[1] ?? "";
  if (suffix.length === 4) return parseInt(suffix, 10);
  return parseInt(`${parts[0].slice(0, 2)}${suffix}`, 10);
}

export function weightedAvg(scores: number[], counts: number[]): number {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return Number.NaN;
  return scores.reduce((sum, score, index) => sum + score * counts[index], 0) / total;
}

export function buildSchoolYearMap(rows: EvidenceScoreRow[]) {
  const map: Record<
    string,
    { scores: number[]; counts: number[]; grades: string[] }
  > = {};

  rows.forEach((row) => {
    const score = parseFloat(String(row.avg_scale_score));
    const rawCount = parseFloat(String(row.count_tested ?? ""));

    if (!Number.isFinite(score) || score <= 0) return;

    const count = Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 1;
    const year = row.school_year;

    if (!map[year]) {
      map[year] = { scores: [], counts: [], grades: [] };
    }

    map[year].scores.push(score);
    map[year].counts.push(count);

    const gradeLabel = `Grade ${parseInt(row.grade, 10)}`;
    if (!map[year].grades.includes(gradeLabel)) {
      map[year].grades.push(gradeLabel);
    }
  });

  return map;
}

export function sortedSchoolYears(rows: EvidenceScoreRow[]) {
  return [...new Set(rows.map((row) => row.school_year))].sort(
    (left, right) => getYear(left) - getYear(right),
  );
}

export function formatGradeLabel(grades: string[]) {
  if (grades.length === 0) return "Grade";
  if (grades.length === 6) return "All Grades";
  if (grades.length === 1) {
    return grades[0] === "ALL"
      ? "All Grades"
      : `Grade ${parseInt(grades[0], 10)}`;
  }

  return grades
    .map((grade) =>
      grade === "ALL" ? "All Grades" : `Grade ${parseInt(grade, 10)}`,
    )
    .join(", ");
}

export function formatSchoolYear(year: string) {
  return year.replace("-", "–");
}
