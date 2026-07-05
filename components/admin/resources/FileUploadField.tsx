"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { UploadProgressPanel } from "@/components/admin/UploadProgressPanel";
import { adminLabelClass } from "@/components/admin/admin-styles";
import { BookCoverFrame } from "@/components/books/BookCoverFrame";
import { uploadMediaWithProgress } from "@/lib/admin/upload-media-client";
import { cn } from "@/lib/utils";

type UploadResult = {
  id: string;
  publicUrl: string;
};

type UploadState = {
  fileName: string;
  fileSize: number;
  loaded: number;
  total: number;
  percent: number;
  processing: boolean;
};

type FileUploadFieldProps = {
  label: string;
  accept?: string;
  folder: string;
  filename?: string;
  valueUrl?: string | null;
  onUploaded: (result: UploadResult | null) => void;
  compact?: boolean;
  preview?: "default" | "bookCover";
};

export function FileUploadField({
  label,
  accept = "image/*,application/pdf",
  folder,
  filename,
  valueUrl,
  onUploaded,
  compact = false,
  preview = "default",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = uploadState !== null;

  const handleUpload = async (file: File) => {
    setUploadState({
      fileName: file.name,
      fileSize: file.size,
      loaded: 0,
      total: file.size,
      percent: 0,
      processing: false,
    });
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      if (filename) formData.append("filename", filename);
      formData.append("title", file.name);

      const media = await uploadMediaWithProgress(formData, (progress) => {
        setUploadState((current) =>
          current
            ? {
                ...current,
                loaded: progress.loaded,
                total: progress.total,
                percent: progress.percent,
                processing: progress.percent >= 100,
              }
            : current,
        );
      });

      onUploaded(media);
      setUploadState(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
      setUploadState(null);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className={adminLabelClass}>{label}</span>

      {valueUrl && preview === "bookCover" && !uploadState ? (
        <div className="overflow-hidden rounded-[10px] border border-navy-800/10">
          <BookCoverFrame
            src={valueUrl}
            alt={label}
            variant="admin"
            className="max-w-xs rounded-none border-0 shadow-none"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-navy-800/15 bg-paper-50 text-sm text-body-muted transition-colors hover:border-navy-800/25 hover:bg-white disabled:opacity-100",
          compact ? "px-4 py-8" : "px-4 py-10",
          uploading && "cursor-default hover:bg-paper-50",
        )}
      >
        {uploadState ? (
          <UploadProgressPanel
            fileName={uploadState.fileName}
            fileSize={uploadState.fileSize}
            loaded={uploadState.loaded}
            total={uploadState.total}
            percent={uploadState.percent}
            processing={uploadState.processing}
            compact={compact}
          />
        ) : (
          <>
            <Upload className="size-5 text-body-muted" />
            <span className="mt-2">{valueUrl ? "Replace file" : "Upload"}</span>
            {valueUrl ? (
              <span className="mt-1 max-w-full truncate px-4 text-xs text-navy-800/70">
                {valueUrl.split("/").pop()}
              </span>
            ) : null}
          </>
        )}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />
    </div>
  );
}
