"use client";

import type { MentalHealthLegendItem } from "@/lib/admin/cms-entity-types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";

type MentalHealthLegendEditorProps = {
  value: MentalHealthLegendItem[];
  onChange: (value: MentalHealthLegendItem[]) => void;
};

export function MentalHealthLegendEditor({
  value,
  onChange,
}: MentalHealthLegendEditorProps) {
  const updateItem = (index: number, patch: Partial<MentalHealthLegendItem>) => {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="mt-4 space-y-2">
      <label className={adminLabelClass}>Chart legend</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg border border-navy-800/10 bg-paper-50 p-2"
          >
            <input
              type="color"
              value={item.color}
              onChange={(event) => updateItem(index, { color: event.target.value })}
              className="size-9 shrink-0 cursor-pointer rounded border border-navy-800/10 bg-white"
              aria-label={`${item.label} color`}
            />
            <input
              className={`${adminInputClass} h-9 min-w-0 flex-1 border-navy-800/12 bg-white`}
              value={item.label}
              onChange={(event) => updateItem(index, { label: event.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
