"use client";

import { useEffect, useState } from "react";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

type AcademicDatasetsEditorProps = {
  datasets: AcademicDatasetCopy[];
  onChange: (datasets: AcademicDatasetCopy[]) => void;
};

function insightToText(insight: AcademicDatasetCopy["insight"]): string {
  return insight.map((segment) => segment.text).join("");
}

function textToInsight(text: string): AcademicDatasetCopy["insight"] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return [{ text: trimmed }];
}

export function AcademicDatasetsEditor({
  datasets,
  onChange,
}: AcademicDatasetsEditorProps) {
  const [activeKey, setActiveKey] = useState(datasets[0]?.key ?? "");

  useEffect(() => {
    if (!datasets.some((dataset) => dataset.key === activeKey)) {
      setActiveKey(datasets[0]?.key ?? "");
    }
  }, [activeKey, datasets]);

  const activeIndex = datasets.findIndex((dataset) => dataset.key === activeKey);
  const activeDataset = activeIndex >= 0 ? datasets[activeIndex] : datasets[0];

  const updateDataset = (
    index: number,
    patch: Partial<AcademicDatasetCopy>,
  ) => {
    onChange(
      datasets.map((dataset, datasetIndex) =>
        datasetIndex === index ? { ...dataset, ...patch } : dataset,
      ),
    );
  };

  if (!datasets.length) {
    return (
      <p className="text-sm text-body-muted">No datasets configured for this section.</p>
    );
  }

  const resolvedIndex =
    activeIndex >= 0 ? activeIndex : datasets.findIndex((d) => d.key === activeDataset?.key);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-[12px] border border-navy-800/10 bg-paper-50 p-2">
        {datasets.map((dataset) => (
          <button
            key={dataset.key}
            type="button"
            onClick={() => setActiveKey(dataset.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              (activeDataset?.key ?? datasets[0]?.key) === dataset.key
                ? "bg-navy-800 text-white shadow-sm"
                : "text-body-muted hover:bg-white hover:text-navy-800",
            )}
          >
            {dataset.label}
          </button>
        ))}
      </div>

      {activeDataset && resolvedIndex >= 0 ? (
        <div className="space-y-4 rounded-[14px] border border-navy-800/8 bg-paper-50/60 p-5">
          <div>
            <p className="text-sm font-semibold text-navy-800">{activeDataset.label}</p>
            <p className="mt-0.5 text-xs text-body-muted">
              Chart tab copy shown on the homepage Academic Data section.
            </p>
          </div>

          <Field
            label="Tab label"
            value={activeDataset.label}
            onChange={(value) => updateDataset(resolvedIndex, { label: value })}
          />
          <Field
            label="Title"
            value={activeDataset.title}
            onChange={(value) => updateDataset(resolvedIndex, { title: value })}
          />
          <Field
            label="Description"
            value={activeDataset.description}
            multiline
            onChange={(value) => updateDataset(resolvedIndex, { description: value })}
          />
          <Field
            label="Insight copy"
            value={insightToText(activeDataset.insight)}
            multiline
            onChange={(value) =>
              updateDataset(resolvedIndex, { insight: textToInsight(value) })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      {multiline ? (
        <textarea
          className={`${adminInputClass} min-h-24 rounded-[10px] border-navy-800/12 bg-white py-3`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={`${adminInputClass} border-navy-800/12 bg-white`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
