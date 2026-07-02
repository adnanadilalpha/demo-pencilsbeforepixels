"use client";

import { useEffect, useState } from "react";
import { adminInputClass } from "@/components/admin/admin-styles";
import {
  AdminModal,
  AdminModalActions,
  AdminModalField,
} from "@/components/admin/resources/AdminModal";
import { FileUploadField } from "@/components/admin/resources/FileUploadField";
import type {
  AdminVideo,
  VideoInput,
  VideoSource,
} from "@/lib/admin/resources/types";
import { parseYouTubeVideoId } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type VideoFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  initial?: AdminVideo | null;
};

type FormState = VideoInput & { youtubeUrl: string };

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  source: "youtube",
  youtubeUrl: "",
  youtubeId: null,
  videoMediaId: null,
  thumbnailMediaId: null,
  visible: true,
});

export function VideoFormModal({
  open,
  onClose,
  onSaved,
  initial = null,
}: VideoFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            title: initial.title,
            description: initial.description ?? "",
            source: initial.source,
            youtubeUrl: initial.youtubeUrl,
            youtubeId: initial.youtubeId,
            videoMediaId: initial.videoMediaId,
            thumbnailMediaId: initial.thumbnailMediaId,
            visible: initial.visible,
          }
        : emptyForm(),
    );
    setThumbnailUrl(initial?.thumbnailUrl ?? null);
    setVideoUrl(initial?.videoUrl ?? null);
    setError(null);
  }, [open, initial]);

  const setSource = (source: VideoSource) => {
    setForm((current) => ({ ...current, source }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    let youtubeId: string | null = null;
    let videoMediaId: string | null = null;

    if (form.source === "youtube") {
      youtubeId = parseYouTubeVideoId(form.youtubeUrl);
      if (!youtubeId) {
        setError("Enter a valid YouTube URL.");
        return;
      }
    } else {
      videoMediaId = form.videoMediaId;
      if (!videoMediaId) {
        setError("Upload a video file.");
        return;
      }
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      youtubeId,
      videoMediaId,
      thumbnailMediaId: form.thumbnailMediaId,
      visible: form.visible,
    };

    try {
      if (initial) {
        const response = await fetch("/api/admin/resources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "videos",
            id: initial.id,
            patch: payload,
          }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save video.");
        }
      } else {
        const response = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "videos", data: payload }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save video.");
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
      title={initial ? "Edit video" : "Add video"}
      onClose={onClose}
      footer={
        <AdminModalActions
          onCancel={onClose}
          onSave={() => void handleSave()}
          saveLabel={saving ? "Saving…" : initial ? "Save changes" : "Save video"}
          saving={saving}
        />
      }
    >
      <div className="space-y-4">
        <AdminModalField label="Video source">
          <div className="flex gap-2 rounded-[10px] border border-navy-800/10 bg-paper-50 p-1">
            {(["youtube", "upload"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSource(option)}
                className={cn(
                  "flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                  form.source === option
                    ? "bg-navy-800 text-white"
                    : "text-body-muted hover:bg-white hover:text-navy-800",
                )}
              >
                {option === "youtube" ? "YouTube URL" : "Upload file"}
              </button>
            ))}
          </div>
        </AdminModalField>

        {form.source === "youtube" ? (
          <AdminModalField label="YouTube URL">
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  youtubeUrl: event.target.value,
                }))
              }
              placeholder="https://youtube.com/watch?v=…"
              className={adminInputClass}
            />
          </AdminModalField>
        ) : (
          <FileUploadField
            label="Video file"
            folder="resources/videos"
            accept="video/*"
            valueUrl={videoUrl}
            onUploaded={(result) => {
              setVideoUrl(result?.publicUrl ?? null);
              setForm((current) => ({
                ...current,
                videoMediaId: result?.id ?? null,
              }));
            }}
          />
        )}

        <AdminModalField label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Video title"
            className={adminInputClass}
          />
        </AdminModalField>

        <AdminModalField label="Description">
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Brief description…"
            rows={4}
            className={cn(adminInputClass, "min-h-24 rounded-[10px] py-3")}
          />
        </AdminModalField>

        <FileUploadField
          label="Custom thumbnail (optional)"
          folder="resources/videos"
          accept="image/*"
          valueUrl={thumbnailUrl}
          compact
          onUploaded={(result) => {
            setThumbnailUrl(result?.publicUrl ?? null);
            setForm((current) => ({
              ...current,
              thumbnailMediaId: result?.id ?? null,
            }));
          }}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </AdminModal>
  );
}
