"use client";

import { useEffect, useState } from "react";
import { adminInputClass } from "@/components/admin/admin-styles";
import { ToggleField } from "@/components/admin/content/ToggleField";
import {
  AdminModal,
  AdminModalActions,
  AdminModalField,
} from "@/components/admin/resources/AdminModal";
import { FileUploadField } from "@/components/admin/resources/FileUploadField";
import type {
  AdminLibraryItem,
  LibraryItemInput,
  ResourceApiType,
} from "@/lib/admin/resources/types";

type LibraryItemFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  initial?: AdminLibraryItem | null;
  saveType: "research-papers" | "parent-resources";
};

const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain";

const emptyForm = (): LibraryItemInput => ({
  title: "",
  subtitle: "",
  fileMediaId: null,
  visible: true,
});

function modalCopy(saveType: LibraryItemFormModalProps["saveType"], editing: boolean) {
  if (saveType === "parent-resources") {
    return {
      title: editing ? "Edit parent resource" : "Add parent resource",
      saveLabel: editing ? "Save changes" : "Save resource",
      subtitleLabel: "Label",
      subtitlePlaceholder: "e.g. Parent Toolkit",
      fileLabel: "Resource file",
    };
  }

  return {
    title: editing ? "Edit research paper" : "Add research paper",
    saveLabel: editing ? "Save changes" : "Save paper",
    subtitleLabel: "Source / Organisation",
    subtitlePlaceholder: "e.g. ACER",
    fileLabel: "Paper file",
  };
}

export function LibraryItemFormModal({
  open,
  onClose,
  onSaved,
  initial = null,
  saveType,
}: LibraryItemFormModalProps) {
  const [form, setForm] = useState<LibraryItemInput>(emptyForm);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = modalCopy(saveType, Boolean(initial));

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            title: initial.title,
            subtitle: initial.subtitle,
            fileMediaId: initial.fileMediaId,
            visible: initial.visible,
          }
        : emptyForm(),
    );
    setFileUrl(initial?.fileUrl ?? null);
    setError(null);
  }, [open, initial]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.subtitle.trim()) {
      setError("Title and subtitle are required.");
      return;
    }

    if (!form.fileMediaId) {
      setError("Upload a file (PDF, Word, PowerPoint, or similar).");
      return;
    }

    setSaving(true);
    setError(null);

    const apiType: ResourceApiType = saveType;

    try {
      if (initial) {
        const response = await fetch("/api/admin/resources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: apiType,
            id: initial.id,
            patch: form,
          }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save.");
        }
      } else {
        const response = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: apiType, data: form }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save.");
        }
      }

      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      title={copy.title}
      onClose={onClose}
      footer={
        <AdminModalActions
          onCancel={onClose}
          onSave={() => void handleSave()}
          saveLabel={saving ? "Saving…" : copy.saveLabel}
          saving={saving}
        />
      }
    >
      <div className="space-y-4">
        <AdminModalField label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Title"
            className={adminInputClass}
          />
        </AdminModalField>

        <AdminModalField label={copy.subtitleLabel}>
          <input
            type="text"
            value={form.subtitle}
            onChange={(event) =>
              setForm((current) => ({ ...current, subtitle: event.target.value }))
            }
            placeholder={copy.subtitlePlaceholder}
            className={adminInputClass}
          />
        </AdminModalField>

        <FileUploadField
          label={copy.fileLabel}
          folder={
            saveType === "parent-resources"
              ? "resources/parent"
              : "resources/research"
          }
          accept={DOCUMENT_ACCEPT}
          valueUrl={fileUrl}
          onUploaded={(result) => {
            setFileUrl(result?.publicUrl ?? null);
            setForm((current) => ({
              ...current,
              fileMediaId: result?.id ?? null,
            }));
          }}
        />

        <p className="text-xs text-body-muted">
          PDF, Word, PowerPoint, Excel, and plain text files are supported.
        </p>

        <ToggleField
          label="Visible on site"
          checked={form.visible}
          onChange={(visible) => setForm((current) => ({ ...current, visible }))}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </AdminModal>
  );
}
