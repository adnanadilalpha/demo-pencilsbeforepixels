"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import {
  WHAT_TO_DO_FINDINGS_COUNT,
  type GoalFinding,
} from "@/lib/cms/goal-section-content";
import { cn } from "@/lib/utils";

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
        <label className={adminLabelClass}>10 Facts (10 items)</label>
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
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`goal-finding-headline-${index}`}
                  className="text-sm font-medium text-navy-800/70"
                >
                  Headline
                </label>
                <input
                  id={`goal-finding-headline-${index}`}
                  className={adminInputClass}
                  value={item.headline}
                  placeholder="−1.45 pts/yr"
                  onChange={(event) =>
                    updateItem(index, "headline", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`goal-finding-body-${index}`}
                  className="text-sm font-medium text-navy-800/70"
                >
                  Body copy
                </label>
                <textarea
                  id={`goal-finding-body-${index}`}
                  className={cn(
                    adminInputClass,
                    "min-h-[5.5rem] resize-y rounded-[10px] py-3",
                  )}
                  value={item.body}
                  placeholder="National decline in Grade 4 NAEP math scores since classroom devices scaled up widely across U.S. schools."
                  onChange={(event) =>
                    updateItem(index, "body", event.target.value)
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
