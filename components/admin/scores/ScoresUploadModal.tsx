"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { ScoresTabBar } from "@/components/admin/scores/ScoresTabBar";
import { getExpectedCsvHeaders } from "@/lib/admin/scores/csv";
import type { ScoreDataset, ScoreUploadResult } from "@/lib/admin/scores/types";
import { cn } from "@/lib/utils";

type ScoresUploadModalProps = {
  open: boolean;
  initialDataset: ScoreDataset;
  onClose: () => void;
  onUploaded: (result: ScoreUploadResult) => void;
};

export function ScoresUploadModal({
  open,
  initialDataset,
  onClose,
  onUploaded,
}: ScoresUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataset, setDataset] = useState<ScoreDataset>(initialDataset);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDataset(initialDataset);
    setFile(null);
    setError(null);
  }, [initialDataset, open]);

  if (!open) return null;

  const expectedHeaders = getExpectedCsvHeaders(dataset).join(", ");

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a CSV file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("dataset", dataset);
      formData.set("file", file);

      const response = await fetch("/api/admin/scores/upload", {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as ScoreUploadResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Upload failed.");
      }

      onUploaded(body);
      setFile(null);
      onClose();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scores-upload-title"
        className="w-full max-w-2xl rounded-[18px] border border-navy-800/10 bg-paper-50 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-navy-800/8 px-6 py-5">
          <div>
            <h2 id="scores-upload-title" className="text-lg font-semibold text-navy-800">
              Upload score data
            </h2>
            <p className="mt-1 text-sm text-body-muted">
              Replace school-year rows in Supabase with a new CSV batch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-body-muted transition-colors hover:bg-white hover:text-navy-800"
            aria-label="Close upload dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <ScoresTabBar
            active={dataset}
            onChange={(nextDataset) => {
              setDataset(nextDataset);
              setFile(null);
              setError(null);
            }}
          />

          <div
            className={cn(
              "rounded-[14px] border border-dashed px-5 py-8 text-center transition-colors",
              file
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-navy-800/15 bg-white",
            )}
          >
            <FileUp className="mx-auto size-8 text-body-muted" />
            <p className="mt-3 text-sm font-medium text-navy-800">
              {file ? file.name : "Drop a CSV file here or browse"}
            </p>
            <p className="mt-1 text-xs text-body-muted">
              Large files may take a few minutes to process.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-[10px] border border-navy-800/10 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-100"
            >
              Choose CSV
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setError(null);
              }}
            />
          </div>

          <div className="rounded-[12px] bg-white px-4 py-3 text-xs text-body-muted">
            <p className="font-medium text-navy-800">Expected columns</p>
            <p className="mt-1 break-all font-mono leading-relaxed">{expectedHeaders}</p>
          </div>

          {error ? (
            <p className="rounded-[10px] bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-navy-800/8 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-body-muted transition-colors hover:text-navy-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={uploading || !file}
            className="inline-flex items-center gap-2 rounded-[10px] bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : null}
            {uploading ? "Uploading…" : "Upload CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
