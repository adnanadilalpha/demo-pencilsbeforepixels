import type { AcademicChart } from "@/lib/academic-data/types";

/** Y-axis for the device-time-at-school line chart (client-requested 400–500 range). */
export const DEVICE_TIME_CHART_Y_MIN = 400;
export const DEVICE_TIME_CHART_Y_MAX = 500;
export const DEVICE_TIME_CHART_Y_TICKS = [400, 425, 450, 475, 500] as const;

export function isDeviceTimeChart(
  chart: Pick<AcademicChart, "yLabel" | "series">,
): boolean {
  return (
    chart.yLabel === "Mean Score in Mathematics" && chart.series.length === 2
  );
}

/** Chart axis/series are code-owned; CMS may only supply a PDF link. */
export function applyDeviceTimeChartAxis<T extends AcademicChart>(chart: T): T {
  if (!isDeviceTimeChart(chart)) return chart;

  return {
    ...chart,
    yMin: DEVICE_TIME_CHART_Y_MIN,
    yMax: DEVICE_TIME_CHART_Y_MAX,
    yTicks: [...DEVICE_TIME_CHART_Y_TICKS],
  };
}
