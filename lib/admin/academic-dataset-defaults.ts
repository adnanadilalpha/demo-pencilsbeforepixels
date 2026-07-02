import type { InsightSegment } from "@/lib/academic-data/types";
import { staticAcademicDatasets } from "@/lib/academic-data/static";

export type AcademicDatasetCopy = {
  key: string;
  label: string;
  title: string;
  description: string;
  insight: InsightSegment[];
};

const DYNAMIC_DEFAULTS: AcademicDatasetCopy[] = [
  {
    key: "nebraska-math",
    label: "Nebraska Mathematics",
    title: "Nebraska Mathematics",
    description:
      "State of Nebraska mathematics results for all students, weighted across grades 3–8. Source: Nebraska Department of Education assessment data.",
    insight: [
      { text: "Nebraska mathematics scale scores remain below pre-2020 levels across " },
      { text: "grades 3–8", emphasis: "gold" },
      { text: ", with limited recovery through 2024–25." },
    ],
  },
  {
    key: "nebraska-math-gender",
    label: "Nebraska Mathematics by Gender",
    title: "Nebraska Mathematics by Gender",
    description:
      "Nebraska statewide mathematics performance split by gender. Source: Nebraska Department of Education.",
    insight: [
      { text: "Gender gaps in Nebraska mathematics have " },
      { text: "persisted or widened", emphasis: "gold" },
      { text: " in several recent school years." },
    ],
  },
  {
    key: "westside-math-gender",
    label: "Westside Mathematics by Gender",
    title: "Westside Mathematics by Gender",
    description:
      "Westside Community Schools (District 66) mathematics performance by gender. Source: Nebraska Department of Education.",
    insight: [
      { text: "District 66 trends mirror statewide patterns with " },
      { text: "local variation by gender", emphasis: "gold" },
      { text: " across recent years." },
    ],
  },
  {
    key: "nebraska-english",
    label: "Nebraska English",
    title: "Nebraska English",
    description:
      "State of Nebraska English Language Arts results for all students across grades 3–8. Source: Nebraska Department of Education.",
    insight: [
      { text: "English Language Arts scores show " },
      { text: "sustained pressure post-2020", emphasis: "gold" },
      { text: " with uneven recovery across grade bands." },
    ],
  },
  {
    key: "state-federal",
    label: "State & Federal Testing",
    title: "State & Federal Testing",
    description:
      "Grade 8 proficiency trends from Nebraska state assessments and federal NAEP benchmarks.",
    insight: [
      { text: "On-track proficiency rates remain " },
      { text: "below pre-pandemic peaks", emphasis: "gold" },
      { text: " in both mathematics and English." },
    ],
  },
];

export function getAcademicDatasetDefaults(): AcademicDatasetCopy[] {
  const staticCopies: AcademicDatasetCopy[] = staticAcademicDatasets.map(
    (dataset) => ({
      key: dataset.id,
      label: dataset.label,
      title: dataset.title,
      description: dataset.description,
      insight: dataset.insight.map((segment) => ({ ...segment })),
    }),
  );

  return [...staticCopies, ...DYNAMIC_DEFAULTS];
}

export function mergeAcademicDatasetCopies(
  stored: AcademicDatasetCopy[],
): AcademicDatasetCopy[] {
  const byKey = new Map(stored.map((item) => [item.key, item]));

  return getAcademicDatasetDefaults().map((defaults) => {
    const existing = byKey.get(defaults.key);
    if (!existing) return defaults;

    return {
      ...defaults,
      ...existing,
      insight: existing.insight?.length ? existing.insight : defaults.insight,
    };
  });
}

/** Apply unsaved local edits on top of the full 8-dataset list from the server. */
export function mergeAcademicDatasetEditorState(
  serverDatasets: AcademicDatasetCopy[],
  localDatasets?: AcademicDatasetCopy[],
): AcademicDatasetCopy[] {
  const base = mergeAcademicDatasetCopies(serverDatasets);
  if (!localDatasets?.length) return base;

  const byKey = new Map(localDatasets.map((item) => [item.key, item]));
  return base.map((item) => {
    const patch = byKey.get(item.key);
    if (!patch) return item;

    return {
      ...item,
      ...patch,
      insight: patch.insight?.length ? patch.insight : item.insight,
    };
  });
}

export const HOMEPAGE_ACADEMIC_DATASET_KEYS = getAcademicDatasetDefaults().map(
  (dataset) => dataset.key,
);
