"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { WHAT_TO_DO_FINDINGS_COUNT } from "@/lib/cms/goal-section-content";
import { cn } from "@/lib/utils";

type WhatToDoFindingsEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function WhatToDoFindingsEditor({
  value,
  onChange,
}: WhatToDoFindingsEditorProps) {
  const items = Array.from(
    { length: WHAT_TO_DO_FINDINGS_COUNT },
    (_, index) => value[index] ?? "",
  );

  const updateItem = (index: number, next: string) => {
    onChange(
      Array.from({ length: WHAT_TO_DO_FINDINGS_COUNT }, (_, itemIndex) =>
        itemIndex === index ? next : (items[itemIndex] ?? ""),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={adminLabelClass}>Bullet points (10 items)</label>
        <p className="mt-1 text-sm text-body-muted">
          One bullet point per field. Put the headline stat first, then an em
          dash, then the supporting detail.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-800/70">
              Bullet point {index + 1}
            </label>
            <textarea
              className={cn(adminInputClass, "min-h-[6rem] resize-y rounded-[10px] py-3")}
              value={item}
              aria-label={`Bullet point ${index + 1}`}
              placeholder="−1.45 pts/yr — National decline in Grade 4 NAEP math scores…"
              onChange={(event) => updateItem(index, event.target.value)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
