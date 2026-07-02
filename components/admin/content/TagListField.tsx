"use client";

import { adminLabelClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

type TagListFieldProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
};

const tagInputClass = cn(
  "h-9 w-full rounded-lg border border-navy-800/10 bg-white px-3 text-sm text-navy-800",
  "placeholder:text-body-muted/70",
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/15",
);

export function TagListField({ label, value, onChange }: TagListFieldProps) {
  const updateItem = (index: number, next: string) => {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  return (
    <div className="flex max-w-3xl flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>

      {value.length === 0 ? (
        <p className="text-xs text-body-muted">No items configured.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((item, index) => (
            <input
              key={index}
              className={tagInputClass}
              value={item}
              aria-label={`${label} ${index + 1}`}
              onChange={(event) => updateItem(index, event.target.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
