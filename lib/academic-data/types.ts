export type ChartMarkerShape = "circle" | "diamond" | "square";

export type ChartSeries = {
  label: string;
  color: string;
  values: number[];
  dashArray?: string;
  markerShape?: ChartMarkerShape;
  opacity?: number;
  strokeWidth?: number;
};

export type AcademicChart = {
  title: string;
  yLabel: string;
  xLabel: string;
  categories: string[];
  yTicks: number[];
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
};
