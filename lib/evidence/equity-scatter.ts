import "server-only";

import type {
  DistrictOption,
  EquityDistrictPoint,
  EquityScatterPanelData,
  EvidenceSubject,
  EvidenceTab,
} from "./types";
import { colorForDistrictIndex } from "./builders";
import { getYear, weightedAvg } from "./chart-utils";
import { normalizeDistrictName } from "./district-names";
import { formatSchoolDisplayName } from "./school-names";

type ScoreRow = {
  agency_name: string;
  school_year: string;
  grade: string;
  avg_scale_score: number | string | null;
  count_tested?: number | string | null;
};

type FrlRow = {
  agency_name: string;
  school_year: string;
  pct_frl: number | string | null;
  count_frl?: number | string | null;
};

function normalizeGrades(grades: string[]) {
  const normalized = grades
    .map((grade) => grade.padStart(2, "0"))
    .filter(Boolean);
  return normalized.length > 0 ? normalized : ["03"];
}

function schoolYearMatches(rowYear: string, selectedYear: string) {
  return getYear(rowYear) === getYear(selectedYear);
}

function buildDistrictScores(
  rows: ScoreRow[],
  grades: string[],
  schoolYear: string,
) {
  const gradeSet = new Set(grades);
  const byDistrict: Record<
    string,
    { scores: number[]; counts: number[]; grades: Set<string> }
  > = {};

  rows.forEach((row) => {
    if (!row.agency_name || !gradeSet.has(row.grade.padStart(2, "0"))) return;
    if (!schoolYearMatches(row.school_year, schoolYear)) return;

    const score = parseFloat(String(row.avg_scale_score));
    const rawCount = parseFloat(String(row.count_tested ?? ""));
    if (!Number.isFinite(score) || score <= 0) return;

    const count = Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 1;
    const normName = normalizeDistrictName(row.agency_name);

    if (!byDistrict[normName]) {
      byDistrict[normName] = { scores: [], counts: [], grades: new Set() };
    }

    byDistrict[normName].scores.push(score);
    byDistrict[normName].counts.push(count);
    byDistrict[normName].grades.add(row.grade);
  });

  const result: Record<string, { score: number; gradesPresent: string; totalTested: number }> = {};

  Object.entries(byDistrict).forEach(([name, { scores, counts, grades: used }]) => {
    const score = weightedAvg(scores, counts);
    if (!Number.isFinite(score)) return;

    result[name] = {
      score,
      gradesPresent: [...used]
        .sort()
        .map((grade) => parseInt(grade, 10).toString())
        .join(", "),
      totalTested: Math.round(counts.reduce((sum, count) => sum + count, 0)),
    };
  });

  return result;
}

type DistrictFrlEntry = {
  pct: number;
  countFrl: number | null;
};

function buildDistrictFrl(rows: FrlRow[], schoolYear: string) {
  const accum: Record<
    string,
    {
      weighted: { countFrl: number; total: number; yearCount: number };
      pctOnly: number[];
    }
  > = {};

  rows.forEach((row) => {
    if (!row.agency_name || !schoolYearMatches(row.school_year, schoolYear)) return;

    const pct = parseFloat(String(row.pct_frl));
    const count = parseFloat(String(row.count_frl ?? ""));
    if (!Number.isFinite(pct)) return;

    const normName = normalizeDistrictName(row.agency_name);

    if (!accum[normName]) {
      accum[normName] = {
        weighted: { countFrl: 0, total: 0, yearCount: 0 },
        pctOnly: [],
      };
    }

    if (Number.isFinite(count) && count > 0 && pct > 0) {
      accum[normName].weighted.countFrl += count;
      accum[normName].weighted.total += count / pct;
      accum[normName].weighted.yearCount += 1;
    } else {
      accum[normName].pctOnly.push(pct * 100);
    }
  });

  const result: Record<string, DistrictFrlEntry> = {};

  Object.entries(accum).forEach(([name, { weighted, pctOnly }]) => {
    const hasWeighted = weighted.total > 0;
    const hasPctOnly = pctOnly.length > 0;

    if (hasWeighted && !hasPctOnly) {
      result[name] = {
        pct: (weighted.countFrl / weighted.total) * 100,
        countFrl: Math.round(weighted.countFrl),
      };
    } else if (hasWeighted && hasPctOnly) {
      const weightedPct = (weighted.countFrl / weighted.total) * 100;
      const simplePct = pctOnly.reduce((sum, value) => sum + value, 0) / pctOnly.length;
      const totalYears = weighted.yearCount + pctOnly.length;
      result[name] = {
        pct:
          (weightedPct * weighted.yearCount + simplePct * pctOnly.length) /
          totalYears,
        countFrl: Math.round(weighted.countFrl),
      };
    } else if (hasPctOnly) {
      result[name] = {
        pct: pctOnly.reduce((sum, value) => sum + value, 0) / pctOnly.length,
        countFrl: null,
      };
    }
  });

  return result;
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };

  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const sumXY = points.reduce((total, point) => total + point.x * point.y, 0);
  const sumXX = points.reduce((total, point) => total + point.x * point.x, 0);
  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function formatSchoolYearLabel(year: string) {
  return year.replace("-", "–");
}

function formatGradeLabel(grades: string[]) {
  if (grades.length === 0) return "Grade";
  if (grades.length >= 6) return "All Grades";
  if (grades.length === 1) return `Grade ${parseInt(grades[0], 10)}`;
  return grades.map((grade) => `Grade ${parseInt(grade, 10)}`).join(", ");
}

export function buildEquityScatterPanel(
  subject: EvidenceSubject,
  grades: string[],
  schoolYear: string,
  districtScores: Record<string, { score: number; gradesPresent: string; totalTested: number }>,
  districtFrl: Record<string, DistrictFrlEntry>,
  highlightIds: string[],
): EquityScatterPanelData {
  const normalizedHighlights = highlightIds.map(normalizeDistrictName);
  const districtNames = Object.keys(districtScores).sort();
  const totalSelectedGrades = grades.length;

  const merged = districtNames
    .map((name, index) => {
      const frlEntry = districtFrl[name];
      const scoreEntry = districtScores[name];
      if (!frlEntry || Number.isNaN(frlEntry.pct) || !scoreEntry) return null;
      if (scoreEntry.score <= 0) return null;

      const gradesUsed = scoreEntry.gradesPresent
        ? scoreEntry.gradesPresent.split(", ").filter(Boolean).length
        : 0;

      return {
        id: name,
        name: formatSchoolDisplayName(name),
        color: colorForDistrictIndex(index),
        frlPct: Math.round(frlEntry.pct * 10) / 10,
        score: Math.round(scoreEntry.score * 10) / 10,
        gradesPresent: scoreEntry.gradesPresent,
        studentsOnFrl: frlEntry.countFrl,
        studentsTested: scoreEntry.totalTested,
        gradesUsed,
        totalSelectedGrades,
        isPartialGrade: gradesUsed > 0 && gradesUsed < totalSelectedGrades,
      };
    })
    .filter((row) => row !== null);

  const regression = linearRegression(
    merged.map((point) => ({ x: point.frlPct, y: point.score })),
  );

  const allPoints: EquityDistrictPoint[] = merged.map((point, index) => {
    const predicted = regression.slope * point.frlPct + regression.intercept;
    return {
      ...point,
      color: colorForDistrictIndex(index),
      predicted: Math.round(predicted * 10) / 10,
      residual: Math.round((point.score - predicted) * 10) / 10,
    };
  });

  const minFrl = Math.min(...allPoints.map((point) => point.frlPct), 0);
  const maxFrl = Math.max(...allPoints.map((point) => point.frlPct), 100);
  const trendLine = [
    { frlPct: minFrl, score: regression.slope * minFrl + regression.intercept },
    { frlPct: maxFrl, score: regression.slope * maxFrl + regression.intercept },
  ];

  const sortedByResidual = [...allPoints].sort((a, b) => b.residual - a.residual);
  const subjectLabel = subject === "math" ? "Mathematics" : "English Language Arts";
  const availableDistricts: DistrictOption[] = districtNames.map((name, index) => ({
    id: name,
    name: formatSchoolDisplayName(name),
    color: colorForDistrictIndex(index),
  }));

  return {
    panelType: "equity",
    title: `${subjectLabel} — ${formatGradeLabel(grades)} · ${formatSchoolYearLabel(schoolYear)}`,
    subtitle:
      "Each dot represents a district · X-axis: Poverty level (FRL%) · Y-axis: Average test score",
    description:
      "Each point represents a district, showing its FRL% and average scale score. Districts above the line are performing better than expected, while those below the line are underperforming.",
    schoolYear,
    points: allPoints,
    trendLine,
    xLabel: "Free & Reduced Lunch (%)",
    yLabel: "Average Scale Score",
    overperformers: sortedByResidual.filter((point) => point.residual > 0).slice(0, 5),
    underperformers: sortedByResidual
      .filter((point) => point.residual < 0)
      .slice(-5)
      .reverse(),
    highlightedDistricts: normalizedHighlights.map((id, index) => {
      const match = availableDistricts.find((district) => district.id === id);
      return {
        id,
        name: match?.name ?? id,
        color: match?.color ?? colorForDistrictIndex(index),
      };
    }),
    availableDistricts,
  };
}

export async function getEquityScatterPanelData(options: {
  tab: EvidenceTab;
  subject: EvidenceSubject;
  grades: string[];
  schoolYear: string;
  highlightIds: string[];
}): Promise<EquityScatterPanelData> {
  if (options.tab === "district-66") {
    const { getDistrict66EquityPanelData } = await import("./district66");
    return getDistrict66EquityPanelData({
      subject: options.subject,
      grades: options.grades,
      schoolYear: options.schoolYear,
    });
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { fetchAllRows } = await import("@/lib/supabase/fetch-all");
  const supabase = createAdminClient();
  const table = options.subject === "math" ? "math_scores" : "english_scores";
  const grades = normalizeGrades(options.grades);

  const [scoreRows, frlRows] = await Promise.all([
    fetchAllRows<ScoreRow>((from, to) =>
      supabase
        .from(table)
        .select("agency_name, school_year, grade, avg_scale_score, count_tested")
        .eq("level", "DI")
        .eq("subgroup_type", "ALL")
        .in("grade", grades)
        .not("avg_scale_score", "is", null)
        .order("agency_name")
        .range(from, to),
    ),
    fetchAllRows<FrlRow>((from, to) =>
      supabase
        .from("frl_scores")
        .select("agency_name, school_year, pct_frl, count_frl")
        .eq("level", "DI")
        .not("pct_frl", "is", null)
        .order("agency_name")
        .range(from, to),
    ),
  ]);

  const districtScores = buildDistrictScores(scoreRows, grades, options.schoolYear);
  const districtFrl = buildDistrictFrl(frlRows, options.schoolYear);

  return buildEquityScatterPanel(
    options.subject,
    grades,
    options.schoolYear,
    districtScores,
    districtFrl,
    options.highlightIds,
  );
}
