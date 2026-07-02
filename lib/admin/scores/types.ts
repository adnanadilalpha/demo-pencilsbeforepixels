export type ScoreDataset = "math" | "english" | "frl";

export type ScoreDatasetMeta = {
  id: ScoreDataset;
  label: string;
  table: "math_scores" | "english_scores" | "frl_scores";
  description: string;
};

export const SCORE_DATASETS: ScoreDatasetMeta[] = [
  {
    id: "math",
    label: "Math",
    table: "math_scores",
    description: "Mathematics assessment scores by school, grade, and subgroup.",
  },
  {
    id: "english",
    label: "English",
    table: "english_scores",
    description: "English Language Arts scores by school, grade, and subgroup.",
  },
  {
    id: "frl",
    label: "FRL",
    table: "frl_scores",
    description: "Free and reduced lunch percentages by agency.",
  },
];

export function getScoreDatasetMeta(dataset: ScoreDataset): ScoreDatasetMeta {
  const meta = SCORE_DATASETS.find((entry) => entry.id === dataset);
  if (!meta) throw new Error(`Unknown score dataset: ${dataset}`);
  return meta;
}

export function parseScoreDataset(value: string | null | undefined): ScoreDataset {
  if (value === "math" || value === "english" || value === "frl") return value;
  return "math";
}

export type ScoreUploadBatch = {
  id: string;
  dataset: ScoreDataset;
  fileName: string;
  schoolYears: string[];
  rowCount: number;
  replacedCount: number;
  uploadedBy: string | null;
  createdAt: string;
};

export type AcademicScoreRow = {
  id: string;
  level: string | null;
  schoolYear: string | null;
  countyId: number | null;
  districtId: string | null;
  schoolId: number | null;
  agencyName: string | null;
  subject: string | null;
  grade: string | null;
  subgroupType: string | null;
  subgroupDesc: string | null;
  avgScaleScore: number | null;
  countDeveloping: string | null;
  pctDeveloping: string | null;
  countOnTrack: string | null;
  pctOnTrack: string | null;
  countAdvanced: string | null;
  pctAdvanced: string | null;
  countTested: number | null;
  countNotTested: string | null;
  pctNotTested: string | null;
  dataAsOf: string | null;
  pctBasic: string | null;
  pctProficient: string | null;
  uploadBatchId: string | null;
  isLatestBatch: boolean;
};

export type FrlScoreRow = {
  id: string;
  level: string | null;
  schoolYear: string | null;
  countyId: number | null;
  districtId: number | null;
  schoolId: number | null;
  agencyName: string | null;
  dataAsOf: string | null;
  pctFrl: number | null;
  countFrl: string | null;
  uploadBatchId: string | null;
  isLatestBatch: boolean;
};

export type ScoreListFilters = {
  dataset: ScoreDataset;
  page: number;
  pageSize: number;
  schoolYear?: string;
  level?: string;
  districtId?: string;
  search?: string;
  latestOnly?: boolean;
  batchId?: string;
};

export type ScoresPageSummary = {
  dataset: ScoreDataset;
  totalRows: number;
  latestBatch: ScoreUploadBatch | null;
  schoolYears: string[];
  levels: string[];
};

export type ScoresListResponse = {
  summary: ScoresPageSummary;
  batches: ScoreUploadBatch[];
  rows: AcademicScoreRow[] | FrlScoreRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type ScoreUploadResult = {
  batch: ScoreUploadBatch;
  insertedCount: number;
  replacedCount: number;
  schoolYears: string[];
};

export type ScoreDeletePayload = {
  dataset: ScoreDataset;
  keys: Array<{
    schoolYear: string;
    grade?: string;
    level: string;
    districtId: string | number;
    schoolId?: number;
    agencyName?: string;
    subgroupType?: string;
    subgroupDesc?: string;
    subject?: string;
  }>;
};

export type ScoreUpdatePayload = {
  dataset: ScoreDataset;
  key: ScoreDeletePayload["keys"][number];
  patch: Record<string, unknown>;
};
