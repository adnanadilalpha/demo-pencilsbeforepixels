"use client";

import { formatFileSize } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

type UploadProgressPanelProps = {
  fileName: string;
  fileSize: number;
  loaded: number;
  total: number;
  percent: number;
  processing?: boolean;
  compact?: boolean;
  className?: string;
};

export function UploadProgressPanel({
  fileName,
  fileSize,
  loaded,
  total,
  percent,
  processing = false,
  compact = false,
  className,
}: UploadProgressPanelProps) {
  const displayTotal = total > 0 ? total : fileSize;
  const displayLoaded = processing ? displayTotal : loaded;
  const displayPercent = processing ? 100 : percent;
  const statusLabel = processing
    ? "Saving file…"
    : `${formatFileSize(displayLoaded)} of ${formatFileSize(displayTotal)}`;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 text-left",
        compact ? "px-1 py-1" : "px-2 py-1",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-navy-800">{fileName}</p>
        <p className="text-xs text-body-muted">{formatFileSize(fileSize)}</p>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-navy-800/10">
          <div
            className={cn(
              "h-full rounded-full bg-navy-800 transition-[width] duration-150 ease-out",
              processing && "animate-pulse",
            )}
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-body-muted">
          <span>{statusLabel}</span>
          <span className="shrink-0 font-medium tabular-nums text-navy-800">
            {displayPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
