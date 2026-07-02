"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type EvidenceShowLinesSelectProps = {
  showState: boolean;
  showDistrictAvg: boolean;
  onToggleState: () => void;
  onToggleDistrictAvg: () => void;
};

export function EvidenceShowLinesSelect({
  showState,
  showDistrictAvg,
  onToggleState,
  onToggleDistrictAvg,
}: EvidenceShowLinesSelectProps) {
  const activeCount = (showState ? 1 : 0) + (showDistrictAvg ? 1 : 0);
  const label =
    activeCount === 0
      ? "None"
      : activeCount === 2
        ? "State + District"
        : showState
          ? "State Avg"
          : "District Avg";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
        className="flex h-10 w-full min-w-0 items-center justify-between gap-4 rounded-full border border-navy-800 bg-white px-3 text-left text-xs leading-6 text-navy-800 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold-500/40 sm:text-sm"
        >
          <span className="truncate">{label}</span>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-navy-500 text-[10px] font-semibold text-slate-50">
                {activeCount}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-navy-800" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 overflow-hidden p-0">
        <button
          type="button"
          onClick={onToggleState}
          className="flex w-full items-center gap-3 border-b border-navy-800/10 px-4 py-3 text-left hover:bg-paper-200"
        >
          <Checkbox checked={showState} />
          <div className="flex items-center gap-2">
            <svg width="26" height="10" aria-hidden>
              <line
                x1="0"
                y1="5"
                x2="26"
                y2="5"
                stroke="#b91c1c"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
            </svg>
            <span className="text-sm text-navy-800">State Average</span>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggleDistrictAvg}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-200"
        >
          <Checkbox checked={showDistrictAvg} />
          <div className="flex items-center gap-2">
            <svg width="26" height="10" aria-hidden>
              <line
                x1="0"
                y1="5"
                x2="26"
                y2="5"
                stroke="#1e40af"
                strokeWidth="2.5"
              />
              <circle cx="13" cy="5" r="2.5" fill="#1e40af" />
            </svg>
            <span className="text-sm text-navy-800">District 66 Avg</span>
          </div>
        </button>
      </PopoverContent>
    </Popover>
  );
}
