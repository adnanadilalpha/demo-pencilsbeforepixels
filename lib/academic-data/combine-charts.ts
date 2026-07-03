import type { AcademicChart, ChartSeries } from "@/lib/academic-data/types";

const COMBINED_SERIES_COLORS = ["#F4C542", "#FFFFFF", "#7FA3CC", "#CBD5E1"];

function buildCombinedTicks(values: number[]): number[] {
  if (!values.length) return [0, 0, 0, 0];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max <= 1 && min >= -1) {
    const padding = 0.02;
    const floor = Math.round((min - padding) * 100) / 100;
    const ceil = Math.round((max + padding) * 100) / 100;
    const step = (ceil - floor) / 3;

    return [
      floor,
      Math.round((floor + step) * 100) / 100,
      Math.round((floor + step * 2) * 100) / 100,
      ceil,
    ];
  }

  const padding = Math.max(4, (max - min) * 0.08);
  const floor = Math.floor(min - padding);
  const ceil = Math.ceil(max + padding);
  const step = (ceil - floor) / 3;

  return [
    Math.round(floor),
    Math.round(floor + step),
    Math.round(floor + step * 2),
    Math.round(ceil),
  ];
}

function sharesSameTicks(charts: AcademicChart[]): boolean {
  const [first] = charts;
  if (!first) return false;

  return charts.every(
    (chart) =>
      chart.yTicks.length === first.yTicks.length &&
      chart.yTicks.every((tick, index) => tick === first.yTicks[index]),
  );
}

export function combineAcademicCharts(charts: AcademicChart[]): AcademicChart | null {
  if (!charts.length) return null;
  if (charts.length === 1) return charts[0];

  const canCombine = charts.every((chart) => chart.series.length === 1);
  if (!canCombine) return null;

  const base = charts[0];
  const categories = charts.reduce(
    (longest, chart) =>
      chart.categories.length > longest.length ? chart.categories : longest,
    base.categories,
  );

  const allValues = charts.flatMap((chart) =>
    chart.series.flatMap((series) => series.values),
  );

  let colorIndex = 0;
  const series: ChartSeries[] = charts.flatMap((chart) =>
    chart.series.map((entry) => ({
      ...entry,
      label: chart.title || entry.label,
      color:
        entry.color.toLowerCase() === "#ffffff" ||
        entry.color.toLowerCase() === "#000000"
          ? COMBINED_SERIES_COLORS[
              colorIndex++ % COMBINED_SERIES_COLORS.length
            ]
          : entry.color,
    })),
  );

  return {
    title: "",
    yLabel: base.yLabel,
    xLabel: base.xLabel,
    categories,
    yTicks: sharesSameTicks(charts) ? base.yTicks : buildCombinedTicks(allValues),
    series,
  };
}
