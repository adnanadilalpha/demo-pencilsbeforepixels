"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Trash2, Upload } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ScoreEditModal } from "@/components/admin/scores/ScoreEditModal";
import { ScoresFilters } from "@/components/admin/scores/ScoresFilters";
import { ScoresTabBar, parseScoresTab } from "@/components/admin/scores/ScoresTabBar";
import { ScoresTable } from "@/components/admin/scores/ScoresTable";
import { ScoresUploadModal } from "@/components/admin/scores/ScoresUploadModal";
import { UploadHistoryPanel } from "@/components/admin/scores/UploadHistoryPanel";
import {
  academicRowToKey,
  frlRowToKey,
  scoreRowLabel,
} from "@/lib/admin/scores/keys";
import {
  formatRowCount,
  formatScoreDate,
  getDatasetLabel,
} from "@/lib/admin/scores/format";
import type {
  AcademicScoreRow,
  FrlScoreRow,
  ScoreDataset,
  ScoreUploadResult,
  ScoresListResponse,
} from "@/lib/admin/scores/types";
import { cn } from "@/lib/utils";

type ScoresViewProps = {
  initialData: ScoresListResponse;
};

type PendingDelete =
  | { mode: "single"; row: AcademicScoreRow | FrlScoreRow }
  | { mode: "bulk"; count: number };

function rowToDeleteKey(
  dataset: ScoreDataset,
  row: AcademicScoreRow | FrlScoreRow,
) {
  return dataset === "frl"
    ? frlRowToKey(row as FrlScoreRow)
    : academicRowToKey(row as AcademicScoreRow);
}

export function ScoresView({ initialData }: ScoresViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeDataset = parseScoresTab(searchParams.get("dataset"));

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(searchParams.get("upload") === "1");
  const [uploadNotice, setUploadNotice] = useState<ScoreUploadResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<AcademicScoreRow | FrlScoreRow | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const schoolYear = searchParams.get("schoolYear") ?? "";
  const level = searchParams.get("level") ?? "";
  const districtId = searchParams.get("districtId") ?? "";
  const search = searchParams.get("search") ?? "";
  const latestOnly = searchParams.get("latestOnly") === "1";
  const batchId = searchParams.get("batchId") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("dataset", activeDataset);
    if (schoolYear) params.set("schoolYear", schoolYear);
    if (level) params.set("level", level);
    if (districtId) params.set("districtId", districtId);
    if (search) params.set("search", search);
    if (latestOnly) params.set("latestOnly", "1");
    if (batchId) params.set("batchId", batchId);
    params.set("page", String(page));
    params.set("pageSize", "25");
    return params.toString();
  }, [
    activeDataset,
    batchId,
    districtId,
    latestOnly,
    level,
    page,
    schoolYear,
    search,
  ]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/scores?${queryString}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const next = (await response.json()) as ScoresListResponse;
      setData(next);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeDataset, page, queryString]);

  const replaceParams = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(patch).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });

    router.replace(`/admin/scores?${params.toString()}`, { scroll: false });
  };

  const setDataset = (dataset: ScoreDataset) => {
    replaceParams({
      dataset,
      batchId: undefined,
      page: "1",
    });
  };

  const selectedRows = useMemo(
    () => data.rows.filter((row) => selectedIds.has(row.id)),
    [data.rows, selectedIds],
  );

  const toggleRow = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds((current) => {
      const allSelected = ids.every((id) => current.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  };

  const deleteRows = async (rows: Array<AcademicScoreRow | FrlScoreRow>) => {
    setActionError(null);
    setBusyId(rows.length === 1 ? rows[0].id : "bulk");
    setDeleting(true);

    try {
      const response = await fetch("/api/admin/scores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: activeDataset,
          keys: rows.map((row) => rowToDeleteKey(activeDataset, row)),
        }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to delete scores.");
      }

      setPendingDelete(null);
      setSelectedIds(new Set());
      await refresh();
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete scores.",
      );
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  };

  const saveEdit = async (patch: Record<string, unknown>) => {
    if (!editingRow) return;

    setSavingEdit(true);
    setActionError(null);
    setBusyId(editingRow.id);

    try {
      const response = await fetch("/api/admin/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: activeDataset,
          key: rowToDeleteKey(activeDataset, editingRow),
          patch,
        }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update score.");
      }

      setEditingRow(null);
      await refresh();
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to update score.",
      );
    } finally {
      setSavingEdit(false);
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const latestBatchCount = data.summary.latestBatch?.rowCount ?? 0;

  const deleteLabel =
    pendingDelete?.mode === "bulk"
      ? `${pendingDelete.count} selected score row${pendingDelete.count === 1 ? "" : "s"}`
      : pendingDelete?.mode === "single"
        ? scoreRowLabel(activeDataset, pendingDelete.row)
        : "";

  return (
    <div className="flex w-full flex-col gap-8">
      <AdminPageHeader
        title="Scores"
        description="Upload and review Nebraska assessment CSV data for evidence charts."
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-[10px] bg-navy-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            <Upload className="size-4" />
            Upload CSV
          </button>
        }
      />

      {actionError ? (
        <div className="rounded-[14px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {uploadNotice ? (
        <div className="flex items-start gap-3 rounded-[14px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Upload completed</p>
            <p className="mt-1 text-sm text-emerald-800/90">
              Inserted {formatRowCount(uploadNotice.insertedCount)}{" "}
              {getDatasetLabel(uploadNotice.batch.dataset).toLowerCase()} rows
              {uploadNotice.replacedCount > 0
                ? ` and replaced ${formatRowCount(uploadNotice.replacedCount)} existing rows`
                : ""}
              {uploadNotice.schoolYears.length
                ? ` for ${uploadNotice.schoolYears.join(", ")}.`
                : "."}
            </p>
            <button
              type="button"
              onClick={() => {
                setUploadNotice(null);
                replaceParams({
                  dataset: uploadNotice.batch.dataset,
                  batchId: uploadNotice.batch.id,
                  latestOnly: "1",
                  page: "1",
                });
              }}
              className="mt-2 text-sm font-medium text-emerald-900 underline-offset-2 hover:underline"
            >
              View newly uploaded rows
            </button>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[14px] border border-navy-800/8 bg-white px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-body-muted">
            Total rows
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy-800">
            {formatRowCount(data.summary.totalRows)}
          </p>
        </div>
        <div className="rounded-[14px] border border-navy-800/8 bg-white px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-body-muted">
            Latest upload
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy-800">
            {data.summary.latestBatch ? formatRowCount(latestBatchCount) : "—"}
          </p>
          <p className="mt-1 text-xs text-body-muted">
            {data.summary.latestBatch
              ? formatScoreDate(data.summary.latestBatch.createdAt)
              : "No uploads yet"}
          </p>
        </div>
        <div className="rounded-[14px] border border-navy-800/8 bg-white px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-body-muted">
            Filtered results
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy-800">
            {formatRowCount(data.total)}
          </p>
        </div>
      </section>

      <ScoresTabBar active={activeDataset} onChange={setDataset} />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
            Upload history
          </p>
          <UploadHistoryPanel
            batches={data.batches}
            activeBatchId={batchId || undefined}
            onSelectBatch={(nextBatchId) => {
              replaceParams({
                batchId: nextBatchId,
                latestOnly: undefined,
                page: "1",
              });
            }}
          />
        </aside>

        <div className="space-y-4">
          <ScoresFilters
            schoolYears={data.summary.schoolYears}
            levels={data.summary.levels}
            schoolYear={schoolYear}
            level={level}
            districtId={districtId}
            search={search}
            latestOnly={latestOnly}
            onSchoolYearChange={(value) =>
              replaceParams({ schoolYear: value || undefined, page: "1" })
            }
            onLevelChange={(value) =>
              replaceParams({ level: value || undefined, page: "1" })
            }
            onDistrictIdChange={(value) =>
              replaceParams({ districtId: value || undefined, page: "1" })
            }
            onSearchChange={(value) =>
              replaceParams({ search: value || undefined, page: "1" })
            }
            onLatestOnlyChange={(value) =>
              replaceParams({
                latestOnly: value ? "1" : undefined,
                batchId: value ? undefined : batchId || undefined,
                page: "1",
              })
            }
          />

          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-gold-500/20 bg-gold-500/10 px-4 py-3">
              <p className="text-sm font-medium text-navy-800">
                {selectedIds.size} row{selectedIds.size === 1 ? "" : "s"} selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-[10px] px-3 py-2 text-sm font-medium text-body-muted transition-colors hover:text-navy-800"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDelete({ mode: "bulk", count: selectedIds.size })
                  }
                  className="inline-flex items-center gap-2 rounded-[10px] border border-red-600/20 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                  Delete selected
                </button>
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "transition-opacity",
              loading && "pointer-events-none opacity-60",
            )}
          >
            <ScoresTable
              dataset={activeDataset}
              rows={data.rows}
              selectedIds={selectedIds}
              busyId={busyId}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onEdit={setEditingRow}
              onDelete={(row) => setPendingDelete({ mode: "single", row })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-body-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => replaceParams({ page: String(page - 1) })}
                className="rounded-[10px] border border-navy-800/10 bg-white px-3 py-2 text-sm font-medium text-navy-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => replaceParams({ page: String(page + 1) })}
                className="rounded-[10px] border border-navy-800/10 bg-white px-3 py-2 text-sm font-medium text-navy-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScoresUploadModal
        open={uploadOpen}
        initialDataset={activeDataset}
        onClose={() => setUploadOpen(false)}
        onUploaded={(result) => {
          setUploadNotice(result);
          void refresh();
          router.refresh();
        }}
      />

      <ScoreEditModal
        open={Boolean(editingRow)}
        dataset={activeDataset}
        row={editingRow}
        saving={savingEdit}
        onClose={() => setEditingRow(null)}
        onSave={saveEdit}
      />

      <AdminConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete score row"
        itemName={deleteLabel}
        confirming={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.mode === "single") {
            void deleteRows([pendingDelete.row]);
            return;
          }
          void deleteRows(selectedRows);
        }}
      />
    </div>
  );
}
