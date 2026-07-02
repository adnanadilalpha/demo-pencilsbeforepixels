"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";

type StringListFieldProps = {
  label: string;
  value: string[];
  placeholder?: string;
  onChange: (value: string[]) => void;
};

export function StringListField({
  label,
  value,
  placeholder,
  onChange,
}: StringListFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <textarea
        className={`${adminInputClass} min-h-28 resize-y rounded-[10px] py-3`}
        value={value.join("\n")}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </div>
  );
}
