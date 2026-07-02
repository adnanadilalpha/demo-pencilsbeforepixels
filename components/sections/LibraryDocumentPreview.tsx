"use client";

import { FileSpreadsheet, FileText, Presentation } from "lucide-react";
import type { LibraryFileKind } from "@/lib/cms/library-file";
import { libraryFileKindLabel } from "@/lib/cms/library-file";
import { cn } from "@/lib/utils";

type LibraryDocumentPreviewProps = {
  fileKind: LibraryFileKind | null;
  fileName?: string | null;
  compact?: boolean;
  className?: string;
};

function FileKindIcon({
  kind,
  className,
}: {
  kind: LibraryFileKind | null;
  className?: string;
}) {
  if (kind === "powerpoint") {
    return <Presentation className={className} aria-hidden />;
  }

  if (kind === "spreadsheet") {
    return <FileSpreadsheet className={className} aria-hidden />;
  }

  return <FileText className={className} aria-hidden />;
}

export function LibraryDocumentPreview({
  fileKind,
  fileName,
  compact = false,
  className,
}: LibraryDocumentPreviewProps) {
  const label = libraryFileKindLabel(fileKind ?? "other");

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-[#18263a] px-4 text-white",
        compact ? "py-4" : "py-6",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-gold-accent/35 bg-gold-accent/10 font-semibold tracking-wide text-gold-accent",
          compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        )}
      >
        {label}
      </span>

      <FileKindIcon
        kind={fileKind}
        className={cn(
          "text-white/35",
          compact ? "size-8" : "size-10",
        )}
      />

      <div className="w-full max-w-[85%] space-y-1.5" aria-hidden>
        <div className="mx-auto h-1 w-2/3 rounded-full bg-white/18" />
        <div className="mx-auto h-1 w-full rounded-full bg-white/10" />
        <div className="mx-auto h-1 w-4/5 rounded-full bg-white/10" />
      </div>

      {fileName ? (
        <p
          className={cn(
            "max-w-full truncate text-center text-white/55",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {fileName}
        </p>
      ) : null}
    </div>
  );
}
