import type { AcademicChart } from "@/lib/academic-data/types";

export type SlopeStat = {
  label: string;
  slope: string;
};

export type NaepSlopePair = {
  pre: { label: string; value: string };
  post: { label: string; value: string };
};

export type NaepYearZeroChart = {
  title: string;
  years: number[];
  scores: number[];
  yearZero: number;
  preSlope: number;
  postSlope: number;
  yTicks: number[];
  slopes: NaepSlopePair;
  pdfUrl?: string;
};

export type NaepGradeSection = {
  heading: string;
  math: NaepYearZeroChart;
  reading: NaepYearZeroChart;
};

export type BarChartData = {
  title: string;
  subtitle?: string;
  xLabel: string;
  yLabel: string;
  categories: string[];
  values: number[];
  yTicks: number[];
  colors?: string[];
  pdfUrl?: string;
};

export type OecdScatterPoint = {
  country: string;
  x: number;
  y: number;
};

export type OecdScatterChart = {
  title: string;
  subtitle: string;
  points: OecdScatterPoint[];
  trendLine: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  pdfUrl?: string;
};

export type MentalHealthSeries = {
  label: string;
  color: string;
  years: number[];
  values: number[];
};

export type ScreenTimeRow = {
  label: string;
  or: number;
  pct: number;
  ci: string;
  p: string;
  sig: boolean;
  grade: 3 | 6;
};

export type ScreenTimeTabData = {
  unit: string;
  note: string;
  rows: ScreenTimeRow[];
};

export type ScreenTimeChartData = {
  title: string;
  description: string;
  statPills: { value: string; label: string }[];
  howToRead: string;
  statisticalNote: string;
  tabs: {
    total: ScreenTimeTabData;
    tv: ScreenTimeTabData;
    video: ScreenTimeTabData;
  };
  pdfUrl?: string;
};

export type ParccSection = {
  title: string;
  description: string;
  math: AcademicChart;
  ela: AcademicChart;
  pdfUrl?: string;
};

export type DeviceTimeSection = {
  title: string;
  description: string;
  chart: AcademicChart;
  pdfUrl?: string;
};

export type ResearchChartsData = {
  nationalSlopes: SlopeStat[];
  grade4: NaepGradeSection;
  grade8: NaepGradeSection;
  pisa: {
    title: string;
    description: string;
    callout: string;
    math: AcademicChart;
    reading: AcademicChart;
  };
  oecd: OecdScatterChart;
  timss: {
    title: string;
    description: string;
    grade4: BarChartData;
    grade8: BarChartData;
  };
  pirls: BarChartData & { title: string; description: string };
  deviceTime: DeviceTimeSection;
  parcc: ParccSection;
  screenTime: ScreenTimeChartData;
  mentalHealth: {
    title: string;
    description: string;
    callout: string;
    series: MentalHealthSeries[];
    pdfUrl?: string;
  };
};
