import type { AcademicChart } from "@/lib/academic-data/types";
import type { ResearchChartsData } from "@/lib/research/types";

export type EvidenceTab = "nebraska" | "district-66";
export type EvidenceView = "performance" | "equity";
export type EvidenceSubject = "math" | "english";
export type StudentGroup = "all" | "gender";

export type DistrictOption = {
  id: string;
  name: string;
  color: string;
};

export type PerformancePanelData = {
  panelType: "line";
  title: string;
  subtitle: string;
  chart: AcademicChart;
  selectedDistricts: DistrictOption[];
};

export type EquityDistrictPoint = {
  id: string;
  name: string;
  color: string;
  frlPct: number;
  score: number;
  residual: number;
};

export type EquityScatterPanelData = {
  panelType: "equity";
  title: string;
  subtitle: string;
  description: string;
  schoolYear: string;
  points: EquityDistrictPoint[];
  trendLine: { frlPct: number; score: number }[];
  xLabel: string;
  yLabel: string;
  overperformers: EquityDistrictPoint[];
  underperformers: EquityDistrictPoint[];
  highlightedDistricts: DistrictOption[];
  availableDistricts: DistrictOption[];
};

export type EvidencePanelResponse =
  | PerformancePanelData
  | EquityScatterPanelData;

export type ResearchPanelData = ResearchChartsData;

export type EvidenceVersion = {
  version: string;
  updatedAt: string;
};

export type EvidenceBootstrap = {
  version: string;
  allDistricts: DistrictOption[];
  grades: string[];
  schoolYears: string[];
  defaultSchoolYear: string;
  performance: PerformancePanelData;
};
