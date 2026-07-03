import type { AcademicChart, ChartSeries } from "@/lib/academic-data/types";

/** CPU-use buckets — matches nebaraska/src/app/charts/page.tsx ticktext. */
export const PISA_CPU_CATEGORIES = [
  "0",
  "1–60",
  "61–120",
  "121–240",
  "241–360",
  ">360",
] as const;

/** Plotly y values from nebaraska charts page (2012 / 2015 / 2018). */
export const PISA_SERIES_VALUES = {
  math: {
    "2012": [508, 495, 465, 462, 450, 430],
    "2015": [483, 492, 461, 458, 450, 425],
    "2018": [470, 492, 456, 454, 450, 420],
  },
  reading: {
    "2012": [508, 495, 465, 462, 450, 430],
    "2015": [483, 492, 461, 458, 448, 420],
    "2018": [470, 480, 456, 454, 445, 417],
  },
} as const;

export const PISA_YEARS = ["2012", "2015", "2018"] as const;

export const PISA_CPU_MINUTES = [0, 30, 90, 180, 300, 390] as const;

export const PISA_MATH_Y_TICKS = [400, 440, 480, 520];
export const PISA_READING_Y_TICKS = [400, 443, 487, 530];
export const PISA_MATH_Y_DOMAIN = { yMin: 400, yMax: 520 } as const;
export const PISA_READING_Y_DOMAIN = { yMin: 400, yMax: 530 } as const;

export const PISA_CHART_LABELS = {
  title: "PISA: All Countries — In-School Computer Use vs. Score",
  description:
    "PISA longitudinal data (2012–2018) reveals that students exceeding six hours of daily in-school computer use score an average of 66 points lower than non-users, a decline equivalent to two full letter grades.",
  callout:
    "Students using screens >6 hours/day scored an average of 66 points lower than non-users — equivalent to a two letter-grade drop (50th → 24th percentile).",
} as const;

type PisaYearStyle = {
  color: string;
  dashArray?: string;
};

const PISA_RESEARCH_STYLES: Record<(typeof PISA_YEARS)[number], PisaYearStyle> =
  {
    "2012": { color: "#1a3353" },
    "2015": { color: "#4a6fa5", dashArray: "4 4" },
    "2018": { color: "#8aafd4", dashArray: "8 4" },
  };

const PISA_ACADEMIC_STYLES: Record<(typeof PISA_YEARS)[number], PisaYearStyle> =
  {
    "2012": { color: "#FFFFFF" },
    "2015": { color: "#7FA3CC", dashArray: "4 4" },
    "2018": { color: "#8AAFD4", dashArray: "8 4" },
  };

function buildPisaSeries(
  subject: keyof typeof PISA_SERIES_VALUES,
  styles: Record<(typeof PISA_YEARS)[number], PisaYearStyle>,
): ChartSeries[] {
  return PISA_YEARS.map((year) => ({
    label: year,
    color: styles[year].color,
    values: [...PISA_SERIES_VALUES[subject][year]],
    dashArray: styles[year].dashArray,
  }));
}

export function buildPisaResearchCharts(): {
  math: AcademicChart;
  reading: AcademicChart;
} {
  return {
    math: {
      title: "MATH",
      yLabel: "Total Score",
      xLabel: "In-School CPU Use (min/day)",
      categories: [...PISA_CPU_CATEGORIES],
      yTicks: PISA_MATH_Y_TICKS,
      ...PISA_MATH_Y_DOMAIN,
      series: buildPisaSeries("math", PISA_RESEARCH_STYLES),
    },
    reading: {
      title: "READING",
      yLabel: "Total Score",
      xLabel: "In-School CPU Use (min/day)",
      categories: [...PISA_CPU_CATEGORIES],
      yTicks: PISA_READING_Y_TICKS,
      ...PISA_READING_Y_DOMAIN,
      series: buildPisaSeries("reading", PISA_RESEARCH_STYLES),
    },
  };
}

export function buildPisaAcademicCharts(): AcademicChart[] {
  const { math, reading } = buildPisaResearchCharts();
  return [
    {
      ...math,
      series: buildPisaSeries("math", PISA_ACADEMIC_STYLES),
    },
    {
      ...reading,
      series: buildPisaSeries("reading", PISA_ACADEMIC_STYLES),
    },
  ];
}

export const PISA_RESEARCH_LEGEND_ITEMS = PISA_YEARS.map((year) => ({
  year,
  ...PISA_RESEARCH_STYLES[year],
}));

export const PISA_YEAR_LEGEND_ITEMS = PISA_YEARS.map((year) => ({
  year,
  ...PISA_ACADEMIC_STYLES[year],
}));
