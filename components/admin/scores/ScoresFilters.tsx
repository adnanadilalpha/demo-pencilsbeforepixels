"use client";

import { Search } from "lucide-react";
import { adminInputClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

type ScoresFiltersProps = {
  schoolYears: string[];
  levels: string[];
  schoolYear: string;
  level: string;
  districtId: string;
  search: string;
  latestOnly: boolean;
  onSchoolYearChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onDistrictIdChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onLatestOnlyChange: (value: boolean) => void;
};

export function ScoresFilters({
  schoolYears,
  levels,
  schoolYear,
  level,
  districtId,
  search,
  latestOnly,
  onSchoolYearChange,
  onLevelChange,
  onDistrictIdChange,
  onSearchChange,
  onLatestOnlyChange,
}: ScoresFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-navy-800/8 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
            School year
          </span>
          <select
            value={schoolYear}
            onChange={(event) => onSchoolYearChange(event.target.value)}
            className={cn(adminInputClass, "h-10 rounded-[10px]")}
          >
            <option value="">All years</option>
            {schoolYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
            Level
          </span>
          <select
            value={level}
            onChange={(event) => onLevelChange(event.target.value)}
            className={cn(adminInputClass, "h-10 rounded-[10px]")}
          >
            <option value="">All levels</option>
            {levels.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
            District ID
          </span>
          <input
            value={districtId}
            onChange={(event) => onDistrictIdChange(event.target.value)}
            placeholder="e.g. 66"
            className={cn(adminInputClass, "h-10 rounded-[10px]")}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
            Agency search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-body-muted" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search agency name"
              className={cn(adminInputClass, "h-10 rounded-[10px] pl-9")}
            />
          </div>
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-navy-800">
        <input
          type="checkbox"
          checked={latestOnly}
          onChange={(event) => onLatestOnlyChange(event.target.checked)}
          className="size-4 rounded border-navy-800/20 text-navy-800 focus:ring-gold-500/40"
        />
        Show only rows from the latest upload
      </label>
    </div>
  );
}
