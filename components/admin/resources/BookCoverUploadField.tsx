"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { adminLabelClass } from "@/components/admin/admin-styles";
import { BookCoverUploadModal } from "@/components/admin/resources/BookCoverUploadModal";
import { BookCoverFrame } from "@/components/books/BookCoverFrame";
import { cn } from "@/lib/utils";

type BookCoverUploadFieldProps = {
  label: string;
  valueUrl?: string | null;
  filename?: string;
  replaceStoragePath?: string;
  title?: string;
  onUploaded: (result: { id: string; publicUrl: string } | null) => void;
};

export function BookCoverUploadField({
  label,
  valueUrl,
  filename,
  replaceStoragePath,
  title,
  onUploaded,
}: BookCoverUploadFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className={adminLabelClass}>{label}</span>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "group overflow-hidden rounded-[10px] border border-navy-800/10 bg-paper-50/40 text-left transition-colors hover:border-navy-800/20 hover:bg-paper-50",
          )}
        >
          {valueUrl ? (
            <div className="p-3">
              <BookCoverFrame
                src={valueUrl}
                alt={label}
                variant="admin"
                className="mx-auto max-w-xs rounded-none border-0 shadow-none"
              />
              <p className="mt-3 text-center text-xs font-medium text-navy-800/80 group-hover:text-navy-800">
                Edit cover
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8">
              <ImagePlus className="size-5 text-navy-800/70" />
              <span className="text-sm font-medium text-navy-800">Add cover image</span>
              <span className="text-xs text-body-muted">
                Upload, resize, and remove background
              </span>
            </div>
          )}
        </button>
      </div>

      <BookCoverUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        label={label}
        valueUrl={valueUrl}
        filename={filename}
        replaceStoragePath={replaceStoragePath}
        title={title}
        onUploaded={onUploaded}
      />
    </>
  );
}
