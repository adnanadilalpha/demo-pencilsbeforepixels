/** Shared SVG layout: plot area above, x-axis tick band, then x-axis label. */
export const CHART_MARGIN = {
  top: 16,
  right: 24,
  left: 64,
  /** Dedicated row for year / category labels below the plot */
  tickBand: 48,
  xLabel: 18,
} as const;

/** Roomier margins for the Evidence research tab. */
export const CHART_RESEARCH_MARGIN = {
  top: 32,
  right: 24,
  left: 68,
  tickBand: 76,
  xLabel: 28,
} as const;

/** Tighter margins for research charts on mobile and tablet. */
export const CHART_RESEARCH_MARGIN_COMPACT = {
  top: 24,
  right: 18,
  left: 44,
  tickBand: 58,
  xLabel: 20,
} as const;

/** Horizontal inset so end points and x labels are not clipped. */
export const CHART_PLOT_INSET = 8;

export type ChartMargin = {
  top: number;
  right: number;
  left: number;
  tickBand: number;
  xLabel: number;
};

export type ChartLayout = {
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
  plotWidth: number;
  plotHeight: number;
  tickY: number;
  xLabelY: number;
  yAxisLabelY: number;
  crosshairBottom: number;
};

export function getChartLayout(
  width: number,
  height: number,
  margin: ChartMargin = CHART_MARGIN,
): ChartLayout {
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.tickBand - margin.xLabel;
  const plotWidth = Math.max(plotRight - plotLeft, 0);
  const plotHeight = Math.max(plotBottom - plotTop, 0);
  const tickOffset = Math.round(margin.tickBand * 0.5);

  return {
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    plotWidth,
    plotHeight,
    tickY: plotBottom + tickOffset,
    xLabelY: height - Math.round(margin.xLabel / 2),
    yAxisLabelY: plotTop + plotHeight / 2,
    crosshairBottom: height - plotBottom,
  };
}

export function scaleToPlotY(
  value: number,
  min: number,
  max: number,
  layout: ChartLayout,
) {
  if (max === min) return layout.plotTop + layout.plotHeight / 2;

  const y =
    layout.plotTop +
    layout.plotHeight -
    ((value - min) / (max - min)) * layout.plotHeight;

  return Math.min(Math.max(y, layout.plotTop), layout.plotBottom);
}

export function getCategoryTickTextAnchor(
  index: number,
  total: number,
): "start" | "middle" | "end" {
  if (total <= 1) return "middle";
  if (index === 0) return "start";
  if (index === total - 1) return "end";
  return "middle";
}

export function getDataPlotBounds(
  layout: ChartLayout,
  inset = CHART_PLOT_INSET,
) {
  const dataPlotLeft = layout.plotLeft + inset;
  const dataPlotWidth = Math.max(layout.plotWidth - inset * 2, 0);
  const dataPlotRight = dataPlotLeft + dataPlotWidth;

  return { dataPlotLeft, dataPlotWidth, dataPlotRight };
}

export function getCategoryTickX(
  index: number,
  total: number,
  layout: ChartLayout,
  inset = CHART_PLOT_INSET,
) {
  const { dataPlotLeft, dataPlotWidth } = getDataPlotBounds(layout, inset);
  if (total <= 1) return dataPlotLeft + dataPlotWidth / 2;
  return dataPlotLeft + (index / (total - 1)) * dataPlotWidth;
}
