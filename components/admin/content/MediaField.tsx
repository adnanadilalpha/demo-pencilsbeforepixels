"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, RefreshCw } from "lucide-react";
import { UploadProgressPanel } from "@/components/admin/UploadProgressPanel";
import { adminLabelClass } from "@/components/admin/admin-styles";
import { BookCoverUploadField } from "@/components/admin/resources/BookCoverUploadField";
import {
  brandLogoDimensions,
  brandLogoFieldPreviewClass,
  brandLogoPreviewClass,
} from "@/lib/brand/logo-layout";
import {
  canonicalStoragePath,
  publicUrlToStoragePath,
} from "@/lib/admin/media-paths";
import { uploadMediaWithProgress } from "@/lib/admin/upload-media-client";
import { cn } from "@/lib/utils";

type MediaFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  filename?: string;
  altText?: string;
  variant?: "default" | "logo" | "icon" | "bookCover";
  previewTheme?: "light" | "dark";
  accept?: string;
};

type UploadState = {
  fileName: string;
  fileSize: number;
  loaded: number;
  total: number;
  percent: number;
  processing: boolean;
};

export function MediaField({
  label,
  value,
  onChange,
  folder,
  filename,
  altText,
  variant = "default",
  previewTheme = "dark",
  accept = "image/*",
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = uploadState !== null;

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    const acceptsSvgOnly =
      accept.includes("svg") && !accept.includes("image/*");

    if (acceptsSvgOnly && !/\.svg$/i.test(file.name) && file.type !== "image/svg+xml") {
      setError("Logo must be an SVG file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

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
      if (altText) formData.append("altText", altText);

      const replacePath =
        (value ? publicUrlToStoragePath(value) : null) ??
        (filename ? canonicalStoragePath(folder, filename) : null);
      if (replacePath) {
        formData.append("replaceStoragePath", replacePath);
      }

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

      onChange(media.publicUrl);
      setUploadState(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed.",
      );
      setUploadState(null);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const previewSurface =
    variant === "logo" || variant === "icon"
      ? previewTheme === "light"
        ? "bg-paper-300"
        : "bg-navy-800"
      : "bg-paper-50";
  const emptyLabelClass =
    previewTheme === "light" ? "text-body-muted" : "text-white/60";

  const brandPreviewContainer =
    variant === "logo"
      ? brandLogoFieldPreviewClass
      : variant === "icon"
        ? "flex aspect-square max-w-[10rem] min-h-28 items-center justify-center px-4"
        : "";

  if (variant === "bookCover") {
    const replacePath =
      (value ? publicUrlToStoragePath(value) : null) ??
      (filename ? canonicalStoragePath(folder, filename) : null) ??
      undefined;

    return (
      <BookCoverUploadField
        label={label}
        valueUrl={value || null}
        filename={filename}
        replaceStoragePath={replacePath}
        title={altText ?? label}
        onUploaded={(result) => onChange(result?.publicUrl ?? "")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={adminLabelClass}>{label}</label>

      <div className="overflow-hidden rounded-[10px] border border-navy-800/10">
        {uploadState ? (
          <div
            className={cn(
              "flex items-center justify-center px-4 py-6",
              previewSurface,
              variant === "default" && "aspect-16/7",
              variant === "logo" && brandPreviewContainer,
              variant === "icon" && brandPreviewContainer,
            )}
          >
            <UploadProgressPanel
              fileName={uploadState.fileName}
              fileSize={uploadState.fileSize}
              loaded={uploadState.loaded}
              total={uploadState.total}
              percent={uploadState.percent}
              processing={uploadState.processing}
              className="max-w-md"
            />
          </div>
        ) : value ? (
          <div
            className={cn(
              "relative flex w-full items-center justify-center",
              previewSurface,
              variant === "default" && "aspect-16/7 bg-paper-50",
              variant === "logo" && brandPreviewContainer,
              variant === "icon" && brandPreviewContainer,
            )}
          >
            {variant === "default" ? (
              <Image
                key={value}
                src={value}
                alt={altText ?? label}
                fill
                className="object-cover"
                unoptimized
              />
            ) : variant === "logo" ? (
              <Image
                key={value}
                src={value}
                alt={altText ?? label}
                width={brandLogoDimensions.width}
                height={brandLogoDimensions.height}
                className={brandLogoPreviewClass}
                unoptimized
              />
            ) : (
              <Image
                key={value}
                src={value}
                alt={altText ?? label}
                width={48}
                height={48}
                className="size-12 rounded-lg object-contain"
                unoptimized
              />
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center text-sm",
              previewSurface,
              variant === "default" && "aspect-16/7 bg-paper-50 text-body-muted",
              variant === "logo" && brandPreviewContainer,
              variant === "icon" && brandPreviewContainer,
              emptyLabelClass,
            )}
          >
            No image uploaded
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-navy-800/8 bg-white p-3">
          {!uploading ? (
            <button
              type="button"
              onClick={openPicker}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-navy-800/12 px-3 py-1.5 text-xs font-medium text-navy-800 transition-colors hover:bg-paper-50",
              )}
            >
              {value ? (
                <RefreshCw className="size-3.5" />
              ) : (
                <ImagePlus className="size-3.5" />
              )}
              {value ? "Replace" : "Upload"}
            </button>
          ) : null}
        </div>
      </div>

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
