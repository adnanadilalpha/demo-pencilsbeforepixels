import type { BookCoverUploadOptions } from "@/lib/admin/book-cover-spec";
import {
  DEFAULT_BOOK_COVER_UPLOAD_OPTIONS,
} from "@/lib/admin/book-cover-spec";
import {
  type MediaUploadResult,
  type UploadProgressUpdate,
  uploadMediaWithProgress,
} from "@/lib/admin/upload-media-client";

export type { BookCoverUploadOptions } from "@/lib/admin/book-cover-spec";
export { DEFAULT_BOOK_COVER_UPLOAD_OPTIONS } from "@/lib/admin/book-cover-spec";

function appendBookCoverOptions(formData: FormData, options: BookCoverUploadOptions) {
  formData.append("bookCoverRemoveBg", options.removeBackground ? "true" : "false");
  formData.append("bookCoverResize", options.resizeToCanvas ? "true" : "false");
}

export function uploadBookCoverWithProgress(
  file: File,
  params: {
    folder?: string;
    filename?: string;
    replaceStoragePath?: string;
    title?: string;
    options?: BookCoverUploadOptions;
  },
  onProgress?: (progress: UploadProgressUpdate) => void,
): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", params.folder ?? "library");
  if (params.filename) formData.append("filename", params.filename);
  if (params.replaceStoragePath) {
    formData.append("replaceStoragePath", params.replaceStoragePath);
  }
  if (params.title) formData.append("title", params.title);
  appendBookCoverOptions(formData, params.options ?? DEFAULT_BOOK_COVER_UPLOAD_OPTIONS);

  return uploadMediaWithProgress(formData, onProgress);
}

export async function reprocessBookCover(
  publicUrl: string,
  options: BookCoverUploadOptions,
): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append("folder", "library");
  formData.append("reprocessUrl", publicUrl);
  appendBookCoverOptions(formData, options);

  const response = await fetch("/api/admin/media", {
    method: "POST",
    body: formData,
  });

  const body = (await response.json()) as MediaUploadResult & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to process cover.");
  }

  return body;
}

export async function previewBookCover(params: {
  file?: File | null;
  sourceUrl?: string | null;
}): Promise<string> {
  const formData = new FormData();
  formData.append("folder", "library");
  formData.append("bookCoverRemoveBg", "true");
  formData.append("bookCoverResize", "true");

  if (params.file) {
    formData.append("file", params.file);
  } else if (params.sourceUrl) {
    formData.append("sourceUrl", params.sourceUrl);
  } else {
    throw new Error("Choose an image first.");
  }

  const response = await fetch("/api/admin/media/book-cover-preview", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to preview cover.");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function buildBookCoverUploadOptions(removeBackground: boolean): BookCoverUploadOptions {
  return {
    removeBackground,
    resizeToCanvas: true,
  };
}
