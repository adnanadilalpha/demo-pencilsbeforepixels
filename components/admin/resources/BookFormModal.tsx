"use client";

import { useEffect, useState } from "react";
import { adminInputClass } from "@/components/admin/admin-styles";
import {
  AdminModal,
  AdminModalActions,
  AdminModalField,
} from "@/components/admin/resources/AdminModal";
import { FileUploadField } from "@/components/admin/resources/FileUploadField";
import type { AdminBook, BookInput } from "@/lib/admin/resources/types";

type BookFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  initial?: AdminBook | null;
};

const emptyForm = (): BookInput => ({
  title: "",
  author: "",
  summary: "",
  coverMediaId: null,
  viewUrl: "",
  featured: false,
});

export function BookFormModal({
  open,
  onClose,
  onSaved,
  initial = null,
}: BookFormModalProps) {
  const [form, setForm] = useState<BookInput>(emptyForm);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            title: initial.title,
            author: initial.author,
            summary: initial.summary ?? "",
            coverMediaId: initial.coverMediaId,
            viewUrl: initial.viewUrl ?? "",
            featured: false,
          }
        : emptyForm(),
    );
    setCoverUrl(initial?.coverUrl ?? null);
    setError(null);
  }, [open, initial]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      author: form.author,
      coverMediaId: form.coverMediaId,
      viewUrl: form.viewUrl.trim() || null,
      featured: false,
    };

    try {
      if (initial) {
        const response = await fetch("/api/admin/resources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "books",
            id: initial.id,
            patch: payload,
          }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save book.");
        }
      } else {
        const response = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "books", data: payload }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save book.");
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
      title={initial ? "Edit book" : "Add book"}
      onClose={onClose}
      footer={
        <AdminModalActions
          onCancel={onClose}
          onSave={() => void handleSave()}
          saveLabel={saving ? "Saving…" : initial ? "Save changes" : "Save book"}
          saving={saving}
        />
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-body-muted">
          Books saved here appear in the Research Library section on the homepage.
        </p>

        <FileUploadField
          label="Cover image"
          folder="library"
          accept="image/*"
          valueUrl={coverUrl}
          onUploaded={(result) => {
            setCoverUrl(result?.publicUrl ?? null);
            setForm((current) => ({
              ...current,
              coverMediaId: result?.id ?? null,
            }));
          }}
        />

        <AdminModalField label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Book title"
            className={adminInputClass}
          />
        </AdminModalField>

        <AdminModalField label="Author">
          <input
            type="text"
            value={form.author}
            onChange={(event) =>
              setForm((current) => ({ ...current, author: event.target.value }))
            }
            placeholder="Author name"
            className={adminInputClass}
          />
        </AdminModalField>

        <AdminModalField label="View link">
          <input
            type="url"
            value={form.viewUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, viewUrl: event.target.value }))
            }
            placeholder="https://..."
            className={adminInputClass}
          />
          <p className="mt-1 text-xs text-body-muted">
            Optional. Opens in a new tab from the View button on the homepage.
          </p>
        </AdminModalField>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </AdminModal>
  );
}
