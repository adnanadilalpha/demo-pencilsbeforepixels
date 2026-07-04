"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChartSeries } from "@/lib/academic-data/types";

export function useChartSeriesVisibility(series: ChartSeries[]) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleSeries = useCallback((label: string) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const isSeriesVisible = useCallback(
    (label: string) => !hiddenSeries.has(label),
    [hiddenSeries],
  );

  const visibleSeries = useMemo(
    () => series.filter((entry) => isSeriesVisible(entry.label)),
    [isSeriesVisible, series],
  );

  return {
    hiddenSeries,
    toggleSeries,
    isSeriesVisible,
    visibleSeries,
  };
}
