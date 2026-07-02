import type { AcademicChart, AcademicDataset } from "./types";

const PISA_CPU_CATEGORIES = [
  "0",
  "1–60",
  "61–120",
  "121–240",
  "241–360",
  ">360",
];

const PISA_Y_TICKS = [400, 435, 470, 530];

function naepYear0Chart(
  title: string,
  startScore: number,
  slopePerYear: number,
): AcademicChart {
  const categories = ["−4", "−2", "0", "+2", "+4", "+6", "+8"];
  const values = categories.map((_, index) => {
    const year = -4 + index * 2;
    return Math.round((startScore + slopePerYear * year) * 10) / 10;
  });

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = 8;
  const yTicks = [
    Math.round(min - padding),
    Math.round(min + (max - min) * 0.33),
    Math.round(min + (max - min) * 0.66),
    Math.round(max + padding),
  ];

  return {
    title,
    yLabel: "NAEP Scale Score",
    xLabel: "Years from Year 0 (digital saturation)",
    categories,
    yTicks,
    series: [{ label: title, color: "#ffffff", values }],
  };
}

export const staticAcademicDatasets: AcademicDataset[] = [
  {
    id: "pisa",
    label: "Worldwide Data (PISA)",
    title: "Worldwide Data (PISA)",
    charts: [
      {
        title: "MATH",
        yLabel: "Total Score",
        xLabel: "In-School CPU Use (min/day)",
        categories: PISA_CPU_CATEGORIES,
        yTicks: PISA_Y_TICKS,
        series: [
          {
            label: "Math",
            color: "#ffffff",
            values: [512, 502, 466, 456, 449, 431],
          },
        ],
      },
      {
        title: "READING",
        yLabel: "Total Score",
        xLabel: "In-School CPU Use (min/day)",
        categories: PISA_CPU_CATEGORIES,
        yTicks: PISA_Y_TICKS,
        series: [
          {
            label: "Reading",
            color: "#ffffff",
            values: [517, 495, 463, 458, 458, 427],
          },
        ],
      },
    ],
    insight: [
      { text: "Students using screens " },
      { text: ">6 hours/day", emphasis: "white" },
      { text: " scored an average of " },
      { text: "66 points lower", emphasis: "gold" },
      { text: " than non-users — equivalent to a " },
      { text: "two letter-grade drop", emphasis: "white" },
      { text: " (50th → 24th percentile)." },
    ],
    description:
      "PISA longitudinal data (2012–2018) reveals that students exceeding six hours of daily in-school computer use score an average of 66 points lower than non-users — equivalent to a two full letter-grade drop.",
  },
  {
    id: "naep-grade-4",
    label: "USA Grade 4 NAEP",
    title: "USA Grade 4 NAEP",
    charts: [
      naepYear0Chart("Grade 4 Math", 244, -1.45),
      naepYear0Chart("Grade 4 Reading", 222, -1.07),
    ],
    insight: [
      { text: "After Year 0 alignment, Grade 4 math declines at " },
      { text: "−1.45 points per year", emphasis: "gold" },
      { text: " on average across states reaching classroom device saturation." },
    ],
    description:
      "National NAEP averages aligned to each state's digital inflection point (Year 0). Grade 4 math and reading show sustained declines that predate COVID disruptions.",
  },
  {
    id: "naep-grade-8",
    label: "USA Grade 8 NAEP",
    title: "USA Grade 8 NAEP",
    charts: [
      naepYear0Chart("Grade 8 Math", 286, -1.81),
      naepYear0Chart("Grade 8 Reading", 268, -1.16),
    ],
    insight: [
      { text: "Grade 8 math shows the steepest post-Year 0 decline at " },
      { text: "−1.81 points per year", emphasis: "gold" },
      { text: " — outpacing reading losses." },
    ],
    description:
      "Year 0-aligned NAEP data shows middle-school math scores falling faster than reading once daily classroom device use becomes the norm.",
  },
];
