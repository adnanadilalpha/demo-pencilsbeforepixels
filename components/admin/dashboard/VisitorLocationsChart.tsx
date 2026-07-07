"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { VisitorLocationRow } from "@/lib/admin/types";
import { formatCount } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const VisitorLocationsMap = dynamic(
  () =>
    import("@/components/admin/dashboard/VisitorLocationsMap").then(
      (module) => module.VisitorLocationsMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-navy-800/8 bg-paper-50 text-xs text-body-muted">
        Loading map…
      </div>
    ),
  },
);

type VisitorLocationsChartProps = {
  locations: VisitorLocationRow[];
};

export function VisitorLocationsChart({ locations }: VisitorLocationsChartProps) {
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const totalVisitors = locations.reduce((sum, row) => sum + row.visitors, 0);

  if (locations.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] flex-1 items-center justify-center rounded-lg border border-dashed border-paper-300 bg-paper-50/60 px-4 text-center text-xs text-body-muted">
        Location data appears when visits have a resolved city or country.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {focusKey ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFocusKey(null)}
            className="shrink-0 text-xs font-medium text-navy-800 underline-offset-2 hover:underline"
          >
            Reset view
          </button>
        </div>
      ) : (
        <div className="h-5" aria-hidden />
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <VisitorLocationsMap
          locations={locations}
          focusKey={focusKey}
          onFocusKey={setFocusKey}
        />

        <div className="flex max-h-[220px] flex-col overflow-hidden rounded-lg border border-navy-800/8">
          <div className="flex items-center justify-between border-b border-navy-800/8 bg-paper-50 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-body-muted">
            <span>Top cities</span>
            <span>{formatCount(totalVisitors)} visitors</span>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {locations.map((location) => {
              const isActive = focusKey === location.key;
              const share = Math.round((location.visitors / totalVisitors) * 100);

              return (
                <li key={location.key}>
                  <button
                    type="button"
                    onClick={() =>
                      setFocusKey(isActive ? null : location.key)
                    }
                    className={cn(
                      "flex w-full items-start justify-between gap-3 border-b border-navy-800/6 px-3 py-2.5 text-left transition-colors last:border-b-0",
                      isActive
                        ? "bg-gold-50"
                        : "bg-white hover:bg-paper-50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-navy-800">
                        {location.label}
                      </span>
                      {location.detail ? (
                        <span className="block truncate text-xs text-body-muted">
                          {location.detail}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-xs text-navy-800">
                        {formatCount(location.visitors)}
                      </span>
                      <span className="block text-[11px] text-body-muted">
                        {share}%
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
