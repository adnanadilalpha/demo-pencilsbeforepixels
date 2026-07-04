import type { AcademicChart, AcademicDataset } from "./types";
import { buildPisaAcademicCharts, PISA_CHART_LABELS } from "@/lib/charts/pisa-data";
import {
  buildParccElaChart,
  PARCC_STUDY_DESCRIPTION,
} from "@/lib/charts/parcc-data";

const stateFederalParccDataset: AcademicDataset = {
  id: "state-federal",
  label: "State & Federal Testing",
  title: "State & Federal Testing",
  charts: [buildParccElaChart()],
  parccChartLayout: true,
  insight: [
    { text: "Students tested on computers scored up to " },
    { text: "0.25 standard deviations lower", emphasis: "gold" },
    { text: " in English Language Arts than on paper — up to " },
    { text: "11 months of lost measured learning", emphasis: "white" },
    { text: " in a 9-month school year." },
  ],
  description: PARCC_STUDY_DESCRIPTION,
};

export const staticAcademicDatasets: AcademicDataset[] = [
  {
    id: "pisa",
    label: "Worldwide Data (PISA)",
    title: "Worldwide Data (PISA)",
    chartSubtitle: PISA_CHART_LABELS.title,
    sharedYearLegend: true,
    charts: buildPisaAcademicCharts(),
    insight: [
      { text: "Students using screens " },
      { text: ">6 hours/day", emphasis: "white" },
      { text: " scored an average of " },
      { text: "66 points lower", emphasis: "gold" },
      { text: " than non-users — equivalent to a " },
      { text: "two letter-grade drop", emphasis: "white" },
      { text: " (50th → 24th percentile)." },
    ],
    description: PISA_CHART_LABELS.description,
  },
  {
    id: "naep-grade-4",
    label: "USA Grade 4 NAEP",
    title: "USA Grade 4 NAEP",
    naepGradeKey: "grade4",
    charts: [],
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
    naepGradeKey: "grade8",
    charts: [],
    insight: [
      { text: "Grade 8 math shows the steepest post-Year 0 decline at " },
      { text: "−1.81 points per year", emphasis: "gold" },
      { text: " — outpacing reading losses." },
    ],
    description:
      "Year 0-aligned NAEP data shows middle-school math scores falling faster than reading once daily classroom device use becomes the norm.",
  },
  stateFederalParccDataset,
];
