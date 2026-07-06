"use client";

import { Search } from "lucide-react";
import { formatOptOutDate } from "@/lib/admin/opt-out/format";
import type { AdminOptOutSubmission } from "@/lib/admin/opt-out/types";
import { OptOutStatusBadge } from "@/components/admin/opt-out/OptOutStatusBadge";
import { cn } from "@/lib/utils";

type OptOutSubmissionsTableProps = {
  submissions: AdminOptOutSubmission[];
  query: string;
  onQueryChange: (value: string) => void;
  busyId?: string | null;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  emptyMessage?: string;
  onDownload: (submission: AdminOptOutSubmission, format: "pdf" | "docx") => void;
  onDelete: (submission: AdminOptOutSubmission) => void;
};

export function OptOutSubmissionsTable({
  submissions,
  query,
  onQueryChange,
  busyId = null,
  selectedIds,
  onToggleRow,
  onToggleAll,
  emptyMessage = "No submissions yet.",
  onDownload,
  onDelete,
}: OptOutSubmissionsTableProps) {
  const rowIds = submissions.map((submission) => submission.id);
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id));

  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      <div className="border-b border-navy-800/6 px-5 py-4">
        <div className="relative max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-body-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name or school…"
            className={cn(
              "h-10 w-full rounded-[10px] border border-navy-800/10 bg-[#f8fafc] py-2.5 pl-9 pr-4 text-sm text-navy-800 outline-none placeholder:text-navy-800/45 focus:border-navy-800/25",
            )}
          />
        </div>
      </div>

      {submissions.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-navy-800/6">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !allSelected && someSelected;
                    }}
                    onChange={() => onToggleAll(rowIds)}
                    className="size-4 rounded border-navy-800/20"
                    aria-label="Select all submissions"
                  />
                </th>
                <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  Parent
                </th>
                <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  Student
                </th>
                <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  School
                </th>
                <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  Date
                </th>
                <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  Status
                </th>
                <th className="px-5 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-body-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const isBusy = busyId === submission.id || busyId === "bulk";

                return (
                  <tr
                    key={submission.id}
                    className={cn(
                      "border-b border-navy-800/4 last:border-b-0",
                      selectedIds.has(submission.id) && "bg-gold-500/[0.05]",
                    )}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(submission.id)}
                        disabled={isBusy}
                        onChange={() => onToggleRow(submission.id)}
                        className="size-4 rounded border-navy-800/20"
                        aria-label={`Select ${submission.parentName}`}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-navy-800">
                      {submission.parentName}
                    </td>
                    <td className="px-5 py-4 text-sm text-body-muted">
                      {submission.studentName || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-body-muted">
                      {submission.school || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-body-muted">
                      {formatOptOutDate(submission.generatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <OptOutStatusBadge status={submission.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onDownload(submission, "pdf")}
                          className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800 disabled:opacity-50"
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onDownload(submission, "docx")}
                          className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800 disabled:opacity-50"
                        >
                          DOCX
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onDelete(submission)}
                          className="text-xs font-medium text-red-600/80 transition-colors hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-14 text-center text-sm text-body-muted">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
