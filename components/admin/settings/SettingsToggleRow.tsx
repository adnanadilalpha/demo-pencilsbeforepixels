"use client";

import { cn } from "@/lib/utils";

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
  className,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy-800">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-body-muted">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
          checked ? "bg-navy-800" : "bg-[#d1d5db]",
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
