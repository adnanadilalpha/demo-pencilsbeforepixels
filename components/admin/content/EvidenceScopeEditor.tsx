"use client";

import { useEffect, useMemo, useState } from "react";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import { AcademicDatasetsEditor } from "@/components/admin/content/AcademicDatasetsEditor";
import {
  AddScoreRowForm,
  ScoreTableEditor,
  ScoreTableSection,
} from "@/components/admin/content/ScoreTableEditor";
import { SectionForm } from "@/components/admin/content/SectionForm";
import { getEditorSection } from "@/lib/admin/content-config";

type EvidenceScopeEditorProps = {
  scope: "nebraska" | "district66";
  title: string;
  formValues: Record<string, unknown>;
  onFormChange: (key: string, value: unknown) => void;
  academicDatasets: AcademicDatasetCopy[];
  onAcademicDatasetsChange: (datasets: AcademicDatasetCopy[]) => void;
  evidenceScores: EditableScoreRow[];
  onEvidenceScoresChange: (rows: EditableScoreRow[]) => void;
};

const DATASET_KEYS: Record<EvidenceScopeEditorProps["scope"], string[]> = {
  nebraska: [
    "nebraska-math",
    "nebraska-math-gender",
    "nebraska-english",
    "state-federal",
  ],
  district66: ["westside-math-gender"],
};

export function EvidenceScopeEditor({
  scope,
  title,
  formValues,
  onFormChange,
  academicDatasets,
  onAcademicDatasetsChange,
  evidenceScores,
  onEvidenceScoresChange,
}: EvidenceScopeEditorProps) {
  const [loadingScores, setLoadingScores] = useState(false);
  const sectionId = scope === "nebraska" ? "evidence_nebraska" : "evidence_district_66";
  const section = getEditorSection(sectionId);
  const scopedDatasets = useMemo(
    () =>
      academicDatasets.filter((dataset) =>
        DATASET_KEYS[scope].includes(dataset.key),
      ),
    [academicDatasets, scope],
  );

  useEffect(() => {
    if (evidenceScores.length > 0) return;

    let cancelled = false;
    setLoadingScores(true);

    void fetch(`/api/admin/evidence/scores?scope=${scope}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load scores.");
        return response.json() as Promise<{ rows: EditableScoreRow[] }>;
      })
      .then((data) => {
        if (!cancelled) onEvidenceScoresChange(data.rows);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingScores(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scope, evidenceScores.length, onEvidenceScoresChange]);

  const updateScopedDatasets = (nextScoped: AcademicDatasetCopy[]) => {
    const byKey = new Map(nextScoped.map((item) => [item.key, item]));
    onAcademicDatasetsChange(
      academicDatasets.map((dataset) => byKey.get(dataset.key) ?? dataset),
    );
  };

  const addScoreRow = async (row: EditableScoreRow) => {
    const response = await fetch("/api/admin/evidence/scores", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: [row] }),
    });

    if (!response.ok) return;
    onEvidenceScoresChange([...evidenceScores, row]);
  };

  if (!section) return null;

  return (
    <div className="space-y-8">
      <SectionForm
        title={title}
        fields={section.fields}
        values={formValues}
        onChange={onFormChange}
      />

      <div className="space-y-4 border-t border-navy-800/8 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-navy-800">Chart copy</h3>
          <p className="mt-1 text-xs text-body-muted">
            Titles, descriptions, and insight text shown on charts in this section.
          </p>
        </div>
        <AcademicDatasetsEditor
          datasets={scopedDatasets}
          onChange={updateScopedDatasets}
        />
      </div>

      <div className="space-y-4 border-t border-navy-800/8 pt-6">
        <ScoreTableSection
          title="Score records"
          description="Live assessment scores powering charts. Edits are saved to Supabase when you publish."
        >
          <ScoreTableEditor
            rows={evidenceScores}
            loading={loadingScores}
            onChange={onEvidenceScoresChange}
          />
          <AddScoreRowForm onAdd={(row) => void addScoreRow(row)} />
        </ScoreTableSection>
      </div>
    </div>
  );
}
