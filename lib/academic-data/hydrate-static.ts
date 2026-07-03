import { staticAcademicDatasets } from "./static";
import type { AcademicDataset } from "./types";

const CANONICAL_STATIC = new Map(
  staticAcademicDatasets.map((dataset) => [dataset.id, dataset]),
);

/**
 * CMS `academic_datasets` stores copy + chart JSON but omits layout flags
 * (`sharedYearLegend`, `chartSubtitle`). Chart JSON can also drift from code.
 * Always merge published rows with the canonical static definitions.
 */
export function hydrateAcademicStaticDataset(
  dataset: AcademicDataset,
): AcademicDataset {
  const canonical = CANONICAL_STATIC.get(dataset.id);
  if (!canonical) return dataset;

  return {
    ...canonical,
    label: dataset.label || canonical.label,
    title: dataset.title || canonical.title,
    description: dataset.description || canonical.description,
    insight: dataset.insight.length ? dataset.insight : canonical.insight,
    charts: canonical.charts,
    chartSubtitle: canonical.chartSubtitle,
    sharedYearLegend: canonical.sharedYearLegend,
    naepGradeKey: canonical.naepGradeKey,
    evidenceChartLayout: canonical.evidenceChartLayout,
    evidenceStudentGroup: canonical.evidenceStudentGroup,
    evidenceSelectedDistricts: canonical.evidenceSelectedDistricts,
    performanceSubtitle: canonical.performanceSubtitle,
    parccChartLayout: canonical.parccChartLayout,
  };
}

export function hydrateAcademicStaticDatasets(
  datasets: AcademicDataset[],
): AcademicDataset[] {
  return datasets.map(hydrateAcademicStaticDataset);
}
