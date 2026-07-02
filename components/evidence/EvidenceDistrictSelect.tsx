"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DistrictOption } from "@/lib/evidence/types";
import { cn, formatDistrictLabel } from "@/lib/utils";

type EvidenceDistrictSelectProps = {
  districts: DistrictOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  compactLabels?: boolean;
};

export function EvidenceDistrictSelect({
  districts,
  selectedIds,
  onChange,
  disabled = false,
  placeholder = "Select Districts...",
  compactLabels = false,
}: EvidenceDistrictSelectProps) {
  const selectedCount = selectedIds.length;
  const label =
    selectedCount === 0
      ? placeholder
      : `${selectedCount} district${selectedCount === 1 ? "" : "s"} selected`;

  const toggleDistrict = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
      return;
    }
    onChange(selectedIds.filter((entry) => entry !== id));
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
          <ChevronDown className="size-4 shrink-0 text-navy-800" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-h-72 w-(--radix-popover-trigger-width) overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {districts.map((district) => {
            const checked = selectedIds.includes(district.id);
            return (
              <li key={district.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-paper-200">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleDistrict(district.id, value === true)
                    }
                  />
                  <span
                    className="size-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: district.color }}
                    aria-hidden
                  />
                  <span className="truncate text-sm text-navy-800">
                    {compactLabels
                      ? district.name
                      : formatDistrictLabel(district.name)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function EvidenceDistrictList({
  districts,
  onRemove,
  compactLabels = false,
}: {
  districts: DistrictOption[];
  onRemove?: (id: string) => void;
  compactLabels?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {districts.map((district) => (
        <li key={district.id} className="flex items-center gap-3">
          <span
            className="size-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: district.color }}
            aria-hidden
          />
          <span className="flex-1 text-base leading-4 text-[#18263a]/70 uppercase">
            {compactLabels ? district.name : formatDistrictLabel(district.name)}
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(district.id)}
              className="text-navy-800/40 hover:text-navy-800"
              aria-label={`Remove ${district.name}`}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
