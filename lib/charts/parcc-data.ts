import type { AcademicChart, ChartSeries } from "@/lib/academic-data/types";

export const PARCC_STUDY_TITLE = "PARCC Testing Mode Study — Paper vs. Online";

export const PARCC_YEARS = ["2011", "2012", "2013", "2014", "2015", "2016"] as const;

export const PARCC_Y_TICKS = [-0.3, -0.2, -0.1, 0, 0.1];

/** Plotly range from the reference charts page in nebaraska. */
export const PARCC_Y_MIN = -0.35;
export const PARCC_Y_MAX = 0.12;

/** ELA series colors from nebaraska/src/app/charts/page.tsx. */
export const PARCC_ELA_COLORS = {
  paperBoth: "#10B981",
  online2015Paper2016: "#3B82F6",
  onlineBoth: "#9CA3AF",
  paper2015Online2016: "#EF4444",
} as const;

/** Math series colors from the research PARCC chart. */
export const PARCC_MATH_COLORS = {
  paperBoth: "#10b981",
  online2015Paper2016: "#3b82f6",
  onlineBoth: "#000000",
  paper2015Online2016: "#ef4444",
} as const;

export const PARCC_ELA_SERIES: ChartSeries[] = [
  {
    label: "Paper, 2015 & 2016",
    color: PARCC_ELA_COLORS.paperBoth,
    values: [-0.065, -0.053, -0.054, -0.043, 0.1, 0.03],
    markerShape: "circle",
  },
  {
    label: "Online 2015, Paper 2016",
    color: PARCC_ELA_COLORS.online2015Paper2016,
    values: [0, -0.015, -0.002, -0.018, -0.195, 0.055],
    markerShape: "circle",
  },
  {
    label: "Online, 2015 & 2016",
    color: PARCC_ELA_COLORS.onlineBoth,
    values: [0.085, 0.082, 0.079, 0.07, -0.02, 0.01],
    markerShape: "circle",
  },
  {
    label: "Paper 2015, Online 2016",
    color: PARCC_ELA_COLORS.paper2015Online2016,
    values: [-0.145, -0.18, -0.188, -0.16, -0.02, -0.335],
    markerShape: "circle",
  },
];

export const PARCC_MATH_SERIES: ChartSeries[] = [
  {
    label: "Paper, 2015 & 2016",
    color: PARCC_MATH_COLORS.paperBoth,
    values: [-0.05, -0.048, -0.038, -0.037, 0.025, -0.01],
    markerShape: "circle",
  },
  {
    label: "Online 2015, Paper 2016",
    color: PARCC_MATH_COLORS.online2015Paper2016,
    values: [0.018, 0.015, 0.022, -0.002, -0.07, 0.03],
    markerShape: "circle",
  },
  {
    label: "Online, 2015 & 2016",
    color: PARCC_MATH_COLORS.onlineBoth,
    values: [0.07, 0.071, 0.055, 0.055, 0.003, 0.03],
    markerShape: "circle",
  },
  {
    label: "Paper 2015, Online 2016",
    color: PARCC_MATH_COLORS.paper2015Online2016,
    values: [-0.175, -0.19, -0.175, -0.12, -0.065, -0.22],
    markerShape: "circle",
  },
];

export const PARCC_STUDY_DESCRIPTION =
  "A peer-reviewed study published in the Economics of Education Review analyzed nearly 1.2 million student test results across Massachusetts public schools in grades 3 through 8, administering the identical exam in both online and paper formats simultaneously to isolate the effect of the testing mode itself. Researchers found that students who took the test on a computer scored 0.10 standard deviations lower in math and 0.25 standard deviations lower in English Language Arts compared to students who took the identical test on paper.";

export const PARCC_STUDY_DESCRIPTION_FULL =
  "A peer-reviewed study published in the Economics of Education Review analyzed nearly 1.2 million student test results across Massachusetts public schools in grades 3 through 8, administering the identical exam in both online and paper formats simultaneously to isolate the effect of the testing mode itself. Researchers found that students who took the test on a computer scored 0.10 standard deviations lower in math and 0.25 standard deviations lower in English Language Arts compared to students who took the identical test on paper, meaning a student who truly deserves a B is being measured as a C student simply because of the device in front of them. To put those numbers in everyday terms, the researchers calculated that the ELA penalty alone represents up to 11 months of lost measured learning in a 9-month school year! The science test, which remained on paper for all students, showed zero penalty, confirming that the format of the test, not the knowledge of the child, is causing the gap.";

function buildParccChart(title: string, series: ChartSeries[]): AcademicChart {
  return {
    title,
    yLabel: "Std. Achievement",
    xLabel: "Year",
    categories: [...PARCC_YEARS],
    yTicks: PARCC_Y_TICKS,
    yMin: PARCC_Y_MIN,
    yMax: PARCC_Y_MAX,
    series,
  };
}

export function buildParccElaChart(): AcademicChart {
  return buildParccChart("English Language Arts", PARCC_ELA_SERIES);
}

export function buildParccMathChart(): AcademicChart {
  return buildParccChart("Math", PARCC_MATH_SERIES);
}
