"use client";

import type { TimelineSlide } from "@/lib/cms/types";
import {
  MISSION_SLIDE_COUNT,
  MISSION_SLIDE_LABELS,
} from "@/lib/cms/mission-slides";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";

type TimelineEditorProps = {
  slides: TimelineSlide[];
  onChange: (slides: TimelineSlide[]) => void;
};

export function TimelineEditor({ slides, onChange }: TimelineEditorProps) {
  const missionSlides = slides.slice(0, MISSION_SLIDE_COUNT);

  const updateSlide = (index: number, patch: Partial<TimelineSlide>) => {
    onChange(
      missionSlides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {missionSlides.map((slide, index) => (
        <div
          key={`${slide.number}-${index}`}
          className="rounded-[10px] border border-navy-800/10 bg-paper-50 p-4"
        >
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-sm font-semibold text-navy-800">
                {MISSION_SLIDE_LABELS[index] ?? `Slide ${index + 1}`}
              </p>
              <Field
                label="Number"
                value={slide.number}
                onChange={(value) => updateSlide(index, { number: value })}
              />
              <Field
                label="Title"
                value={slide.title}
                onChange={(value) => updateSlide(index, { title: value })}
              />
              <div className="flex flex-col gap-1.5">
                <label className={adminLabelClass}>Description</label>
                <textarea
                  className={`${adminInputClass} min-h-20 rounded-[10px] py-3`}
                  value={slide.description}
                  onChange={(event) =>
                    updateSlide(index, { description: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="min-w-0 lg:sticky lg:top-0">
              <MediaField
                label="Slide image"
                value={slide.image}
                folder="timeline"
                filename={`mission-slide-${slide.number || index + 1}.jpg`}
                altText={slide.title}
                onChange={(url) => updateSlide(index, { image: url })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <input
        className={adminInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
