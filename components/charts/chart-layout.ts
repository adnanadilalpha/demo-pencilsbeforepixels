/** Shared SVG layout: plot area above, x-axis tick band, then x-axis label. */
export const CHART_MARGIN = {
  top: 16,
  right: 16,
  left: 56,
  /** Dedicated row for year / category labels below the plot */
  tickBand: 36,
  xLabel: 12,
} as const;

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

export function getChartLayout(width: number, height: number): ChartLayout {
  const plotLeft = CHART_MARGIN.left;
  const plotRight = width - CHART_MARGIN.right;
  const plotTop = CHART_MARGIN.top;
  const plotBottom = height - CHART_MARGIN.tickBand - CHART_MARGIN.xLabel;
  const plotWidth = Math.max(plotRight - plotLeft, 0);
  const plotHeight = Math.max(plotBottom - plotTop, 0);

  return {
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    plotWidth,
    plotHeight,
    tickY: plotBottom + 22,
    xLabelY: height - 4,
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
