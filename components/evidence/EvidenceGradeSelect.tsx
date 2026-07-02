"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type GradeOption = {
  value: string;
  label: string;
};

type EvidenceGradeSelectProps = {
  grades: string[];
  selectedGrades: string[];
  onChange: (grades: string[]) => void;
  disabled?: boolean;
};

export function EvidenceGradeSelect({
  grades,
  selectedGrades,
  onChange,
  disabled = false,
}: EvidenceGradeSelectProps) {
  const options: GradeOption[] = grades.map((grade) => ({
    value: grade,
    label:
      grade === "ALL" ? "All Grades" : `Grade ${parseInt(grade, 10)}`,
  }));

  const selectedCount = selectedGrades.length;
  const label =
    selectedCount === 0
      ? "Select Grades..."
      : selectedCount === grades.length
        ? "All Grades"
        : selectedCount === 1
          ? options.find((option) => option.value === selectedGrades[0])
              ?.label ?? ""
          : `${selectedCount} grades selected`;

  const toggleGrade = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedGrades, value].sort());
      return;
    }

    const next = selectedGrades.filter((entry) => entry !== value);
    onChange(next.length > 0 ? next : [value]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-4 rounded-full border border-navy-800 bg-white px-3 text-left text-xs leading-6 text-navy-800 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold-500/40 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          )}
        >
          <span className="truncate">{label}</span>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && selectedCount < grades.length && (
              <span className="flex size-5 items-center justify-center rounded-full bg-navy-500 text-[10px] font-semibold text-slate-50">
                {selectedCount}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-navy-800" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) overflow-hidden p-0">
        <div className="flex border-b border-navy-800/10">
          <button
            type="button"
            onClick={() => onChange([...grades])}
            className="flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-navy-800 hover:bg-paper-200"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => onChange([grades[0] ?? "03"])}
            className="flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-navy-800/60 hover:bg-paper-200"
          >
            Clear
          </button>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {options.map((option) => {
            const checked = selectedGrades.includes(option.value);
            return (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-paper-200">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleGrade(option.value, value === true)
                    }
                  />
                  <span className="text-sm text-navy-800">{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
