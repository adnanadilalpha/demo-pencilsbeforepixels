"use client";

import { cn } from "@/lib/utils";

type ToggleFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function ToggleField({ checked, onChange, label }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between border-t border-navy-800/6 pt-4">
      <span className="text-sm font-medium text-navy-800">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
          checked ? "bg-navy-800" : "bg-navy-800/20",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-200",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
