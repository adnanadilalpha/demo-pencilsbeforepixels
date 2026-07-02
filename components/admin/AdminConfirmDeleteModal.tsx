"use client";

import { AdminModal } from "@/components/admin/resources/AdminModal";

type AdminConfirmDeleteModalProps = {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  confirming?: boolean;
  title?: string;
};

export function AdminConfirmDeleteModal({
  open,
  itemName,
  onClose,
  onConfirm,
  confirming = false,
  title = "Delete resource",
}: AdminConfirmDeleteModalProps) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={confirming ? () => undefined : onClose}
      className="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {confirming ? "Deleting…" : "Delete"}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-body-muted">
        Are you sure you want to delete{" "}
        <span className="font-medium text-navy-800">&ldquo;{itemName}&rdquo;</span>
        ? This action cannot be undone.
      </p>
    </AdminModal>
  );
}
