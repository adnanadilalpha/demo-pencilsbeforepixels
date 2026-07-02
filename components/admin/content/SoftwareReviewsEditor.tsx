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
  const updateReview = (slug: "epic" | "ixl", patch: Partial<SoftwareReview>) => {
    onChange(
      reviews.map((review) =>
        review.slug === slug ? { ...review, ...patch } : review,
      ),
    );
  };

  const updateNote = (
    slug: "epic" | "ixl",
    key: "vendorResearch" | "independentResearch",
    field: "label" | "summary" | "note",
    value: string,
  ) => {
    const review = reviews.find((item) => item.slug === slug);
    if (!review) return;

    const current = review[key] ?? { label: "", summary: "", note: "" };
    updateReview(slug, {
      [key]: { ...current, [field]: value },
    });
  };

  const epic = reviews.find((review) => review.slug === "epic");
  const ixl = reviews.find((review) => review.slug === "ixl");

  if (!epic || !ixl) return null;

  return (
    <div className="mt-6 space-y-4 border-t border-navy-800/6 pt-4">
      <p className="text-sm font-semibold text-navy-800">Software reviews</p>

      <ReviewCard title="IXL Math">
        <Field
          label="Title"
          value={ixl.title}
          onChange={(value) => updateReview("ixl", { title: value })}
        />
        <NoteFields
          label="Vendor research"
          note={ixl.vendorResearch}
          onChange={(field, value) =>
            updateNote("ixl", "vendorResearch", field, value)
          }
        />
        <NoteFields
          label="Independent research"
          note={ixl.independentResearch}
          onChange={(field, value) =>
            updateNote("ixl", "independentResearch", field, value)
          }
        />
        <Field
          label="References note"
          value={ixl.referencesNote ?? ""}
          multiline
          onChange={(value) => updateReview("ixl", { referencesNote: value })}
        />
      </ReviewCard>

      <ReviewCard title="Epic">
        <Field
          label="Title"
          value={epic.title}
          onChange={(value) => updateReview("epic", { title: value })}
        />
        <div className="max-w-xl">
          <Field
            label="Video link"
            hint="Paste the full YouTube URL (not just the video ID)."
            value={formatYouTubeLinkForEditor(epic.youtubeId)}
            placeholder="https://www.youtube.com/watch?v=..."
            onChange={(value) => updateReview("epic", { youtubeId: value })}
            onBlur={(value) =>
              updateReview("epic", {
                youtubeId: value.trim() ? normalizeYouTubeUrl(value) : "",
              })
            }
          />
        </div>
        <Field
          label="Summary"
          value={epic.summary ?? ""}
          multiline
          onChange={(value) => updateReview("epic", { summary: value })}
        />
      </ReviewCard>
    </div>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-[10px] border border-navy-800/10 bg-paper-50 p-4">
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      {children}
    </div>
  );
}

function NoteFields({
  label,
  note,
  onChange,
}: {
  label: string;
  note?: { label: string; summary: string; note: string };
  onChange: (field: "label" | "summary" | "note", value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-[8px] border border-navy-800/8 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-body-muted">
        {label}
      </p>
      <Field
        label="Label"
        value={note?.label ?? ""}
        onChange={(value) => onChange("label", value)}
      />
      <Field
        label="Summary"
        value={note?.summary ?? ""}
        multiline
        onChange={(value) => onChange("summary", value)}
      />
      <Field
        label="Note"
        value={note?.note ?? ""}
        multiline
        onChange={(value) => onChange("note", value)}
      />
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
