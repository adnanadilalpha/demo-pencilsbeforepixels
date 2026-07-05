"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { LibraryItem } from "@/lib/cms/types";
import { isPdfFile } from "@/lib/cms/library-file";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/modal/body-scroll-lock";
import { cn } from "@/lib/utils";

type LibraryDocumentModalProps = {
  open: boolean;
  item: LibraryItem | null;
  onClose: () => void;
};

export function LibraryDocumentModal({
  open,
  item,
  onClose,
}: LibraryDocumentModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const enterFrame = window.requestAnimationFrame(() => setVisible(true));
    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!mounted || !open || !item?.fileUrl) return null;

  const isPdf = isPdfFile(item.fileKind ?? null, item.fileMimeType);

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-navy-800/60 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        className={cn(
          "relative flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#18263a] shadow-2xl transition-all duration-200",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1 pr-2">
            <h2
              id={titleId}
              className="font-display text-lg leading-snug text-white break-words sm:text-xl"
            >
              {item.title}
            </h2>
            {item.subtitle ? (
              <p className="mt-1 text-xs uppercase leading-relaxed tracking-wide text-white/60 break-words sm:text-sm lg:text-base">
                {item.subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close document"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-black">
          {isPdf ? (
            <iframe
              src={item.fileUrl}
              title={item.title}
              className="h-[min(75vh,820px)] w-full border-0 bg-white"
            />
          ) : (
            <div className="flex h-[min(40vh,420px)] flex-col items-center justify-center gap-4 px-6 text-center text-white">
              <p className="text-sm text-white/70 lg:text-base">
                This file opens best in a new tab or downloads to your device.
              </p>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 lg:text-base"
              >
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function openLibraryDocument(item: LibraryItem) {
  if (!item.fileUrl) return;

  if (isPdfFile(item.fileKind ?? null, item.fileMimeType)) {
    return "modal" as const;
  }

  window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  return "external" as const;
}
