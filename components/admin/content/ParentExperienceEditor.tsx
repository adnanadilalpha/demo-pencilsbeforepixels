"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import {
  PARENT_EXPERIENCE_MOMENT_COUNT,
  type ParentExperienceContent,
  type ParentExperienceMoment,
} from "@/lib/cms/parent-experience-content";
import { cn } from "@/lib/utils";

type ParentExperienceEditorProps = {
  value: ParentExperienceContent;
  onChange: (value: ParentExperienceContent) => void;
};

export function ParentExperienceEditor({
  value,
  onChange,
}: ParentExperienceEditorProps) {
  const moments = Array.from(
    { length: PARENT_EXPERIENCE_MOMENT_COUNT },
    (_, index) =>
      value.moments[index] ?? {
        number: String(index + 1).padStart(2, "0"),
        title: "",
        body: "",
      },
  );

  const updateMoment = (
    index: number,
    patch: Partial<ParentExperienceMoment>,
  ) => {
    onChange({
      ...value,
      moments: moments.map((moment, momentIndex) =>
        momentIndex === index ? { ...moment, ...patch } : moment,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={adminLabelClass}>Story beats</label>
        <p className="mt-1 text-sm text-body-muted">
          Three short moments shown like the Device Opt Out steps, beside the
          parent portrait.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {moments.map((moment, index) => (
          <li
            key={moment.number || index}
            className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-body-muted">
                Moment {index + 1}
              </span>
              <input
                type="text"
                value={moment.number}
                onChange={(event) =>
                  updateMoment(index, { number: event.target.value })
                }
                className={cn(adminInputClass, "h-9 w-20 rounded-[10px] px-3")}
                aria-label={`Moment ${index + 1} number`}
              />
            </div>
            <div className="flex flex-col gap-3">
              <RichTextEditor
                label="Title (optional)"
                value={moment.title}
                compact
                onChange={(next) => updateMoment(index, { title: next })}
              />
              <RichTextEditor
                label="Body"
                value={moment.body}
                onChange={(next) => updateMoment(index, { body: next })}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
