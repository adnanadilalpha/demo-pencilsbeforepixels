export type AcademicLineChartLayoutOptions = {
  decimalTicks?: boolean;
  legendCount?: number;
};

export type AcademicLineChartLayout = {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  plotWidth: number;
  plotHeight: number;
  plotInset: number;
  dataPlotLeft: number;
  dataPlotWidth: number;
  categoryStep: number;
  categorySkip: number;
  categoryBandHeight: number;
};

/** Room for marker radius + stroke so end points are not clipped. */
export const ACADEMIC_CHART_PLOT_INSET = 8;

export function getAcademicLineChartLayout(
  width: number,
  height: number,
  categoryCount: number,
  options: AcademicLineChartLayoutOptions = {},
): AcademicLineChartLayout {
  const { decimalTicks = false } = options;
  const tight = width < 420;
  const plotInset = ACADEMIC_CHART_PLOT_INSET;

  let categorySkip = 1;
  if (tight && categoryCount > 4) categorySkip = 2;
  if (width < 340 && categoryCount > 3) categorySkip = 2;

  const left = decimalTicks
    ? tight
      ? 48
      : 56
    : tight
      ? 40
      : width < 640
        ? 48
        : 52;
  const right = tight ? 20 : 28;
  const top = 22;
  const bottom = 12;

  const plotWidth = Math.max(width - left - right, 0);
  const plotHeight = Math.max(height - top - bottom, 0);
  const dataPlotLeft = left + plotInset;
  const dataPlotWidth = Math.max(plotWidth - plotInset * 2, 0);
  const categoryStep =
    categoryCount > 1 ? dataPlotWidth / (categoryCount - 1) : dataPlotWidth;

  const categoryBandHeight = tight ? 26 : 28;

  return {
    padding: { top, right, bottom, left },
    plotWidth,
    plotHeight,
    plotInset,
    dataPlotLeft,
    dataPlotWidth,
    categoryStep,
    categorySkip,
    categoryBandHeight,
  };
}

export function shouldRenderCategory(
  index: number,
  total: number,
  skip: number,
): boolean {
  if (skip <= 1) return true;
  if (index === 0 || index === total - 1) return true;
  return index % skip === 0;
}

export function formatChartTick(value: number, decimalTicks: boolean): string {
  if (!decimalTicks) return String(value);

  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function getCategoryLabelStyle(
  index: number,
  total: number,
): { left?: string; right?: string; className: string } {
  if (total <= 1) {
    return {
      left: "50%",
      className: "-translate-x-1/2 text-center",
    };
  }

  if (index === 0) {
    return { left: "0", className: "text-left" };
  }

  if (index === total - 1) {
    return { right: "0", className: "text-right" };
  }

  const leftPercent = (index / (total - 1)) * 100;
  return {
    left: `${leftPercent}%`,
    className: "-translate-x-1/2 text-center",
  };
}
