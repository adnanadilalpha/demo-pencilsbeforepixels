import type { NaepGradeKey } from "@/lib/charts/naep-data";

export type ChartMarkerShape = "circle" | "diamond" | "square";

export type ChartPointMeta = {
  grades?: string;
  studentsTested?: number;
};

export type ChartSeries = {
  label: string;
  color: string;
  values: number[];
  dashArray?: string;
  markerShape?: ChartMarkerShape;
  opacity?: number;
  strokeWidth?: number;
  /** Per-category tooltip metadata aligned with `values`. */
  pointMeta?: ChartPointMeta[];
};

export type AcademicChart = {
  title: string;
  yLabel: string;
  xLabel: string;
  categories: string[];
  yTicks: number[];
  /** Scale domain when it differs from the first/last tick labels. */
  yMin?: number;
  yMax?: number;
  series: ChartSeries[];
  pdfUrl?: string;
};

export type InsightSegment = {
  text: string;
  emphasis?: "white" | "gold";
};

export type AcademicDataset = {
  id: string;
  label: string;
  title: string;
  charts: AcademicChart[];
  insight: InsightSegment[];
  description: string;
  /** Shown above charts when using a shared year legend (e.g. PISA). */
  chartSubtitle?: string;
  /** Side-by-side charts with one 2012/2015/2018 legend — do not merge series. */
  sharedYearLegend?: boolean;
  /** Reference image panel for Year-0 NAEP (grade 4 / grade 8). */
  naepGradeKey?: NaepGradeKey;
  /** Evidence Nebraska performance chart (weighted grades, state benchmark). */
  evidenceChartLayout?: boolean;
  /** Subtitle shown under the chart title for evidence layout. */
  performanceSubtitle?: string;
  /** Evidence student group for legend (all students vs gender). */
  evidenceStudentGroup?: "all" | "gender";
  /** Districts shown in the evidence layout sidebar (e.g. Westside gender chart). */
  evidenceSelectedDistricts?: { id: string; name: string; color: string }[];
  /** PARCC paper vs. online chart (research-style line chart + legend). */
  parccChartLayout?: boolean;
};
