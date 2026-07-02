"use client";

import { Sparkles } from "lucide-react";
import type { ScoreUploadBatch } from "@/lib/admin/scores/types";
import {
  formatRowCount,
  formatScoreDate,
  getDatasetLabel,
} from "@/lib/admin/scores/format";
import { cn } from "@/lib/utils";

type UploadHistoryPanelProps = {
  batches: ScoreUploadBatch[];
  activeBatchId?: string;
  onSelectBatch: (batchId: string | undefined) => void;
};

export function UploadHistoryPanel({
  batches,
  activeBatchId,
  onSelectBatch,
}: UploadHistoryPanelProps) {
  if (!batches.length) {
    return (
      <div className="rounded-[14px] border border-navy-800/8 bg-white px-5 py-8 text-sm text-body-muted">
        No uploads yet. Upload a CSV to create the first batch.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onSelectBatch(undefined)}
        className={cn(
          "rounded-[12px] border px-4 py-3 text-left transition-colors",
          !activeBatchId
            ? "border-gold-500/40 bg-gold-500/10"
            : "border-navy-800/8 bg-white hover:border-navy-800/15",
        )}
      >
        <p className="text-sm font-medium text-navy-800">All rows</p>
        <p className="mt-1 text-xs text-body-muted">Browse the full dataset</p>
      </button>

      {batches.map((batch, index) => {
        const isLatest = index === 0;
        const active = activeBatchId === batch.id;

        return (
          <button
            key={batch.id}
            type="button"
            onClick={() => onSelectBatch(batch.id)}
            className={cn(
              "rounded-[12px] border px-4 py-3 text-left transition-colors",
              active
                ? "border-gold-500/40 bg-gold-500/10"
                : "border-navy-800/8 bg-white hover:border-navy-800/15",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-800">
                  {batch.fileName}
                </p>
                <p className="mt-1 text-xs text-body-muted">
                  {getDatasetLabel(batch.dataset)} · {formatScoreDate(batch.createdAt)}
                </p>
              </div>
              {isLatest ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                  <Sparkles className="size-3" />
                  Latest
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-body-muted">
              <span className="rounded-full bg-paper-200/80 px-2 py-0.5">
                {formatRowCount(batch.rowCount)} inserted
              </span>
              {batch.replacedCount > 0 ? (
                <span className="rounded-full bg-paper-200/80 px-2 py-0.5">
                  {formatRowCount(batch.replacedCount)} replaced
                </span>
              ) : null}
              {batch.schoolYears.length ? (
                <span className="rounded-full bg-paper-200/80 px-2 py-0.5">
                  {batch.schoolYears.join(", ")}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
