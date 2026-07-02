import type { AcademicChart } from "@/lib/academic-data/types";
import type {
  NaepYearZeroChart,
  ResearchChartsData,
} from "@/lib/research/types";

const PISA_CATEGORIES = ["0", "1–60", "61–120", "121–240", "241–360", ">360"];

const RELATIVE_YEARS = [
  -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10,
];

function buildNaepSeries(
  baseAtZero: number,
  preSlope: number,
  postSlope: number,
): number[] {
  return RELATIVE_YEARS.map((year) => {
    const value =
      year <= 0 ? baseAtZero + preSlope * year : baseAtZero + postSlope * year;
    return Math.round(value * 10) / 10;
  });
}

function buildNaepChart(
  title: string,
  baseAtZero: number,
  preSlope: number,
  postSlope: number,
  preLabel: string,
  postLabel: string,
  yTicks: number[],
): NaepYearZeroChart {
  return {
    title,
    years: RELATIVE_YEARS,
    scores: buildNaepSeries(baseAtZero, preSlope, postSlope),
    yearZero: 0,
    preSlope,
    postSlope,
    yTicks,
    slopes: {
      pre: {
        label: preLabel,
        value: `${preSlope >= 0 ? "+" : ""}${preSlope.toFixed(2)} pts/yr`,
      },
      post: {
        label: postLabel,
        value: `${postSlope >= 0 ? "+" : ""}${postSlope.toFixed(2)} pts/yr`,
      },
    },
  };
}

function pisaChart(
  title: string,
  series: AcademicChart["series"],
): AcademicChart {
  return {
    title,
    yLabel: "Total Score",
    xLabel: "In-School CPU Use (min/day)",
    categories: PISA_CATEGORIES,
    yTicks: [400, 435, 470, 505],
    series,
  };
}

export const researchChartsData: ResearchChartsData = {
  nationalSlopes: [
    { label: "Grade 4 Math", slope: "−1.45 pts/yr" },
    { label: "Grade 4 Reading", slope: "−1.07 pts/yr" },
    { label: "Grade 8 Math", slope: "−1.81 pts/yr" },
    { label: "Grade 8 Reading", slope: "−1.16 pts/yr" },
  ],
  grade4: {
    heading: "Grade 4 — Math & Reading (2022 excluded)",
    math: buildNaepChart(
      "Grade 4 Math (2022 Excluded)",
      242,
      1.07,
      -0.38,
      "Math — Pre-adoption",
      "Math — Post-adoption",
      [215, 225, 235, 245],
    ),
    reading: buildNaepChart(
      "Grade 4 Reading (2022 Excluded)",
      222,
      0.27,
      -0.8,
      "Reading — Pre-adoption",
      "Reading — Post-adoption",
      [210, 215, 220, 225],
    ),
  },
  grade8: {
    heading: "Grade 8 — Math & Reading (2022 excluded)",
    math: buildNaepChart(
      "Grade 8 Math (2022 Excluded)",
      286,
      0.67,
      -1.14,
      "Math — Pre-adoption",
      "Math — Post-adoption",
      [265, 275, 285, 295],
    ),
    reading: buildNaepChart(
      "Grade 8 Reading (2022 Excluded)",
      268,
      0.17,
      -0.99,
      "Reading — Pre-adoption",
      "Reading — Post-adoption",
      [255, 262, 269, 276],
    ),
  },
  pisa: {
    title: "PISA: All Countries — In-School Computer Use vs. Score",
    description:
      "PISA longitudinal data (2012–2018) reveals that students exceeding six hours of daily in-school computer use score an average of 66 points lower than non-users, a decline equivalent to two full letter grades.",
    callout:
      "Students using screens >6 hours/day scored an average of 66 points lower than non-users — equivalent to a two letter-grade drop (50th → 24th percentile).",
    math: pisaChart("MATH", [
      {
        label: "2012",
        color: "#0f1f3d",
        values: [512, 502, 466, 456, 449, 431],
      },
      {
        label: "2015",
        color: "#3a5a9b",
        values: [483, 492, 461, 458, 450, 425],
        dashArray: "4 4",
      },
      {
        label: "2018",
        color: "#8aafd4",
        values: [470, 492, 456, 454, 450, 420],
        dashArray: "8 4",
      },
    ]),
    reading: pisaChart("READING", [
      {
        label: "2012",
        color: "#0f1f3d",
        values: [517, 495, 463, 458, 458, 427],
      },
      {
        label: "2015",
        color: "#3a5a9b",
        values: [483, 492, 461, 458, 448, 420],
        dashArray: "4 4",
      },
      {
        label: "2018",
        color: "#8aafd4",
        values: [470, 480, 456, 454, 445, 417],
        dashArray: "8 4",
      },
    ]),
  },
  oecd: {
    title: "OECD Countries — EdTech Access vs. Math Performance Change",
    subtitle:
      "Countries that invested more in classroom computers showed greater declines in PISA Math scores (2003 vs. 2012). Adjusted association: −0.57.",
    xLabel: "← Fewer Computers                More Computers →",
    yLabel: "Difference in Math Performance (PISA 2012 vs 2003)",
    points: [
      { country: "Turkey", x: 1.3, y: 24 },
      { country: "Mexico", x: 4.8, y: 28 },
      { country: "Greece", x: 5.3, y: 8 },
      { country: "Italy", x: 6.8, y: 19 },
      { country: "Korea", x: 6.0, y: 11 },
      { country: "Luxembourg", x: 6.3, y: -8 },
      { country: "Germany", x: 6.2, y: 10 },
      { country: "Japan", x: 6.5, y: 2 },
      { country: "Switzerland", x: 6.4, y: 4 },
      { country: "Austria", x: 7.3, y: 0 },
      { country: "Netherlands", x: 6.8, y: -15 },
      { country: "Canada", x: 7.1, y: -16 },
      { country: "Belgium", x: 6.9, y: -15 },
      { country: "Ireland", x: 7.7, y: -2 },
      { country: "Spain", x: 8.3, y: -1 },
      { country: "Norway", x: 8.5, y: -6 },
      { country: "United States", x: 7.8, y: -2 },
      { country: "Denmark", x: 7.5, y: -15 },
      { country: "France", x: 7.2, y: -16 },
      { country: "Iceland", x: 6.3, y: -22 },
      { country: "Hungary", x: 9.0, y: -12 },
      { country: "Portugal", x: 7.3, y: 21 },
      { country: "Poland", x: 7.5, y: 28 },
      { country: "Finland", x: 6.9, y: -26 },
      { country: "Sweden", x: 6.5, y: -31 },
      { country: "Slovak Republic", x: 8.8, y: -18 },
      { country: "Czech Republic", x: 8.8, y: -19 },
      { country: "Australia", x: 9.7, y: -20 },
      { country: "New Zealand", x: 9.8, y: -24 },
    ],
    trendLine: [
      { x: 0, y: 36 },
      { x: 11.5, y: -30 },
    ],
  },
  timss: {
    title: "TIMSS: All Countries — In-School Computer Use vs. Math Score",
    description:
      "Students using computers in class scored ~41 points lower in math than those who rarely used them — a drop from the 50th to the 32nd percentile.",
    grade4: {
      title: "4th Grade Math",
      xLabel: "In-School CPU Use",
      yLabel: "Total Score",
      categories: [
        "Almost Never",
        "1–2x per Month",
        "1–2x per Week",
        "Almost Daily",
      ],
      values: [550, 535, 508, 499],
      yTicks: [480, 510, 540, 560],
      colors: ["#0f1f3d", "#2d5282", "#4a6fa5", "#7fa3cc"],
    },
    grade8: {
      title: "8th Grade Math",
      xLabel: "In-School CPU Use",
      yLabel: "Total Score",
      categories: [
        "Almost Never",
        "1–2x per Month",
        "1–2x per Week",
        "Almost Daily",
      ],
      values: [528, 518, 497, 484],
      yTicks: [460, 490, 520, 540],
      colors: ["#0f1f3d", "#2d5282", "#4a6fa5", "#7fa3cc"],
    },
  },
  pirls: {
    title: "PIRLS: In-School Computer Use vs. Reading Score",
    description:
      "PIRLS assesses 4th grade reading across dozens of countries every 5 years. Pattern mirrors PISA and TIMSS findings.",
    xLabel: "Total Score",
    yLabel: "In-School CPU Use",
    categories: [
      "Almost Never",
      "1–2x per Month",
      "1–2x per Week",
      "Almost Daily",
    ],
    values: [532, 537, 520, 484],
    yTicks: [480, 510, 540, 560],
    colors: ["#0f1f3d", "#2d5282", "#4a6fa5", "#7fa3cc"],
  },
  mentalHealth: {
    title: "Adolescent Mental Health Indicators, 2001–2018",
    description:
      "Four independent measures of adolescent mental health tracked from 2001 to 2018. All four indicators held below the historical average for over a decade, then turned sharply upward around 2012.",
    callout:
      "All four indicators move from below the historical average pre-2012 to well above it by 2017–2018 — a synchronized shift across independent data sources rarely seen outside of major societal change.",
    series: [
      {
        label: "Suicide",
        color: "#ef4444",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        values: [-0.72, -0.85, -1.0, -0.13, -0.75, -0.78, -1.15, -0.75, -0.2, -0.27, -0.22, -0.35, 0.97, 1.15, 1.25, 1.75, 1.65],
      },
      {
        label: "Self-poisoning",
        color: "#10b981",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        values: [-0.53, -0.5, -0.47, -0.4, -0.55, -0.78, -0.85, -0.78, -0.8, -0.88, -0.72, -0.3, 0.25, 1.05, 1.4, 1.42, 1.75, 1.7],
      },
      {
        label: "Major Depressive Episode",
        color: "#0f1f3d",
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        values: [-0.5, -0.92, -0.85, -0.62, -1.02, -0.4, -1.07, -0.35, 0.72, 0.65, 1.62, 1.12, 1.62],
      },
      {
        label: "Depressive Symptoms",
        color: "#3b82f6",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        values: [-0.97, -0.82, -0.35, -0.25, -0.5, -0.65, -1.25, -0.75, -0.35, -0.53, -0.6, -0.45, 0.25, 1.25, 1.35, 0.93, 1.85, 1.95],
      },
    ],
  },
};
