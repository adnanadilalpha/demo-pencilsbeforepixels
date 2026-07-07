"use client";

import { Plus, Trash2 } from "lucide-react";
import type { TimelineSlide } from "@/lib/cms/types";
import {
  canAddMissionSlide,
  canRemoveMissionSlide,
  createEmptyMissionSlide,
  normalizeMissionTimeline,
  renumberMissionSlides,
  resolveTimelineBackgroundOption,
  TIMELINE_BACKGROUND_OPTIONS,
} from "@/lib/cms/mission-slides";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { cn } from "@/lib/utils";

type TimelineEditorProps = {
  slides: TimelineSlide[];
  onChange: (slides: TimelineSlide[]) => void;
};

export function TimelineEditor({ slides, onChange }: TimelineEditorProps) {
  const missionSlides = normalizeMissionTimeline(slides);

  const updateSlides = (next: TimelineSlide[]) => {
    onChange(normalizeMissionTimeline(renumberMissionSlides(next)));
  };

  const updateSlide = (index: number, patch: Partial<TimelineSlide>) => {
    updateSlides(
      missionSlides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    );
  };

  const addSlide = () => {
    if (!canAddMissionSlide(missionSlides)) return;
    updateSlides([...missionSlides, createEmptyMissionSlide(missionSlides.length)]);
  };

  const removeSlide = (index: number) => {
    if (!canRemoveMissionSlide(missionSlides)) return;
    updateSlides(missionSlides.filter((_, slideIndex) => slideIndex !== index));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-body-muted">
        Add, remove, and reorder mission slides. Pick a background from the
        design system — text color adjusts automatically for contrast.
      </p>

      {missionSlides.map((slide, index) => (
        <div
          key={`mission-slide-${index}`}
          className="rounded-[10px] border border-navy-800/10 bg-paper-50 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-navy-800">
              {slide.era.trim() || `Slide ${index + 1}`}
            </p>
            {canRemoveMissionSlide(missionSlides) ? (
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                aria-label={`Remove slide ${index + 1}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
            <div className="flex min-w-0 flex-col gap-3">
              <Field
                label="Slide label"
                value={slide.era}
                onChange={(value) => updateSlide(index, { era: value })}
                placeholder="The Problem"
              />
              <Field
                label="Number"
                value={slide.number}
                onChange={(value) => updateSlide(index, { number: value })}
              />
              <RichTextEditor
                label="Title"
                value={slide.title}
                compact
                onChange={(value) => updateSlide(index, { title: value })}
              />
              <RichTextEditor
                label="Description"
                value={slide.description}
                onChange={(value) => updateSlide(index, { description: value })}
              />
              <BackgroundPicker
                value={slide.background}
                onChange={(background, textColor) =>
                  updateSlide(index, { background, textColor })
                }
              />
            </div>

            <div className="min-w-0 lg:sticky lg:top-0">
              <MediaField
                label="Slide image"
                value={slide.image}
                folder="timeline"
                filename={`mission-slide-${slide.number || index + 1}.jpg`}
                altText={stripRichTextToPlain(slide.title)}
                onChange={(url) => updateSlide(index, { image: url })}
              />
            </div>
          </div>
        </div>
      ))}

      {canAddMissionSlide(missionSlides) ? (
        <button
          type="button"
          onClick={addSlide}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-200/60"
        >
          <Plus className="size-4" aria-hidden />
          Add slide
        </button>
      ) : null}
    </div>
  );
}

function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (background: string, textColor: "light" | "dark") => void;
}) {
  const selected =
    resolveTimelineBackgroundOption(value) ??
    TIMELINE_BACKGROUND_OPTIONS.find((option) => option.swatch === value);

  return (
    <div className="flex flex-col gap-2">
      <label className={adminLabelClass}>Background</label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
        {TIMELINE_BACKGROUND_OPTIONS.map((option) => {
          const isSelected = selected?.id === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.value, option.textColor)}
              className={cn(
                "flex items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left transition-colors",
                isSelected
                  ? "border-navy-800 bg-white ring-1 ring-navy-800/15"
                  : "border-navy-800/10 bg-white hover:border-navy-800/25",
              )}
              aria-pressed={isSelected}
            >
              <span
                className="size-6 shrink-0 rounded-full border border-navy-800/10"
                style={{ backgroundColor: option.swatch }}
                aria-hidden
              />
              <span className="min-w-0 text-xs font-medium leading-tight text-navy-800">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <p className="text-xs text-body-muted">
          Text color: {selected.textColor === "light" ? "Light" : "Dark"}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <input
        className={adminInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
