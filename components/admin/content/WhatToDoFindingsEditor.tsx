"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import {
  WHAT_TO_DO_FINDINGS_COUNT,
  type GoalFinding,
} from "@/lib/cms/goal-section-content";

type WhatToDoFindingsEditorProps = {
  value: GoalFinding[];
  onChange: (value: GoalFinding[]) => void;
};

export function WhatToDoFindingsEditor({
  value,
  onChange,
}: WhatToDoFindingsEditorProps) {
  const items = Array.from(
    { length: WHAT_TO_DO_FINDINGS_COUNT },
    (_, index) => value[index] ?? { headline: "", body: "" },
  );

  const updateItem = (
    index: number,
    field: keyof GoalFinding,
    next: string,
  ) => {
    onChange(
      Array.from({ length: WHAT_TO_DO_FINDINGS_COUNT }, (_, itemIndex) =>
        itemIndex === index
          ? { ...items[itemIndex], [field]: next }
          : (items[itemIndex] ?? { headline: "", body: "" }),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={adminLabelClass}>
          {WHAT_TO_DO_FINDINGS_COUNT} Facts ({WHAT_TO_DO_FINDINGS_COUNT} items)
        </label>
        <p className="mt-1 text-sm text-body-muted">
          Edit the bold headline and body copy for each fact separately.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4 sm:p-5"
          >
            <p className="mb-3 text-sm font-semibold text-navy-800">
              Fact {index + 1}
            </p>

            <div className="flex flex-col gap-3">
              <RichTextEditor
                label="Headline"
                value={item.headline}
                placeholder="−1.45 pts/yr"
                compact
                onChange={(value) => updateItem(index, "headline", value)}
              />

              <RichTextEditor
                label="Body copy"
                value={item.body}
                placeholder="National decline in Grade 4 NAEP math scores since classroom devices scaled up widely across U.S. schools."
                onChange={(value) => updateItem(index, "body", value)}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
