"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import { adminLabelClass } from "@/components/admin/admin-styles";
import {
  canonicalStoragePath,
  publicUrlToStoragePath,
} from "@/lib/admin/media-paths";
import { cn } from "@/lib/utils";

type MediaFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  filename?: string;
  altText?: string;
};

export function MediaField({
  label,
  value,
  onChange,
  folder,
  filename,
  altText,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
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

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Upload failed.");
      }

      const media = (await response.json()) as { publicUrl: string };
      onChange(media.publicUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={adminLabelClass}>{label}</label>

      <div className="overflow-hidden rounded-[10px] border border-navy-800/10">
        {value ? (
          <div className="relative aspect-16/7 w-full bg-paper-50">
            <Image
              key={value}
              src={value}
              alt={altText ?? label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex aspect-16/7 items-center justify-center bg-paper-50 text-sm text-body-muted">
            No image uploaded
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-navy-800/8 bg-white p-3">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-navy-800/12 px-3 py-1.5 text-xs font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : value ? (
              <RefreshCw className="size-3.5" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
            {value ? "Replace" : "Upload"}
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />
    </div>
  );
}
