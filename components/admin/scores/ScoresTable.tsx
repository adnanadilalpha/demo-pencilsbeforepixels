"use client";

import type {
  AcademicScoreRow,
  FrlScoreRow,
  ScoreDataset,
} from "@/lib/admin/scores/types";
import {
  formatScoreNumber,
  formatScorePercent,
} from "@/lib/admin/scores/format";
import { cn } from "@/lib/utils";

type ScoresTableProps = {
  dataset: ScoreDataset;
  rows: AcademicScoreRow[] | FrlScoreRow[];
  selectedIds: Set<string>;
  busyId?: string | null;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onEdit: (row: AcademicScoreRow | FrlScoreRow) => void;
  onDelete: (row: AcademicScoreRow | FrlScoreRow) => void;
  emptyMessage?: string;
};

function NewBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span className="ml-2 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
      New
    </span>
  );
}

function RowActions({
  busy,
  onEdit,
  onDelete,
}: {
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={onEdit}
        className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800 disabled:opacity-50"
      >
        Edit
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="text-xs font-medium text-red-600/80 transition-colors hover:text-red-600 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export function ScoresTable({
  dataset,
  rows,
  selectedIds,
  busyId = null,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
  emptyMessage = "No score rows match these filters.",
}: ScoresTableProps) {
  const rowIds = rows.map((row) => row.id);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id));

  if (!rows.length) {
    return (
      <div className="rounded-[14px] border border-navy-800/8 bg-white px-6 py-14 text-center text-sm text-body-muted">
        {emptyMessage}
      </div>
    );
  }

  if (dataset === "frl") {
    const frlRows = rows as FrlScoreRow[];

    return (
      <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-navy-800/6 bg-paper-50/80">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !allSelected && someSelected;
                    }}
                    onChange={() => onToggleAll(rowIds)}
                    className="size-4 rounded border-navy-800/20"
                    aria-label="Select all rows on this page"
                  />
                </th>
                {[
                  "School year",
                  "Level",
                  "District",
                  "School",
                  "Agency",
                  "FRL %",
                  "Count",
                  "As of",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    className={cn(
                      "px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted",
                      label === "Actions" && "text-right",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frlRows.map((row) => {
                const busy = busyId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-navy-800/4 last:border-b-0",
                      row.isLatestBatch && "bg-emerald-500/[0.04]",
                      selectedIds.has(row.id) && "bg-gold-500/[0.05]",
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => onToggleRow(row.id)}
                        className="size-4 rounded border-navy-800/20"
                        aria-label={`Select ${row.agencyName ?? "row"}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-navy-800">
                      {row.schoolYear ?? "—"}
                      <NewBadge visible={row.isLatestBatch} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                      {row.level ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                      {row.districtId ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                      {row.schoolId ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-navy-800">
                      {row.agencyName ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-navy-800">
                      {formatScorePercent(row.pctFrl)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                      {row.countFrl ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                      {row.dataAsOf ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <RowActions
                        busy={busy}
                        onEdit={() => onEdit(row)}
                        onDelete={() => onDelete(row)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const academicRows = rows as AcademicScoreRow[];

  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-navy-800/6 bg-paper-50/80">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={() => onToggleAll(rowIds)}
                  className="size-4 rounded border-navy-800/20"
                  aria-label="Select all rows on this page"
                />
              </th>
              {[
                "School year",
                "Level",
                "District",
                "Agency",
                "Grade",
                "Subgroup",
                "Avg score",
                "Proficient",
                "Tested",
                "As of",
                "Actions",
              ].map((label) => (
                <th
                  key={label}
                  className={cn(
                    "px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted",
                    label === "Actions" && "text-right",
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {academicRows.map((row) => {
              const busy = busyId === row.id;

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-navy-800/4 last:border-b-0",
                    row.isLatestBatch && "bg-emerald-500/[0.04]",
                    selectedIds.has(row.id) && "bg-gold-500/[0.05]",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => onToggleRow(row.id)}
                      className="size-4 rounded border-navy-800/20"
                      aria-label={`Select ${row.agencyName ?? "row"}`}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-navy-800">
                    {row.schoolYear ?? "—"}
                    <NewBadge visible={row.isLatestBatch} />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {row.level ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {row.districtId ?? "—"}
                  </td>
                  <td className="max-w-[220px] truncate px-5 py-3.5 text-sm text-navy-800">
                    {row.agencyName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {row.grade ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-body-muted">
                    {row.subgroupDesc ?? row.subgroupType ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-navy-800">
                    {formatScoreNumber(row.avgScaleScore, 1)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {row.pctProficient ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {formatScoreNumber(row.countTested, 0)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-body-muted">
                    {row.dataAsOf ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <RowActions
                      busy={busy}
                      onEdit={() => onEdit(row)}
                      onDelete={() => onDelete(row)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
