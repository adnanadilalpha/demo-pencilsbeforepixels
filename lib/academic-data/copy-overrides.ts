import "server-only";

import type { AcademicDataset } from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loadAcademicCopyOverrides(): Promise<
  Map<string, Pick<AcademicDataset, "label" | "title" | "description" | "insight">>
> {
  const supabase = createAdminClient();
  const [datasetsRes, insightsRes] = await Promise.all([
    supabase
      .from("academic_datasets")
      .select("key, label, title, description")
      .order("sort_order"),
    supabase
      .from("academic_dataset_insights")
      .select("dataset_key, sort_order, text, emphasis")
      .order("sort_order"),
  ]);

  const insightsByKey = new Map<string, AcademicDataset["insight"]>();
  for (const row of insightsRes.data ?? []) {
    const list = insightsByKey.get(row.dataset_key) ?? [];
    list.push({
      text: row.text,
      emphasis: (row.emphasis as "white" | "gold" | null) ?? undefined,
    });
    insightsByKey.set(row.dataset_key, list);
  }

  const overrides = new Map<
    string,
    Pick<AcademicDataset, "label" | "title" | "description" | "insight">
  >();

  for (const row of datasetsRes.data ?? []) {
    overrides.set(row.key, {
      label: row.label,
      title: row.title,
      description: row.description,
      insight: insightsByKey.get(row.key) ?? [],
    });
  }

  return overrides;
}

export function applyAcademicCopyOverride(
  dataset: AcademicDataset,
  overrides: Map<
    string,
    Pick<AcademicDataset, "label" | "title" | "description" | "insight">
  >,
): AcademicDataset {
  const copy = overrides.get(dataset.id);
  if (!copy) return dataset;

  return {
    ...dataset,
    label: copy.label || dataset.label,
    title: copy.title || dataset.title,
    description: copy.description || dataset.description,
    insight: copy.insight.length ? copy.insight : dataset.insight,
  };
}
