"use client";

import { useEffect, useRef, useState } from "react";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  researchChartAxisLabelMutedDark,
  researchChartCategoryLabelDark,
  researchChartTickMutedDark,
} from "@/components/charts/chart-theme";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  formatScore,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import type { BarChartData } from "@/lib/research/types";
import { ResearchChartPdfFooter } from "@/components/evidence/research/ResearchPdfLink";
import { cn } from "@/lib/utils";

const DEFAULT_COLORS = ["#1a3353", "#2d5282", "#4a6fa5", "#7fa3cc"];

const COMPACT_CHART_HEIGHT =
  "h-[260px] min-h-[260px] md:h-[300px] md:min-h-[300px] lg:h-[320px] lg:min-h-[320px]";

/** Bar thickness — scales with slot size so bars fill the plot without crowding. */
const VERTICAL_BAR_FILL = 0.82;
const HORIZONTAL_BAR_FILL = 0.72;

const CATEGORY_LINE_HEIGHT = 12;
const CATEGORY_GAP_BELOW_PLOT = 10;

type Padding = { top: number; right: number; bottom: number; left: number };

type ResearchBarChartProps = {
  chart: BarChartData;
  horizontal?: boolean;
  compact?: boolean;
  hideFooter?: boolean;
  hideTitle?: boolean;
};

/** Split CPU-use labels so they fit under narrow TIMSS/PIRLS bars. */
function categoryLabelLines(category: string): string[] {
  switch (category) {
    case "Almost Never":
      return ["Almost", "Never"];
    case "Almost Daily":
      return ["Almost", "Daily"];
    case "1–2x per Month":
      return ["1–2x per", "Month"];
    case "1–2x per Week":
      return ["1–2x per", "Week"];
    default:
      return [category];
  }
}

function maxCategoryLineCount(categories: string[]) {
  return Math.max(
    1,
    ...categories.map((category) => categoryLabelLines(category).length),
  );
}

function resolveVerticalPadding(chart: BarChartData, compact: boolean): Padding {
  const lineCount = maxCategoryLineCount(chart.categories);
  const categoryBlockHeight =
    CATEGORY_GAP_BELOW_PLOT + lineCount * CATEGORY_LINE_HEIGHT + 8;
  const maxTickChars = Math.max(
    ...chart.yTicks.map((tick) => String(tick).length),
  );
  const tickLabelWidth = maxTickChars * 8 + 4;
  const yTitleBand = 18;
  const gapBetweenTitleAndTicks = 14;

  return {
    top: compact ? 14 : 18,
    right: compact ? 10 : 12,
    bottom: categoryBlockHeight + (compact ? 30 : 34),
    left:
      yTitleBand + gapBetweenTitleAndTicks + tickLabelWidth + (compact ? 8 : 10),
  };
}

function resolveHorizontalPadding(chart: BarChartData, compact: boolean): Padding {
  const lineCount = maxCategoryLineCount(chart.categories);
  const longestLineChars = Math.max(
    ...chart.categories.flatMap((category) =>
      categoryLabelLines(category).map((line) => line.length),
    ),
  );

  return {
    top: compact ? 18 : 22,
    right: compact ? 12 : 16,
    bottom: compact ? 52 : 56,
    left: Math.max(
      compact ? 108 : 122,
      longestLineChars * 6.2 + lineCount * 4 + 20,
    ),
  };
}

function scaleValue(
  value: number,
  min: number,
  max: number,
  range: number,
  offset: number,
) {
  if (max === min) return offset + range / 2;
  return offset + range - ((value - min) / (max - min)) * range;
}

function scaleHorizontal(
  value: number,
  min: number,
  max: number,
  range: number,
  offset: number,
) {
  if (max === min) return offset + range / 2;
  return offset + ((value - min) / (max - min)) * range;
}

function VerticalCategoryLabel({
  x,
  plotBottom,
  category,
}: {
  x: number;
  plotBottom: number;
  category: string;
}) {
  const lines = categoryLabelLines(category);
  const startY = plotBottom + CATEGORY_GAP_BELOW_PLOT;

  return (
    <text textAnchor="middle" className={researchChartCategoryLabelDark}>
      {lines.map((line, index) => (
        <tspan key={`${category}-${index}`} x={x} y={startY + index * CATEGORY_LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function HorizontalCategoryLabel({
  labelX,
  centerY,
  category,
}: {
  labelX: number;
  centerY: number;
  category: string;
}) {
  const lines = categoryLabelLines(category);
  const startY = centerY - ((lines.length - 1) * CATEGORY_LINE_HEIGHT) / 2;

  return (
    <text textAnchor="end" className={researchChartCategoryLabelDark}>
      {lines.map((line, index) => (
        <tspan key={`${category}-${index}`} x={labelX} y={startY + index * CATEGORY_LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function ResearchBarChart({
  chart,
  horizontal = false,
  compact = false,
  hideFooter = false,
  hideTitle = false,
}: ResearchBarChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;

    const updateSize = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const width = size.width;
  const height = size.height;
  const padding = horizontal
    ? resolveHorizontalPadding(chart, compact)
    : resolveVerticalPadding(chart, compact);
  const plotWidth = Math.max(width - padding.left - padding.right, 0);
  const plotHeight = Math.max(height - padding.top - padding.bottom, 0);
  const [tickMin, , , tickMax] = chart.yTicks;
  const colors = chart.colors ?? DEFAULT_COLORS;
  const barCount = chart.values.length;

  const plotBottom = height - padding.bottom;
  const plotTop = padding.top;
  const yAxisCenter = plotTop + plotHeight / 2;
  const categoryLineCount = maxCategoryLineCount(chart.categories);
  const categoryBlockHeight =
    CATEGORY_GAP_BELOW_PLOT + categoryLineCount * CATEGORY_LINE_HEIGHT + 8;
  const yTitleX = 9;
  const yTickX = padding.left - 8;
  const categoryLabelX = padding.left - 12;
  const xTitleY = horizontal
    ? height - 8
    : plotBottom + categoryBlockHeight + 16;
  const xTickY = plotBottom + 24;

  const slotWidth = plotWidth / barCount;
  const slotHeight = plotHeight / barCount;
  const barWidth = Math.min(slotWidth - 4, slotWidth * VERTICAL_BAR_FILL);
  const barHeight = Math.min(slotHeight - 6, slotHeight * HORIZONTAL_BAR_FILL);

  const verticalBarX = (index: number) =>
    padding.left + index * slotWidth + (slotWidth - barWidth) / 2;

  const verticalBarCenterX = (index: number) =>
    padding.left + (index + 0.5) * slotWidth;

  const horizontalRow = (index: number) => barCount - 1 - index;

  const horizontalBarY = (index: number) => {
    const row = horizontalRow(index);
    return plotTop + row * slotHeight + (slotHeight - barHeight) / 2;
  };

  const horizontalBarCenterY = (index: number) => {
    const row = horizontalRow(index);
    return plotTop + row * slotHeight + slotHeight / 2;
  };

  const clearTooltip = () => {
    setTooltip(null);
    setActiveIndex(null);
  };

  useDismissChartTooltip(plotRef, !!tooltip, clearTooltip);

  const showBarTooltip = (
    index: number,
    anchorX: number,
    anchorY: number,
    accent: string,
  ) => {
    const category = chart.categories[index] ?? "";
    const value = chart.values[index] ?? 0;
    setActiveIndex(index);
    setTooltip({
      x: anchorX,
      y: anchorY,
      title: category,
      accent,
      lines: [{ label: "Score", value: formatScore(value) }],
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {!hideTitle && chart.title ? (
        <h4 className="text-center font-sans text-[11px] font-medium text-[#374151] md:text-xs lg:text-sm">
          {chart.title}
        </h4>
      ) : null}

      <div
        ref={plotRef}
        className={cn("relative w-full", COMPACT_CHART_HEIGHT)}
        onMouseLeave={clearTooltip}
        onClick={clearTooltip}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            role="img"
            aria-label={chart.title}
          >
            {!horizontal &&
              chart.yTicks.map((tick) => {
                const y = scaleValue(tick, tickMin, tickMax, plotHeight, plotTop);
                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      x2={width - padding.right}
                      y1={y}
                      y2={y}
                      stroke="rgba(15,31,61,0.08)"
                      strokeWidth={1}
                    />
                    <text
                      x={yTickX}
                      y={y + 4}
                      textAnchor="end"
                      className={researchChartTickMutedDark}
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

            {horizontal &&
              chart.yTicks.map((tick) => {
                const x = scaleHorizontal(
                  tick,
                  tickMin,
                  tickMax,
                  plotWidth,
                  padding.left,
                );
                return (
                  <g key={tick}>
                    <line
                      x1={x}
                      x2={x}
                      y1={plotTop}
                      y2={plotBottom}
                      stroke="rgba(15,31,61,0.08)"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={xTickY}
                      textAnchor="middle"
                      className={researchChartTickMutedDark}
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

            {!horizontal &&
              chart.values.map((value, index) => {
                const x = verticalBarX(index);
                const centerX = verticalBarCenterX(index);
                const y = scaleValue(value, tickMin, tickMax, plotHeight, plotTop);
                const rectHeight = plotBottom - y;
                const color = colors[index % colors.length];
                const isActive = activeIndex === index;
                const category = chart.categories[index] ?? "";

                return (
                  <g key={category}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={rectHeight}
                      rx={4}
                      fill={color}
                      opacity={isActive ? 1 : activeIndex === null ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={barWidth + 8}
                      height={rectHeight + 8}
                      fill="transparent"
                      className="cursor-pointer"
                      {...bindChartHitTarget({
                        isActive,
                        onActivate: () =>
                          showBarTooltip(index, centerX, y, color),
                        onClear: clearTooltip,
                      })}
                    />
                    <VerticalCategoryLabel
                      x={centerX}
                      plotBottom={plotBottom}
                      category={category}
                    />
                  </g>
                );
              })}

            {horizontal &&
              chart.values.map((value, index) => {
                const y = horizontalBarY(index);
                const centerY = horizontalBarCenterY(index);
                const xEnd = scaleHorizontal(
                  value,
                  tickMin,
                  tickMax,
                  plotWidth,
                  padding.left,
                );
                const color = colors[index % colors.length];
                const isActive = activeIndex === index;
                const category = chart.categories[index] ?? "";

                return (
                  <g key={category}>
                    <HorizontalCategoryLabel
                      labelX={categoryLabelX}
                      centerY={centerY}
                      category={category}
                    />
                    <rect
                      x={padding.left}
                      y={y}
                      width={Math.max(xEnd - padding.left, 0)}
                      height={barHeight}
                      rx={4}
                      fill={color}
                      opacity={isActive ? 1 : activeIndex === null ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                    <rect
                      x={padding.left}
                      y={y - 4}
                      width={Math.max(xEnd - padding.left, 0)}
                      height={barHeight + 8}
                      fill="transparent"
                      className="cursor-pointer"
                      {...bindChartHitTarget({
                        isActive,
                        onActivate: () =>
                          showBarTooltip(index, xEnd, centerY, color),
                        onClear: clearTooltip,
                      })}
                    />
                  </g>
                );
              })}

            {!horizontal && (
              <>
                <text
                  x={yTitleX}
                  y={yAxisCenter}
                  transform={`rotate(-90 ${yTitleX} ${yAxisCenter})`}
                  textAnchor="middle"
                  className={researchChartAxisLabelMutedDark}
                >
                  {chart.yLabel}
                </text>
                <text
                  x={padding.left + plotWidth / 2}
                  y={xTitleY}
                  textAnchor="middle"
                  className={researchChartAxisLabelMutedDark}
                >
                  {chart.xLabel}
                </text>
              </>
            )}

            {horizontal && (
              <text
                x={padding.left + plotWidth / 2}
                y={xTitleY}
                textAnchor="middle"
                className={researchChartAxisLabelMutedDark}
              >
                {chart.xLabel}
              </text>
            )}
          </svg>
        )}

        <ChartTooltip
          tooltip={tooltip}
          containerWidth={width}
          containerHeight={height}
          onDismiss={clearTooltip}
        />
      </div>

      {!hideFooter && (
        <ResearchChartPdfFooter url={chart.pdfUrl} chartTitle={chart.title} />
      )}
    </div>
  );
}
