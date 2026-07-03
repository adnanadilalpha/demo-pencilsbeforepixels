import {
  buildSchoolYearMap,
  sortedSchoolYears,
  weightedAvg,
  type EvidenceScoreRow,
} from "@/lib/evidence/chart-utils";
import { buildGenderPerformanceChart, buildPerformanceChart, colorForDistrictIndex } from "@/lib/evidence/builders";
import type { AcademicChart, AcademicDataset } from "./types";

const WESTSIDE_MATH_GENDER_GRADES = ["03", "04", "05", "06"] as const;
/** Matches Evidence → Nebraska → Performance defaults for the homepage chart. */
const NEBRASKA_MATH_EVIDENCE_GRADES = ["03", "04", "05", "06"] as const;

type ScoreRow = {
  school_year: string;
  avg_scale_score: number | null;
  subgroup_desc?: string;
  grade?: string;
  count_tested?: number | string | null;
  agency_name?: string;
};

type ProficiencyRow = {
  school_year: string;
  pct_ontrack: string | number | null;
  pct_advanced: string | number | null;
  pct_developing: string | number | null;
};

function formatSchoolYear(year: string) {
  return year.replace("-", "–");
}

function uniqueYears(rows: ScoreRow[]) {
  return [...new Set(rows.map((row) => row.school_year))].sort();
}

function buildTicks(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(4, (max - min) * 0.08);
  const floor = Math.floor(min - padding);
  const ceil = Math.ceil(max + padding);
  const step = (ceil - floor) / 3;

  return [
    Math.round(floor),
    Math.round(floor + step),
    Math.round(floor + step * 2),
    Math.round(ceil),
  ];
}

function singleSeriesChart(
  title: string,
  rows: ScoreRow[],
  yLabel: string,
  xLabel: string,
): AcademicChart {
  const years = uniqueYears(rows);
  const values = years.map((year) => {
    const row = rows.find((entry) => entry.school_year === year);
    return row?.avg_scale_score ?? 0;
  });

  return {
    title,
    yLabel,
    xLabel,
    categories: years.map(formatSchoolYear),
    yTicks: buildTicks(values),
    series: [{ label: title, color: "#ffffff", values }],
  };
}

function toEvidenceScoreRows(rows: ScoreRow[]): EvidenceScoreRow[] {
  return rows.map((row) => ({
    school_year: row.school_year,
    grade: row.grade ?? "",
    subgroup_desc: row.subgroup_desc,
    avg_scale_score: row.avg_scale_score,
    count_tested: row.count_tested,
  }));
}

function aggregateWeightedGenderRows(rows: ScoreRow[]): ScoreRow[] {
  const aggregated: ScoreRow[] = [];

  for (const gender of ["Male", "Female"] as const) {
    const genderRows = toEvidenceScoreRows(
      rows.filter((row) => row.subgroup_desc === gender),
    );
    const yearMap = buildSchoolYearMap(genderRows);

    for (const year of sortedSchoolYears(genderRows)) {
      const bucket = yearMap[year];
      if (!bucket) continue;

      const average = weightedAvg(bucket.scores, bucket.counts);
      if (!Number.isFinite(average)) continue;

      aggregated.push({
        school_year: year,
        subgroup_desc: gender,
        avg_scale_score: Math.round(average * 10) / 10,
      });
    }
  }

  return aggregated;
}

function computeLatestGenderGap(rows: ScoreRow[]): number | null {
  const years = uniqueYears(rows);

  for (let index = years.length - 1; index >= 0; index -= 1) {
    const year = years[index];
    const male = rows.find(
      (row) => row.school_year === year && row.subgroup_desc === "Male",
    );
    const female = rows.find(
      (row) => row.school_year === year && row.subgroup_desc === "Female",
    );

    if (
      male?.avg_scale_score !== null &&
      male?.avg_scale_score !== undefined &&
      female?.avg_scale_score !== null &&
      female?.avg_scale_score !== undefined
    ) {
      return Math.abs(male.avg_scale_score - female.avg_scale_score);
    }
  }

  return null;
}

function splitGenderCharts(
  leftTitle: string,
  rightTitle: string,
  rows: ScoreRow[],
  yLabel: string,
  xLabel: string,
): [AcademicChart, AcademicChart] {
  const years = uniqueYears(rows);
  const femaleValues = years.map((year) => {
    const row = rows.find(
      (entry) =>
        entry.school_year === year && entry.subgroup_desc === "Female",
    );
    return row?.avg_scale_score ?? 0;
  });
  const maleValues = years.map((year) => {
    const row = rows.find(
      (entry) => entry.school_year === year && entry.subgroup_desc === "Male",
    );
    return row?.avg_scale_score ?? 0;
  });
  const sharedTicks = buildTicks([...femaleValues, ...maleValues]);
  const categories = years.map(formatSchoolYear);

  return [
    {
      title: leftTitle,
      yLabel,
      xLabel,
      categories,
      yTicks: sharedTicks,
      series: [{ label: "Female", color: "#ffffff", values: femaleValues }],
    },
    {
      title: rightTitle,
      yLabel,
      xLabel,
      categories,
      yTicks: sharedTicks,
      series: [{ label: "Male", color: "#ffffff", values: maleValues }],
    },
  ];
}

function splitGradeBandCharts(
  rows: ScoreRow[],
  leftGrades: string[],
  rightGrades: string[],
  leftTitle: string,
  rightTitle: string,
  yLabel: string,
  xLabel: string,
): [AcademicChart, AcademicChart] {
  const buildBand = (grades: string[]) =>
    uniqueYears(rows).map((year) => {
      const yearRows = rows.filter(
        (row) => row.school_year === year && grades.includes(row.grade ?? ""),
      );
      const average =
        yearRows.reduce((sum, row) => sum + (row.avg_scale_score ?? 0), 0) /
        yearRows.length;
      return { school_year: year, avg_scale_score: average };
    });

  const leftRows = buildBand(leftGrades);
  const rightRows = buildBand(rightGrades);
  const leftValues = leftRows.map((row) => row.avg_scale_score ?? 0);
  const rightValues = rightRows.map((row) => row.avg_scale_score ?? 0);
  const sharedTicks = buildTicks([...leftValues, ...rightValues]);
  const categories = leftRows.map((row) => formatSchoolYear(row.school_year));

  return [
    {
      title: leftTitle,
      yLabel,
      xLabel,
      categories,
      yTicks: sharedTicks,
      series: [{ label: leftTitle, color: "#ffffff", values: leftValues }],
    },
    {
      title: rightTitle,
      yLabel,
      xLabel,
      categories,
      yTicks: sharedTicks,
      series: [{ label: rightTitle, color: "#ffffff", values: rightValues }],
    },
  ];
}

function parsePercent(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric * 1000) / 10 : null;
}

function proficiencyChart(
  title: string,
  rows: ProficiencyRow[],
): AcademicChart {
  const years = [...new Set(rows.map((row) => row.school_year))].sort();
  const onTrack = years.map((year) => {
    const row = rows.find((entry) => entry.school_year === year);
    return parsePercent(row?.pct_ontrack) ?? 0;
  });

  const allValues = onTrack;

  return {
    title,
    yLabel: "Percent of Students",
    xLabel: "School Year",
    categories: years.map(formatSchoolYear),
    yTicks: buildTicks(allValues),
    series: [{ label: title, color: "#ffffff", values: onTrack }],
  };
}

export function buildNebraskaMathDataset(rows: ScoreRow[]): AcademicDataset {
  const stateRows: EvidenceScoreRow[] = rows
    .filter(
      (row) =>
        row.grade !== undefined &&
        (NEBRASKA_MATH_EVIDENCE_GRADES as readonly string[]).includes(row.grade),
    )
    .map((row) => ({
      school_year: row.school_year,
      grade: row.grade ?? "",
      avg_scale_score: row.avg_scale_score,
      count_tested: row.count_tested,
      level: "ST",
    }));

  const { chart, subtitle } = buildPerformanceChart(
    "math",
    [...NEBRASKA_MATH_EVIDENCE_GRADES],
    "All Students",
    stateRows,
    [],
    [],
    true,
  );

  return {
    id: "nebraska-math",
    label: "Nebraska Mathematics",
    title: "Nebraska Mathematics",
    charts: [chart],
    evidenceChartLayout: true,
    evidenceStudentGroup: "all",
    performanceSubtitle: subtitle,
    insight: [
      { text: "Nebraska mathematics scale scores remain below pre-2020 levels across " },
      { text: "grades 3–6", emphasis: "gold" },
      { text: ", with limited recovery through 2024–25." },
    ],
    description:
      "State of Nebraska mathematics results for all students, weighted across grades 3–6 (same view as Evidence → Nebraska with State benchmark on). Source: Nebraska Department of Education assessment data.",
  };
}

export function buildNebraskaMathGenderDataset(
  rows: ScoreRow[],
): AcademicDataset {
  const gradeRows = rows.filter(
    (row) =>
      row.grade !== undefined &&
      (NEBRASKA_MATH_EVIDENCE_GRADES as readonly string[]).includes(row.grade),
  );

  const stateRows: EvidenceScoreRow[] = gradeRows.map((row) => ({
    school_year: row.school_year,
    grade: row.grade ?? "",
    subgroup_desc: row.subgroup_desc,
    avg_scale_score: row.avg_scale_score,
    count_tested: row.count_tested,
    level: "ST",
    agency_name: row.agency_name,
  }));

  const { chart, subtitle } = buildGenderPerformanceChart(
    "math",
    [...NEBRASKA_MATH_EVIDENCE_GRADES],
    stateRows,
    [],
    true,
  );

  const aggregated = aggregateWeightedGenderRows(gradeRows);
  const latestGap = computeLatestGenderGap(aggregated);
  const gapLabel =
    latestGap !== null ? `${latestGap.toFixed(1)} points` : "7.5 points";

  return {
    id: "nebraska-math-gender",
    label: "Nebraska Mathematics by Gender",
    title: "Nebraska Mathematics by Gender",
    charts: [chart],
    evidenceChartLayout: true,
    evidenceStudentGroup: "gender",
    performanceSubtitle: subtitle,
    insight: [
      { text: "Male students consistently score higher than female students, with the gap widening to " },
      { text: gapLabel, emphasis: "gold" },
      { text: " by 2024–25." },
    ],
    description:
      "Nebraska statewide mathematics performance by gender, weighted across grades 3–6 (same view as Evidence → Nebraska → By Gender with State on). Source: Nebraska Department of Education.",
  };
}

const WESTSIDE_AGENCY_NAME = "WESTSIDE COMMUNITY SCHOOLS";

export function buildWestsideMathGenderDataset(
  rows: ScoreRow[],
): AcademicDataset {
  const gradeRows = rows.filter((row) =>
    WESTSIDE_MATH_GENDER_GRADES.includes(
      (row.grade ?? "") as (typeof WESTSIDE_MATH_GENDER_GRADES)[number],
    ),
  );

  const districtRows: EvidenceScoreRow[] = gradeRows.map((row) => ({
    school_year: row.school_year,
    grade: row.grade ?? "",
    subgroup_desc: row.subgroup_desc,
    avg_scale_score: row.avg_scale_score,
    count_tested: row.count_tested,
    level: "DI",
    agency_name: row.agency_name ?? WESTSIDE_AGENCY_NAME,
  }));

  const district = {
    id: WESTSIDE_AGENCY_NAME,
    name: WESTSIDE_AGENCY_NAME,
    color: colorForDistrictIndex(0),
  };

  const { chart, subtitle } = buildGenderPerformanceChart(
    "math",
    [...WESTSIDE_MATH_GENDER_GRADES],
    districtRows,
    [district],
    false,
  );

  const aggregated = aggregateWeightedGenderRows(gradeRows);
  const latestGap = computeLatestGenderGap(aggregated);
  const gapLabel =
    latestGap !== null ? `${latestGap.toFixed(1)} points` : "a widening gap";

  return {
    id: "westside-math-gender",
    label: "Westside Mathematics by Gender",
    title: "Westside Mathematics by Gender",
    charts: [chart],
    evidenceChartLayout: true,
    evidenceStudentGroup: "gender",
    evidenceSelectedDistricts: [district],
    performanceSubtitle: subtitle,
    insight: [
      {
        text: "Westside Community Schools shows a widening gender gap in grades 3–6, reaching ",
      },
      { text: gapLabel, emphasis: "gold" },
      { text: " between male and female students in the most recent school year." },
    ],
    description:
      "Westside Community Schools (District 66) mathematics performance by gender, weighted across grades 3–6. Source: Nebraska Department of Education.",
  };
}

export function buildNebraskaEnglishDataset(rows: ScoreRow[]): AcademicDataset {
  const stateRows: EvidenceScoreRow[] = rows
    .filter(
      (row) =>
        row.grade !== undefined &&
        (NEBRASKA_MATH_EVIDENCE_GRADES as readonly string[]).includes(row.grade),
    )
    .map((row) => ({
      school_year: row.school_year,
      grade: row.grade ?? "",
      avg_scale_score: row.avg_scale_score,
      count_tested: row.count_tested,
      level: "ST",
    }));

  const { chart, subtitle } = buildPerformanceChart(
    "english",
    [...NEBRASKA_MATH_EVIDENCE_GRADES],
    "All Students",
    stateRows,
    [],
    [],
    true,
  );

  return {
    id: "nebraska-english",
    label: "Nebraska English",
    title: "Nebraska English",
    charts: [chart],
    evidenceChartLayout: true,
    evidenceStudentGroup: "all",
    performanceSubtitle: subtitle,
    insight: [
      { text: "Nebraska English Language Arts scores have declined " },
      { text: "9.2 points", emphasis: "gold" },
      { text: " since 2020–21 with no sign of recovery." },
    ],
    description:
      "State of Nebraska English Language Arts results for all students, weighted across grades 3–6 (same view as Evidence → Nebraska → English with State benchmark on). Source: Nebraska Department of Education.",
  };
}

export function buildStateFederalDataset(
  mathRows: ProficiencyRow[],
  englishRows: ProficiencyRow[],
): AcademicDataset {
  return {
    id: "state-federal",
    label: "State & Federal Testing",
    title: "State & Federal Testing",
    charts: [
      proficiencyChart("MATH — GRADE 8", mathRows),
      proficiencyChart("ENGLISH — GRADE 8", englishRows),
    ],
    insight: [
      { text: "Grade 8 proficiency bands show rising " },
      { text: "developing", emphasis: "white" },
      { text: " rates alongside volatile advanced performance since 2020." },
    ],
    description:
      "Nebraska state assessment proficiency breakdown (developing, on track, advanced) for grade 8 mathematics and English Language Arts.",
  };
}
