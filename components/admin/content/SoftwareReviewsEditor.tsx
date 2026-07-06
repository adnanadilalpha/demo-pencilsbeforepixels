"use client";

import type { SoftwareReview } from "@/lib/cms/types";
import { epicReviewContent } from "@/lib/cms/fallback-data";
import { formatYouTubeLinkForEditor, normalizeYouTubeUrl } from "@/lib/youtube";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import { FileUploadField } from "@/components/admin/resources/FileUploadField";

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
    <div className="mt-6 space-y-6 border-t border-navy-800/6 pt-4">
      <div>
        <p className="text-sm font-semibold text-navy-800">Epic video review</p>
        <p className="mt-1 text-xs text-body-muted">
          Shown on the homepage review section. IXL is no longer displayed on the
          public site.
        </p>
      </div>

      <div className="space-y-3 rounded-[10px] border border-navy-800/10 bg-paper-50 p-4">
        <RichTextEditor
          label="Title"
          value={epic.title}
          compact
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
          label="Summary"
          value={epic.summary ?? ""}
          multiline
          onChange={(value) => updateEpic({ summary: value })}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-navy-800">Audio clip</p>
        <p className="mt-1 text-xs text-body-muted">
          Featured audio player below the video review on the homepage. Clip title
          is shown as the audio section heading, e.g. &quot;Reading on Screens&quot;.
        </p>
      </div>

      <div className="space-y-3 rounded-[10px] border border-navy-800/10 bg-paper-50 p-4">
        <RichTextEditor
          label="Clip title"
          value={epic.audioTitle ?? epicReviewContent.audioTitle}
          placeholder={epicReviewContent.audioTitle}
          compact
          onChange={(value) => updateEpic({ audioTitle: value })}
        />

        <div className="max-w-xl">
          <FileUploadField
            label="Audio file"
            folder="audio"
            accept="audio/*"
            valueUrl={epic.audioSrc ?? null}
            compact
            onUploaded={(result) =>
              updateEpic({ audioSrc: result?.publicUrl ?? "" })
            }
          />
          <p className="mt-1.5 text-xs text-body-muted">
            Upload an MP3 or other audio file. You can also paste a public path
            below if the file is already hosted.
          </p>
          <input
            className={`${adminInputClass} mt-2`}
            value={epic.audioSrc ?? ""}
            placeholder="/audio/Media1.mp3"
            onChange={(event) => updateEpic({ audioSrc: event.target.value })}
          />
        </div>

        <Field
          label="About this clip"
          hint='Shown inside the audio card beside the player. If left empty, the video "Summary" is used instead.'
          value={epic.audioDescription ?? ""}
          multiline
          placeholder="Describe what listeners will hear in this audio clip…"
          onChange={(value) => updateEpic({ audioDescription: value })}
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
      {multiline ? (
        <>
          {hint ? <p className="text-xs text-body-muted">{hint}</p> : null}
          <RichTextEditor
            label={label}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
          />
        </>
      ) : (
        <>
          <label className={adminLabelClass}>{label}</label>
          {hint ? <p className="text-xs text-body-muted">{hint}</p> : null}
          <input
          className={adminInputClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        />
        </>
      )}
    </div>
  );
}
