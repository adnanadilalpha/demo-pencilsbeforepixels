"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "@/components/admin/resources/AdminModal";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import {
  academicRowToKey,
  frlRowToKey,
} from "@/lib/admin/scores/keys";
import type {
  AcademicScoreRow,
  FrlScoreRow,
  ScoreDataset,
} from "@/lib/admin/scores/types";
import { cn } from "@/lib/utils";

type ScoreEditModalProps = {
  open: boolean;
  dataset: ScoreDataset;
  row: AcademicScoreRow | FrlScoreRow | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={adminLabelClass}>{label}</span>
      <div className="rounded-[10px] border border-navy-800/8 bg-paper-100/60 px-3 py-2.5 text-sm text-body-muted">
        {value || "—"}
      </div>
    </label>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={adminLabelClass}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(adminInputClass, "h-10 rounded-[10px]")}
      />
    </label>
  );
}

export function ScoreEditModal({
  open,
  dataset,
  row,
  saving = false,
  onClose,
  onSave,
}: ScoreEditModalProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!row) return;

    if (dataset === "frl") {
      const frlRow = row as FrlScoreRow;
      setForm({
        agencyName: frlRow.agencyName ?? "",
        pctFrl: frlRow.pctFrl?.toString() ?? "",
        countFrl: frlRow.countFrl ?? "",
        dataAsOf: frlRow.dataAsOf ?? "",
      });
      return;
    }

    const academicRow = row as AcademicScoreRow;
    setForm({
      agencyName: academicRow.agencyName ?? "",
      avgScaleScore: academicRow.avgScaleScore?.toString() ?? "",
      countDeveloping: academicRow.countDeveloping ?? "",
      pctDeveloping: academicRow.pctDeveloping ?? "",
      countOnTrack: academicRow.countOnTrack ?? "",
      pctOnTrack: academicRow.pctOnTrack ?? "",
      countAdvanced: academicRow.countAdvanced ?? "",
      pctAdvanced: academicRow.pctAdvanced ?? "",
      countTested: academicRow.countTested?.toString() ?? "",
      countNotTested: academicRow.countNotTested ?? "",
      pctNotTested: academicRow.pctNotTested ?? "",
      dataAsOf: academicRow.dataAsOf ?? "",
      pctBasic: academicRow.pctBasic ?? "",
      pctProficient: academicRow.pctProficient ?? "",
    });
  }, [dataset, row]);

  if (!row) return null;

  const handleSave = async () => {
    if (dataset === "frl") {
      await onSave({
        agencyName: form.agencyName || null,
        pctFrl: form.pctFrl ? Number(form.pctFrl) : null,
        countFrl: form.countFrl || null,
        dataAsOf: form.dataAsOf || null,
      });
      return;
    }

    await onSave({
      agencyName: form.agencyName || null,
      avgScaleScore: form.avgScaleScore ? Number(form.avgScaleScore) : null,
      countDeveloping: form.countDeveloping || null,
      pctDeveloping: form.pctDeveloping || null,
      countOnTrack: form.countOnTrack || null,
      pctOnTrack: form.pctOnTrack || null,
      countAdvanced: form.countAdvanced || null,
      pctAdvanced: form.pctAdvanced || null,
      countTested: form.countTested ? Number(form.countTested) : null,
      countNotTested: form.countNotTested || null,
      pctNotTested: form.pctNotTested || null,
      dataAsOf: form.dataAsOf || null,
      pctBasic: form.pctBasic || null,
      pctProficient: form.pctProficient || null,
    });
  };

  const key =
    dataset === "frl"
      ? frlRowToKey(row as FrlScoreRow)
      : academicRowToKey(row as AcademicScoreRow);

  return (
    <AdminModal
      open={open}
      title="Edit score row"
      onClose={saving ? () => undefined : onClose}
      className="max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyField label="School year" value={key.schoolYear} />
          <ReadOnlyField label="Level" value={key.level} />
          {dataset === "frl" ? (
            <>
              <ReadOnlyField
                label="District ID"
                value={String((key as ReturnType<typeof frlRowToKey>).districtId)}
              />
              <ReadOnlyField
                label="School ID"
                value={String((key as ReturnType<typeof frlRowToKey>).schoolId)}
              />
            </>
          ) : (
            <>
              <ReadOnlyField
                label="District ID"
                value={(key as ReturnType<typeof academicRowToKey>).districtId}
              />
              <ReadOnlyField
                label="Grade"
                value={(key as ReturnType<typeof academicRowToKey>).grade}
              />
              <ReadOnlyField
                label="Subject"
                value={(key as ReturnType<typeof academicRowToKey>).subject}
              />
              <ReadOnlyField
                label="Subgroup"
                value={(key as ReturnType<typeof academicRowToKey>).subgroupDesc}
              />
            </>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <EditField
            label="Agency name"
            value={form.agencyName ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, agencyName: value }))}
          />
          <EditField
            label="Data as of"
            value={form.dataAsOf ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, dataAsOf: value }))}
          />

          {dataset === "frl" ? (
            <>
              <EditField
                label="FRL ratio"
                value={form.pctFrl ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, pctFrl: value }))}
                type="number"
              />
              <EditField
                label="Count FRL"
                value={form.countFrl ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, countFrl: value }))}
              />
            </>
          ) : (
            <>
              <EditField
                label="Average scale score"
                value={form.avgScaleScore ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, avgScaleScore: value }))
                }
                type="number"
              />
              <EditField
                label="Count tested"
                value={form.countTested ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, countTested: value }))
                }
                type="number"
              />
              <EditField
                label="Proficient %"
                value={form.pctProficient ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, pctProficient: value }))
                }
              />
              <EditField
                label="Basic %"
                value={form.pctBasic ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, pctBasic: value }))}
              />
              <EditField
                label="Developing count"
                value={form.countDeveloping ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, countDeveloping: value }))
                }
              />
              <EditField
                label="Developing %"
                value={form.pctDeveloping ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, pctDeveloping: value }))
                }
              />
              <EditField
                label="On track count"
                value={form.countOnTrack ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, countOnTrack: value }))
                }
              />
              <EditField
                label="On track %"
                value={form.pctOnTrack ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, pctOnTrack: value }))
                }
              />
              <EditField
                label="Advanced count"
                value={form.countAdvanced ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, countAdvanced: value }))
                }
              />
              <EditField
                label="Advanced %"
                value={form.pctAdvanced ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, pctAdvanced: value }))
                }
              />
              <EditField
                label="Not tested count"
                value={form.countNotTested ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, countNotTested: value }))
                }
              />
              <EditField
                label="Not tested %"
                value={form.pctNotTested ?? ""}
                onChange={(value) =>
                  setForm((current) => ({ ...current, pctNotTested: value }))
                }
              />
            </>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
