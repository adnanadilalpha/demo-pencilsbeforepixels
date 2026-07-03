"use client";

import type { SoftwareReview } from "@/lib/cms/types";
import { formatYouTubeLinkForEditor, normalizeYouTubeUrl } from "@/lib/youtube";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";

type SoftwareReviewsEditorProps = {
  reviews: SoftwareReview[];
  onChange: (reviews: SoftwareReview[]) => void;
};

export function SoftwareReviewsEditor({
  reviews,
  onChange,
}: SoftwareReviewsEditorProps) {
  const epic = reviews.find((review) => review.slug === "epic");

  const updateEpic = (patch: Partial<SoftwareReview>) => {
    if (!epic) return;
    onChange(
      reviews.map((review) =>
        review.slug === "epic" ? { ...review, ...patch } : review,
      ),
    );
  };

  if (!epic) return null;

  return (
    <div className="mt-6 space-y-4 border-t border-navy-800/6 pt-4">
      <div>
        <p className="text-sm font-semibold text-navy-800">Epic video review</p>
        <p className="mt-1 text-xs text-body-muted">
          Shown on the homepage review section. IXL is no longer displayed on the
          public site.
        </p>
      </div>

      <div className="space-y-3 rounded-[10px] border border-navy-800/10 bg-paper-50 p-4">
        <Field
          label="Title"
          value={epic.title}
          onChange={(value) => updateEpic({ title: value })}
        />
        <div className="max-w-xl">
          <Field
            label="Video link"
            hint="Paste the full YouTube URL (not just the video ID)."
            value={formatYouTubeLinkForEditor(epic.youtubeId)}
            placeholder="https://www.youtube.com/watch?v=..."
            onChange={(value) => updateEpic({ youtubeId: value })}
            onBlur={(value) =>
              updateEpic({
                youtubeId: value.trim() ? normalizeYouTubeUrl(value) : "",
              })
            }
          />
        </div>
        <Field
          label="Audio file path"
          hint="Public path to the MP3, e.g. /audio/Media1.mp3"
          value={epic.audioSrc ?? ""}
          placeholder="/audio/Media1.mp3"
          onChange={(value) => updateEpic({ audioSrc: value })}
        />
        <Field
          label="Summary"
          value={epic.summary ?? ""}
          multiline
          onChange={(value) => updateEpic({ summary: value })}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline = false,
  placeholder,
  hint,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      {hint ? <p className="text-xs text-body-muted">{hint}</p> : null}
      {multiline ? (
        <textarea
          className={`${adminInputClass} min-h-20 rounded-[10px] py-3`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        />
      ) : (
        <input
          className={adminInputClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        />
      )}
    </div>
  );
}
