"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, RotateCcw, Upload } from "lucide-react";
import { UploadProgressPanel } from "@/components/admin/UploadProgressPanel";
import {
  AdminModal,
  AdminModalActions,
} from "@/components/admin/resources/AdminModal";
import { BookCoverFrame } from "@/components/books/BookCoverFrame";
import {
  BOOK_COVER_CANVAS_HEIGHT,
  BOOK_COVER_CANVAS_WIDTH,
} from "@/lib/admin/book-cover-spec";
import {
  buildBookCoverUploadOptions,
  previewBookCover,
  reprocessBookCover,
  uploadBookCoverWithProgress,
} from "@/lib/admin/upload-book-cover-client";
import { cn } from "@/lib/utils";

type BookCoverUploadModalProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  valueUrl?: string | null;
  filename?: string;
  replaceStoragePath?: string;
  title?: string;
  onUploaded: (result: { id: string; publicUrl: string } | null) => void;
};

type UploadState = {
  fileName: string;
  fileSize: number;
  loaded: number;
  total: number;
  percent: number;
  processing: boolean;
};

export function BookCoverUploadModal({
  open,
  onClose,
  label,
  valueUrl,
  filename,
  replaceStoragePath,
  title,
  onUploaded,
}: BookCoverUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [processingExisting, setProcessingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = uploadState !== null || processingExisting || previewLoading;
  const sourcePreviewUrl = originalPreviewUrl ?? valueUrl ?? null;
  const previewSrc =
    backgroundRemoved && processedPreviewUrl
      ? processedPreviewUrl
      : sourcePreviewUrl;
  const hasExistingCover = Boolean(valueUrl);
  const hasPendingUpload = pendingFile !== null;
  const canRemoveBackground = Boolean(pendingFile || valueUrl || originalPreviewUrl);

  useEffect(() => {
    if (!open) return;

    setPendingFile(null);
    setOriginalPreviewUrl(null);
    setProcessedPreviewUrl(null);
    setBackgroundRemoved(false);
    setUploadState(null);
    setProcessingExisting(false);
    setPreviewLoading(false);
    setError(null);

    return () => {
      for (const url of blobUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      blobUrlsRef.current = [];
    };
  }, [open]);

  const trackBlob = (url: string) => {
    if (!url.startsWith("blob:")) return;
    blobUrlsRef.current.push(url);
  };

  const revokeBlob = (url: string | null) => {
    if (!url?.startsWith("blob:")) return;
    URL.revokeObjectURL(url);
    blobUrlsRef.current = blobUrlsRef.current.filter((entry) => entry !== url);
  };
  const resetPendingFile = () => {
    revokeBlob(originalPreviewUrl);
    revokeBlob(processedPreviewUrl);
    setPendingFile(null);
    setOriginalPreviewUrl(null);
    setProcessedPreviewUrl(null);
    setBackgroundRemoved(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelected = (file: File) => {
    resetPendingFile();
    setError(null);
    setPendingFile(file);
    const nextUrl = URL.createObjectURL(file);
    trackBlob(nextUrl);
    setOriginalPreviewUrl(nextUrl);
  };

  const handleRemoveBackground = async () => {
    if (!canRemoveBackground) return;

    setPreviewLoading(true);
    setError(null);

    try {
      const nextPreview = await previewBookCover({
        file: pendingFile,
        sourceUrl: pendingFile ? null : (originalPreviewUrl ?? valueUrl ?? null),
      });

      revokeBlob(processedPreviewUrl);
      trackBlob(nextPreview);
      setProcessedPreviewUrl(nextPreview);
      setBackgroundRemoved(true);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Background removal failed.",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRestoreOriginal = () => {
    revokeBlob(processedPreviewUrl);
    setProcessedPreviewUrl(null);
    setBackgroundRemoved(false);
  };

  const uploadOptions = buildBookCoverUploadOptions(backgroundRemoved);

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
      const media = await uploadBookCoverWithProgress(
        file,
        {
          filename,
          replaceStoragePath,
          title: title ?? file.name,
          options: uploadOptions,
        },
        (progress) => {
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
        },
      );

      onUploaded(media);
      resetPendingFile();
      setUploadState(null);
      onClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      setUploadState(null);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleReprocess = async () => {
    if (!valueUrl) return;

    setProcessingExisting(true);
    setError(null);

    try {
      const media = await reprocessBookCover(valueUrl, uploadOptions);
      onUploaded(media);
      onClose();
    } catch (processError) {
      setError(
        processError instanceof Error ? processError.message : "Processing failed.",
      );
    } finally {
      setProcessingExisting(false);
    }
  };

  const handleSave = () => {
    if (pendingFile) {
      void handleUpload(pendingFile);
      return;
    }

    if (valueUrl) {
      void handleReprocess();
    }
  };

  const saveLabel = busy
    ? uploadState
      ? "Uploading…"
      : previewLoading
        ? "Removing background…"
        : "Saving…"
    : hasPendingUpload
      ? "Save cover"
      : hasExistingCover
        ? "Save cover"
        : "Save";

  return (
    <AdminModal
      open={open}
      title={label}
      onClose={onClose}
      layer="nested"
      className="max-w-md"
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60"
            >
              <Upload className="size-3.5" />
              {hasExistingCover || hasPendingUpload ? "Replace image" : "Choose image"}
            </button>

            <AdminModalActions
              onCancel={onClose}
              onSave={() => handleSave()}
              saveLabel={saveLabel}
              saving={busy}
              saveDisabled={!hasPendingUpload && !hasExistingCover}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs leading-relaxed text-body-muted">
          Covers are auto-sized to {BOOK_COVER_CANVAS_WIDTH}×{BOOK_COVER_CANVAS_HEIGHT}px.
          Use remove background only for images with white or black margins.
        </p>

        <div className="overflow-hidden rounded-[12px] border border-navy-800/10 bg-paper-50/40">
          <div className="bg-paper-100/80 p-4">
            {previewSrc ? (
              <BookCoverFrame
                src={previewSrc}
                alt={label}
                variant="admin"
                className="mx-auto w-full max-w-xs rounded-none border-0 shadow-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className={cn(
                  "mx-auto flex aspect-square w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-navy-800/15 bg-white px-4 text-center text-sm text-body-muted transition-colors hover:border-navy-800/25 hover:bg-paper-50 disabled:opacity-60",
                )}
              >
                <Upload className="size-5 text-navy-800/70" />
                <span className="font-medium text-navy-800">Choose cover image</span>
                <span className="text-xs">PNG, JPG, or WebP</span>
              </button>
            )}
          </div>

          {previewSrc ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-navy-800/8 bg-white px-4 py-3">
              {!backgroundRemoved ? (
                <button
                  type="button"
                  onClick={() => void handleRemoveBackground()}
                  disabled={busy || !canRemoveBackground}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60"
                >
                  <Eraser className="size-3.5" />
                  {previewLoading ? "Removing…" : "Remove background"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreOriginal}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60"
                >
                  <RotateCcw className="size-3.5" />
                  Show original
                </button>
              )}

              {backgroundRemoved ? (
                <span className="text-xs text-emerald-700">Background removed — preview updated</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {uploadState ? (
          <UploadProgressPanel
            fileName={uploadState.fileName}
            fileSize={uploadState.fileSize}
            loaded={uploadState.loaded}
            total={uploadState.total}
            percent={uploadState.percent}
            processing={uploadState.processing || uploadState.percent >= 100}
          />
        ) : null}

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />
    </AdminModal>
  );
}
