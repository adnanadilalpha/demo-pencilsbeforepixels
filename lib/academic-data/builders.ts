import type { AcademicChart, AcademicDataset } from "./types";

type ScoreRow = {
  school_year: string;
  avg_scale_score: number | null;
  subgroup_desc?: string;
  grade?: string;
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
    series: [{ label: "On Track", color: "#ffffff", values: onTrack }],
  };
}

export function buildNebraskaMathDataset(rows: ScoreRow[]): AcademicDataset {
  const gradeRows = rows.filter((row) =>
    ["03", "04", "05", "06", "07", "08"].includes(row.grade ?? ""),
  );

  const [leftChart, rightChart] = splitGradeBandCharts(
    gradeRows,
    ["03", "04", "05"],
    ["06", "07", "08"],
    "GRADES 3–5",
    "GRADES 6–8",
    "Avg Scale Score",
    "School Year",
  );

  return {
    id: "nebraska-math",
    label: "Nebraska Mathematics",
    title: "Nebraska Mathematics",
    charts: [leftChart, rightChart],
    insight: [
      { text: "Nebraska mathematics scale scores remain below pre-2020 levels across " },
      { text: "grades 3–8", emphasis: "gold" },
      { text: ", with limited recovery through 2024–25." },
    ],
    description:
      "State of Nebraska mathematics results for all students, weighted across grades 3–8. Source: Nebraska Department of Education assessment data.",
  };
}

export function buildNebraskaMathGenderDataset(
  rows: ScoreRow[],
): AcademicDataset {
  const [femaleChart, maleChart] = splitGenderCharts(
    "FEMALE",
    "MALE",
    rows,
    "Avg Scale Score",
    "School Year",
  );

  return {
    id: "nebraska-math-gender",
    label: "Nebraska Mathematics by Gender",
    title: "Nebraska Mathematics by Gender",
    charts: [femaleChart, maleChart],
    insight: [
      { text: "Male students consistently score higher than female students, with the gap widening to " },
      { text: "7.5 points", emphasis: "gold" },
      { text: " by 2024–25." },
    ],
    description:
      "Nebraska statewide mathematics performance split by gender. All grades combined, all students.",
  };
}

export function buildWestsideMathGenderDataset(
  rows: ScoreRow[],
): AcademicDataset {
  const [femaleChart, maleChart] = splitGenderCharts(
    "FEMALE",
    "MALE",
    rows,
    "Avg Scale Score",
    "School Year",
  );

  return {
    id: "westside-math-gender",
    label: "Westside Mathematics by Gender",
    title: "Westside Mathematics by Gender",
    charts: [femaleChart, maleChart],
    insight: [
      { text: "Westside Community Schools shows a similar gender gap, reaching " },
      { text: "9.2 points", emphasis: "gold" },
      { text: " in 2024–25 while overall scores remain above state averages." },
    ],
    description:
      "Westside Community Schools district mathematics performance by gender. All grades combined.",
  };
}

export function buildNebraskaEnglishDataset(rows: ScoreRow[]): AcademicDataset {
  const gradeRows = rows.filter((row) =>
    ["03", "04", "05", "06", "07", "08"].includes(row.grade ?? ""),
  );

  const [leftChart, rightChart] =
    gradeRows.length > 0
      ? splitGradeBandCharts(
          gradeRows,
          ["03", "04", "05"],
          ["06", "07", "08"],
          "GRADES 3–5",
          "GRADES 6–8",
          "Avg Scale Score",
          "School Year",
        )
      : ([
          singleSeriesChart(
            "GRADES 3–5",
            rows,
            "Avg Scale Score",
            "School Year",
          ),
          singleSeriesChart(
            "GRADES 6–8",
            rows,
            "Avg Scale Score",
            "School Year",
          ),
        ] as [AcademicChart, AcademicChart]);

  return {
    id: "nebraska-english",
    label: "Nebraska English",
    title: "Nebraska English",
    charts: [leftChart, rightChart],
    insight: [
      { text: "Nebraska English Language Arts scores have declined " },
      { text: "9.2 points", emphasis: "gold" },
      { text: " since 2020–21 with no sign of recovery." },
    ],
    description:
      "State of Nebraska English Language Arts results for all students across all grades.",
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
