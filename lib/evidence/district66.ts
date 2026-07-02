import "server-only";

import {
  buildGenderPerformanceChart,
  buildPerformanceChart,
  colorForDistrictIndex,
} from "./builders";
import { DISTRICT_66_AVG_LABEL } from "./district66-constants";
import { getYear, weightedAvg, type EvidenceScoreRow } from "./chart-utils";
import { normalizeSchoolName } from "./school-names";
import type {
  DistrictOption,
  EquityScatterPanelData,
  EvidenceSubject,
  PerformancePanelData,
} from "./types";

const WESTSIDE_AGENCY_NAME = "WESTSIDE COMMUNITY SCHOOLS";
const WESTSIDE_DISTRICT_ID = "66";
const DISTRICT_66_AVG_COLOR = "#1e40af";

type FrlRow = {
  agency_name: string;
  school_year: string;
  pct_frl: number | string | null;
  count_frl?: number | string | null;
};

type SchoolScoreRow = {
  agency_name: string;
  school_year: string;
  grade: string;
  avg_scale_score: number | string | null;
  count_tested?: number | string | null;
};

function subjectTable(subject: EvidenceSubject) {
  return subject === "math" ? "math_scores" : "english_scores";
}

function normalizeGrades(grades: string[]) {
  const normalized = grades
    .map((grade) => grade.padStart(2, "0"))
    .filter(Boolean);
  return normalized.length > 0 ? normalized : ["03"];
}

function schoolYearMatches(rowYear: string, selectedYear: string) {
  return getYear(rowYear) === getYear(selectedYear);
}

function mapSchoolOptions(names: string[]): DistrictOption[] {
  const seen = new Map<string, string>();

  names.forEach((name) => {
    const normalized = normalizeSchoolName(name);
    if (normalized && !seen.has(normalized)) {
      seen.set(normalized, normalized);
    }
  });

  return [...seen.keys()].sort().map((name, index) => ({
    id: name,
    name,
    color: colorForDistrictIndex(index),
  }));
}

function remapDistrictAverageRows(rows: EvidenceScoreRow[]) {
  return rows.map((row) => ({
    ...row,
    agency_name: DISTRICT_66_AVG_LABEL,
  }));
}

function remapSchoolRows(rows: EvidenceScoreRow[]) {
  return rows.map((row) => ({
    ...row,
    agency_name: normalizeSchoolName(row.agency_name ?? ""),
  }));
}

function filterSchoolRows(rows: EvidenceScoreRow[], schoolIds: string[]) {
  if (schoolIds.length === 0) return [];

  const selected = new Set(schoolIds.map(normalizeSchoolName));
  return remapSchoolRows(
    rows.filter((row) =>
      selected.has(normalizeSchoolName(row.agency_name ?? "")),
    ),
  );
}

async function fetchDistrict66ScoreRows(options: {
  subject: EvidenceSubject;
  grades: string[];
  subgroupType: "ALL" | "GENDER";
}) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const table = subjectTable(options.subject);
  const grades = normalizeGrades(options.grades);
  const select =
    "school_year, district_id, agency_name, avg_scale_score, count_tested, subgroup_desc, grade, level";

  const [stateResult, districtResult, schoolResult] = await Promise.all([
    supabase
      .from(table)
      .select(select)
      .eq("level", "ST")
      .eq("subgroup_type", options.subgroupType)
      .in("grade", grades)
      .order("school_year"),
    supabase
      .from(table)
      .select(select)
      .eq("level", "DI")
      .eq("subgroup_type", options.subgroupType)
      .eq("agency_name", WESTSIDE_AGENCY_NAME)
      .in("grade", grades)
      .order("school_year"),
    supabase
      .from(table)
      .select(select)
      .eq("level", "SC")
      .eq("subgroup_type", options.subgroupType)
      .eq("district_id", WESTSIDE_DISTRICT_ID)
      .in("grade", grades)
      .order("school_year"),
  ]);

  return {
    stateRows: (stateResult.data as EvidenceScoreRow[]) ?? [],
    districtRows: (districtResult.data as EvidenceScoreRow[]) ?? [],
    schoolRows: (schoolResult.data as EvidenceScoreRow[]) ?? [],
  };
}

function buildDistrict66ChartInputs(options: {
  stateRows: EvidenceScoreRow[];
  districtRows: EvidenceScoreRow[];
  schoolRows: EvidenceScoreRow[];
  schoolIds: string[];
  includeState: boolean;
  includeDistrictAvg: boolean;
}) {
  const schools = filterSchoolRows(options.schoolRows, options.schoolIds);
  const schoolEntities = options.schoolIds.map((id, index) => ({
    id: normalizeSchoolName(id),
    name: normalizeSchoolName(id),
    color: colorForDistrictIndex(index),
  }));

  const entities: DistrictOption[] = [...schoolEntities];
  const chartRows: EvidenceScoreRow[] = [...schools];

  if (options.includeDistrictAvg && options.districtRows.length > 0) {
    entities.push({
      id: DISTRICT_66_AVG_LABEL,
      name: DISTRICT_66_AVG_LABEL,
      color: DISTRICT_66_AVG_COLOR,
    });
    chartRows.push(...remapDistrictAverageRows(options.districtRows));
  }

  return {
    stateRows: options.includeState ? options.stateRows : [],
    chartRows,
    entities,
  };
}

function fuzzyMatchSchoolFrl(
  scoreName: string,
  frlMap: Record<string, number>,
) {
  if (frlMap[scoreName] != null) return frlMap[scoreName];

  const frlNames = Object.keys(frlMap);
  const scoreWords = scoreName.toLowerCase().split(" ").filter(Boolean);
  const fuzzyMatch = frlNames.find((frlName) => {
    const frlWords = frlName.toLowerCase().split(" ").filter(Boolean);
    return (
      (scoreWords[0] && frlWords[0] && scoreWords[0] === frlWords[0]) ||
      frlName.toLowerCase().includes(scoreName.toLowerCase()) ||
      scoreName.toLowerCase().includes(frlName.toLowerCase()) ||
      scoreWords.some(
        (word) => word.length >= 3 && frlWords.some((entry) => entry === word),
      )
    );
  });

  return fuzzyMatch != null ? frlMap[fuzzyMatch] : undefined;
}

function buildDistrict66SchoolFrl(rows: FrlRow[], schoolYear: string) {
  const accum: Record<
    string,
    {
      weighted: { countFrl: number; total: number; yearCount: number };
      pctOnly: number[];
    }
  > = {};
  const seen = new Set<string>();

  rows.forEach((row) => {
    if (!row.agency_name || !schoolYearMatches(row.school_year, schoolYear)) {
      return;
    }

    const normalized = normalizeSchoolName(row.agency_name);
    const pct = parseFloat(String(row.pct_frl));
    const count = parseFloat(String(row.count_frl ?? ""));
    if (!Number.isFinite(pct)) return;

    const key = `${normalized}__${row.school_year}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (!accum[normalized]) {
      accum[normalized] = {
        weighted: { countFrl: 0, total: 0, yearCount: 0 },
        pctOnly: [],
      };
    }

    if (Number.isFinite(count) && count > 0) {
      accum[normalized].weighted.countFrl += count;
      accum[normalized].weighted.total += count / pct;
      accum[normalized].weighted.yearCount += 1;
    } else {
      accum[normalized].pctOnly.push(pct * 100);
    }
  });

  const rawMap: Record<string, number> = {};

  Object.entries(accum).forEach(([name, { weighted, pctOnly }]) => {
    const hasWeighted = weighted.total > 0;
    const hasPctOnly = pctOnly.length > 0;

    if (hasWeighted && !hasPctOnly) {
      rawMap[name] = (weighted.countFrl / weighted.total) * 100;
    } else if (hasWeighted && hasPctOnly) {
      const weightedPct = (weighted.countFrl / weighted.total) * 100;
      const simplePct =
        pctOnly.reduce((sum, value) => sum + value, 0) / pctOnly.length;
      const totalYears = weighted.yearCount + pctOnly.length;
      rawMap[name] =
        (weightedPct * weighted.yearCount + simplePct * pctOnly.length) /
        totalYears;
    } else if (hasPctOnly) {
      rawMap[name] =
        pctOnly.reduce((sum, value) => sum + value, 0) / pctOnly.length;
    }
  });

  return rawMap;
}

function buildDistrict66SchoolScores(
  rows: SchoolScoreRow[],
  grades: string[],
  schoolYear: string,
) {
  const gradeSet = new Set(grades);
  const bySchool: Record<string, { scores: number[]; counts: number[] }> = {};

  rows.forEach((row) => {
    if (!row.agency_name || !gradeSet.has(row.grade.padStart(2, "0"))) return;
    if (!schoolYearMatches(row.school_year, schoolYear)) return;

    const score = parseFloat(String(row.avg_scale_score));
    const rawCount = parseFloat(String(row.count_tested ?? ""));
    if (!Number.isFinite(score) || score <= 0) return;

    const count = Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 1;
    const name = normalizeSchoolName(row.agency_name);

    if (!bySchool[name]) {
      bySchool[name] = { scores: [], counts: [] };
    }

    bySchool[name].scores.push(score);
    bySchool[name].counts.push(count);
  });

  const result: Record<string, number> = {};
  Object.entries(bySchool).forEach(([name, { scores, counts }]) => {
    const score = weightedAvg(scores, counts);
    if (Number.isFinite(score)) {
      result[name] = score;
    }
  });

  return result;
}

export async function getDistrict66SchoolOptions(
  subject: EvidenceSubject,
): Promise<DistrictOption[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from(subjectTable(subject))
    .select("agency_name")
    .eq("level", "SC")
    .eq("district_id", WESTSIDE_DISTRICT_ID)
    .eq("subgroup_type", "ALL")
    .not("agency_name", "is", null)
    .order("agency_name");

  const names = ((data as { agency_name: string }[]) ?? []).map(
    (row) => row.agency_name,
  );

  return mapSchoolOptions(names);
}

export async function getDistrict66SchoolYears(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("frl_scores")
    .select("school_year")
    .eq("level", "SC")
    .eq("district_id", WESTSIDE_DISTRICT_ID)
    .order("school_year");

  return [
    ...new Set(
      ((data as { school_year: string }[]) ?? []).map((row) => row.school_year),
    ),
  ];
}

export async function getDistrict66PerformancePanelData(options: {
  subject: EvidenceSubject;
  grades: string[];
  schoolIds: string[];
  includeState: boolean;
  includeDistrictAvg: boolean;
}): Promise<PerformancePanelData> {
  const { stateRows, districtRows, schoolRows } = await fetchDistrict66ScoreRows({
    subject: options.subject,
    grades: options.grades,
    subgroupType: "ALL",
  });

  const { stateRows: visibleStateRows, chartRows, entities } =
    buildDistrict66ChartInputs({
      stateRows,
      districtRows,
      schoolRows,
      schoolIds: options.schoolIds,
      includeState: options.includeState,
      includeDistrictAvg: options.includeDistrictAvg,
    });

  const { chart } = buildPerformanceChart(
    options.subject,
    normalizeGrades(options.grades),
    "All Students",
    visibleStateRows,
    chartRows,
    entities,
    options.includeState,
  );

  return {
    panelType: "line",
    title: "District 66",
    subtitle: "District 66 · All Students",
    chart,
    selectedDistricts: entities.filter(
      (entity) => entity.id !== DISTRICT_66_AVG_LABEL,
    ),
  };
}

export async function getDistrict66GenderPanelData(options: {
  subject: EvidenceSubject;
  grades: string[];
  schoolIds: string[];
  includeState: boolean;
  includeDistrictAvg: boolean;
}): Promise<PerformancePanelData> {
  const { stateRows, districtRows, schoolRows } = await fetchDistrict66ScoreRows({
    subject: options.subject,
    grades: options.grades,
    subgroupType: "GENDER",
  });

  const { stateRows: visibleStateRows, chartRows, entities } =
    buildDistrict66ChartInputs({
      stateRows,
      districtRows,
      schoolRows,
      schoolIds: options.schoolIds,
      includeState: options.includeState,
      includeDistrictAvg: options.includeDistrictAvg,
    });

  const { chart, subtitle } = buildGenderPerformanceChart(
    options.subject,
    normalizeGrades(options.grades),
    [...visibleStateRows, ...chartRows],
    entities,
    options.includeState,
  );

  return {
    panelType: "line",
    title: "District 66",
    subtitle,
    chart,
    selectedDistricts: entities.filter(
      (entity) => entity.id !== DISTRICT_66_AVG_LABEL,
    ),
  };
}

export async function getDistrict66EquityPanelData(options: {
  subject: EvidenceSubject;
  grades: string[];
  schoolYear: string;
}): Promise<EquityScatterPanelData> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const table = subjectTable(options.subject);
  const grades = normalizeGrades(options.grades);

  const [{ data: scoreRows }, { data: frlRows }] = await Promise.all([
    supabase
      .from(table)
      .select("agency_name, school_year, grade, avg_scale_score, count_tested")
      .eq("level", "SC")
      .eq("subgroup_type", "ALL")
      .eq("district_id", WESTSIDE_DISTRICT_ID)
      .in("grade", grades)
      .not("avg_scale_score", "is", null),
    supabase
      .from("frl_scores")
      .select("agency_name, school_year, pct_frl, count_frl")
      .eq("level", "SC")
      .eq("district_id", WESTSIDE_DISTRICT_ID)
      .not("pct_frl", "is", null),
  ]);

  const schoolScores = buildDistrict66SchoolScores(
    (scoreRows as SchoolScoreRow[]) ?? [],
    grades,
    options.schoolYear,
  );
  const schoolFrl = buildDistrict66SchoolFrl(
    (frlRows as FrlRow[]) ?? [],
    options.schoolYear,
  );

  const districtScores = Object.fromEntries(
    Object.keys(schoolScores)
      .sort()
      .map((name) => {
        const frlPct = fuzzyMatchSchoolFrl(name, schoolFrl);
        const score = schoolScores[name];
        if (frlPct == null || Number.isNaN(frlPct) || score <= 0) return null;
        return [name, { score, gradesPresent: "" }];
      })
      .filter((entry): entry is [string, { score: number; gradesPresent: string }] =>
        entry !== null,
      ),
  );

  const districtFrl = Object.fromEntries(
    Object.keys(districtScores).map((name) => [
      name,
      fuzzyMatchSchoolFrl(name, schoolFrl) as number,
    ]),
  );

  const { buildEquityScatterPanel } = await import("./equity-scatter");
  const panel = buildEquityScatterPanel(
    options.subject,
    grades,
    options.schoolYear,
    districtScores,
    districtFrl,
    [],
  );

  const subjectLabel =
    options.subject === "math" ? "Mathematics" : "English Language Arts";
  const gradeLabel =
    grades.length >= 6
      ? "All Grades"
      : grades.length === 1
        ? `Grade ${parseInt(grades[0], 10)}`
        : grades.map((grade) => `Grade ${parseInt(grade, 10)}`).join(", ");

  return {
    ...panel,
    title: `${subjectLabel} — ${gradeLabel} · ${options.schoolYear.replace("-", "–")}`,
    subtitle:
      "Each point is one school · X-axis: Poverty level (FRL%) · Y-axis: Average test score",
    description:
      "Each school is plotted by its poverty rate vs. average score. Schools above the line are outperforming expectations; those below warrant attention.",
    availableDistricts: Object.keys(districtScores).map((name, index) => ({
      id: name,
      name,
      color: colorForDistrictIndex(index),
    })),
    highlightedDistricts: [],
  };
}
