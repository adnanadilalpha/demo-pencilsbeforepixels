"use client";

import { useMemo, useState } from "react";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import { cn } from "@/lib/utils";

type ScoreTableEditorProps = {
  rows: EditableScoreRow[];
  onChange: (rows: EditableScoreRow[]) => void;
  loading?: boolean;
};

type ScoreGroup = {
  id: string;
  label: string;
  rows: EditableScoreRow[];
};

function groupLabel(row: EditableScoreRow): string {
  const subject = row.table === "math_scores" ? "Mathematics" : "English";
  const audience =
    row.level === "ST"
      ? "Statewide"
      : row.level === "DI"
        ? "District average"
        : "School";

  if (row.subgroupType === "GENDER") {
    return `${subject} · ${audience} · by gender`;
  }

  if (row.grade === "08" && row.level === "ST") {
    return `${subject} · Grade 8 proficiency inputs`;
  }

  return `${subject} · ${audience} · grades ${row.grade === "ALL" ? "all" : "3–8"}`;
}

export function ScoreTableEditor({
  rows,
  onChange,
  loading = false,
}: ScoreTableEditorProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const map = new Map<string, ScoreGroup>();

    for (const row of rows) {
      const id = groupLabel(row);
      const existing = map.get(id);
      if (existing) {
        existing.rows.push(row);
      } else {
        map.set(id, { id, label: id, rows: [row] });
      }
    }

    return [...map.values()].map((group) => ({
      ...group,
      rows: group.rows.sort((a, b) =>
        `${a.schoolYear}-${a.grade}-${a.subgroupDesc}`.localeCompare(
          `${b.schoolYear}-${b.grade}-${b.subgroupDesc}`,
        ),
      ),
    }));
  }, [rows]);

  const updateScore = (
    target: EditableScoreRow,
    avgScaleScore: number | null,
  ) => {
    onChange(
      rows.map((row) => {
        const same =
          row.table === target.table &&
          row.schoolYear === target.schoolYear &&
          row.grade === target.grade &&
          row.level === target.level &&
          row.districtId === target.districtId &&
          row.subgroupType === target.subgroupType &&
          row.subgroupDesc === target.subgroupDesc &&
          row.subject === target.subject;

        return same ? { ...row, avgScaleScore } : row;
      }),
    );
  };

  if (loading) {
    return (
      <div className="rounded-[12px] border border-navy-800/10 bg-paper-50 px-4 py-8 text-center text-sm text-body-muted">
        Loading score records…
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-[12px] border border-navy-800/10 bg-paper-50 px-4 py-8 text-center text-sm text-body-muted">
        No score records found for this section.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const open = openGroups[group.id] ?? true;

        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-[12px] border border-navy-800/10 bg-white"
          >
            <button
              type="button"
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.id]: !open,
                }))
              }
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-800 hover:bg-paper-50"
            >
              {group.label}
              <span className="text-xs font-normal text-body-muted">
                {group.rows.length} rows
              </span>
            </button>

            {open ? (
              <div className="overflow-x-auto border-t border-navy-800/8">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-paper-50 text-body-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Year</th>
                      <th className="px-3 py-2 font-medium">Grade</th>
                      <th className="px-3 py-2 font-medium">Group</th>
                      <th className="px-3 py-2 font-medium">Agency</th>
                      <th className="px-3 py-2 font-medium">Avg score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => {
                      const rowKey = [
                        row.table,
                        row.schoolYear,
                        row.grade,
                        row.subgroupDesc,
                        row.subject,
                      ].join("-");

                      return (
                        <tr key={rowKey} className="border-t border-navy-800/6">
                          <td className="px-3 py-2 text-navy-800">{row.schoolYear}</td>
                          <td className="px-3 py-2 text-navy-800">{row.grade}</td>
                          <td className="px-3 py-2 text-navy-800">
                            {row.subgroupDesc || row.subgroupType}
                          </td>
                          <td className="max-w-[180px] truncate px-3 py-2 text-body-muted">
                            {row.agencyName || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              className={cn(adminInputClass, "h-8 w-28 px-2 py-1")}
                              value={row.avgScaleScore ?? ""}
                              onChange={(event) => {
                                const value = event.target.value;
                                updateScore(
                                  row,
                                  value === "" ? null : Number.parseFloat(value),
                                );
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ScoreTableSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
        <p className="mt-1 text-xs text-body-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function AddScoreRowForm({
  onAdd,
}: {
  onAdd: (row: EditableScoreRow) => void;
}) {
  const [draft, setDraft] = useState({
    table: "math_scores" as EditableScoreRow["table"],
    schoolYear: "",
    grade: "ALL",
    level: "ST",
    districtId: "",
    subgroupType: "ALL",
    subgroupDesc: "All Students",
    subject: "MATHEMATICS",
    agencyName: "",
    avgScaleScore: "",
  });

  return (
    <div className="rounded-[12px] border border-dashed border-navy-800/15 bg-paper-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-body-muted">
        Add score row
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Table">
          <select
            className={adminInputClass}
            value={draft.table}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                table: event.target.value as EditableScoreRow["table"],
              }))
            }
          >
            <option value="math_scores">Math scores</option>
            <option value="english_scores">English scores</option>
          </select>
        </Field>
        <Field label="School year">
          <input
            className={adminInputClass}
            placeholder="2023-2024"
            value={draft.schoolYear}
            onChange={(event) =>
              setDraft((current) => ({ ...current, schoolYear: event.target.value }))
            }
          />
        </Field>
        <Field label="Grade">
          <input
            className={adminInputClass}
            value={draft.grade}
            onChange={(event) =>
              setDraft((current) => ({ ...current, grade: event.target.value }))
            }
          />
        </Field>
        <Field label="Level">
          <input
            className={adminInputClass}
            value={draft.level}
            onChange={(event) =>
              setDraft((current) => ({ ...current, level: event.target.value }))
            }
          />
        </Field>
        <Field label="District ID">
          <input
            className={adminInputClass}
            placeholder="66 or blank"
            value={draft.districtId}
            onChange={(event) =>
              setDraft((current) => ({ ...current, districtId: event.target.value }))
            }
          />
        </Field>
        <Field label="Subgroup">
          <input
            className={adminInputClass}
            value={draft.subgroupDesc}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                subgroupDesc: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Avg score">
          <input
            className={adminInputClass}
            type="number"
            step="0.01"
            value={draft.avgScaleScore}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                avgScaleScore: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      <button
        type="button"
        className="mt-3 rounded-full bg-navy-800 px-4 py-2 text-xs font-semibold text-white"
        onClick={() => {
          if (!draft.schoolYear.trim()) return;
          onAdd({
            table: draft.table,
            schoolYear: draft.schoolYear.trim(),
            grade: draft.grade.trim(),
            level: draft.level.trim(),
            districtId: draft.districtId.trim(),
            subgroupType: draft.subgroupType,
            subgroupDesc: draft.subgroupDesc.trim(),
            subject: draft.subject,
            agencyName: draft.agencyName.trim(),
            avgScaleScore:
              draft.avgScaleScore === ""
                ? null
                : Number.parseFloat(draft.avgScaleScore),
          });
        }}
      >
        Add row
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      {children}
    </div>
  );
}
