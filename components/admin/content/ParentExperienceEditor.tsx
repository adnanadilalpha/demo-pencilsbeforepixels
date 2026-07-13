"use client";

import {
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import type {
  ParentExperienceContent,
  ParentExperienceMoment,
} from "@/lib/cms/parent-experience-content";

type ParentExperienceEditorProps = {
  value: ParentExperienceContent;
  onChange: (value: ParentExperienceContent) => void;
};

export function ParentExperienceEditor({
  value,
  onChange,
}: ParentExperienceEditorProps) {
  const moment: ParentExperienceMoment = value.moments[0] ?? {
    number: "",
    title: "",
    body: "",
  };

  const updateMoment = (patch: Partial<ParentExperienceMoment>) => {
    onChange({
      ...value,
      moments: [
        {
          number: "",
          title: moment.title,
          body: moment.body,
          ...patch,
        },
      ],
    });
  };

  return (
    <div className="mt-6 flex flex-col gap-5 border-t border-navy-800/6 pt-4">
      <div>
        <label className={adminLabelClass}>Letter body</label>
        <p className="mt-1 text-sm text-body-muted">
          Main letter text after the intro/lead. Renders as continuous prose —
          no numbers.
        </p>
      </div>

      <RichTextEditor
        label="Letter"
        value={moment.body}
        onChange={(next) => updateMoment({ body: next })}
      />

      <div>
        <label htmlFor="parent-experience-closing" className={adminLabelClass}>
          Closing line
        </label>
        <input
          id="parent-experience-closing"
          type="text"
          value={value.closing}
          onChange={(event) =>
            onChange({ ...value, closing: event.target.value })
          }
          className={`${adminInputClass} mt-1.5`}
          placeholder="Things are changing!"
        />
      </div>

      <div>
        <label htmlFor="parent-experience-author" className={adminLabelClass}>
          Author name
        </label>
        <input
          id="parent-experience-author"
          type="text"
          value={value.authorName}
          onChange={(event) =>
            onChange({ ...value, authorName: event.target.value })
          }
          className={`${adminInputClass} mt-1.5`}
          placeholder="JPB"
        />
      </div>
    </div>
  );
}
