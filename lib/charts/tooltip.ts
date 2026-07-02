type ChartTooltipLine = {
  label: string;
  value: string;
  accent?: string;
};

export type ChartTooltipState = {
  x: number;
  y: number;
  title: string;
  lines: ChartTooltipLine[];
  accent?: string;
} | null;

export function positionChartTooltip(
  containerWidth: number,
  containerHeight: number,
  anchorX: number,
  anchorY: number,
  tooltipWidth = 168,
  tooltipHeight = 88,
) {
  const padding = 8;
  let left = anchorX + 14;
  let top = anchorY - tooltipHeight - 10;

  if (left + tooltipWidth > containerWidth - padding) {
    left = anchorX - tooltipWidth - 14;
  }
  if (left < padding) {
    left = padding;
  }
  if (top < padding) {
    top = anchorY + 14;
  }
  if (top + tooltipHeight > containerHeight - padding) {
    top = containerHeight - tooltipHeight - padding;
  }

  return { left, top };
}

export function formatScore(value: number, decimals = 0) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}
