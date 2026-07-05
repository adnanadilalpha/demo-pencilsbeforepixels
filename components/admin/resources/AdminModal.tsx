"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { lockBodyScroll } from "@/lib/modal/body-scroll-lock";
import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Use nested when opening above another modal. */
  layer?: "base" | "nested";
};

export function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  className,
  layer = "base",
}: AdminModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
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

    setVisible(true);
    const unlock = lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlock();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-200",
        layer === "nested" ? "z-[60]" : "z-50",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-navy-800/40" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[min(90vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-[14px] border border-navy-800/10 bg-white shadow-xl",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-navy-800/8 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-navy-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-body-muted transition-colors hover:bg-paper-50 hover:text-navy-800"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <div className="border-t border-navy-800/8 bg-paper-50/50 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function AdminModalField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm text-navy-800/80">{label}</label>
      {children}
    </div>
  );
}

export function AdminModalActions({
  onCancel,
  onSave,
  saveLabel,
  saving,
  saveDisabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  saving?: boolean;
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={Boolean(saving || saveDisabled)}
        className="inline-flex items-center gap-2 rounded-full border border-gold-500 bg-gold-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c26d05] disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </div>
  );
}
