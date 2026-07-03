"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { AcademicChart } from "@/lib/academic-data/types";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { formatChartTooltipValue } from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import { PISA_CPU_MINUTES } from "@/lib/charts/pisa-data";
import {
  formatChartTick,
  getAcademicLineChartLayout,
  getCategoryLabelStyle,
  shouldRenderCategory,
} from "@/components/charts/academic-line-chart-layout";
import {
  chartCaptionLight,
  chartCategoryLabelLight,
  chartLegendLight,
  chartTickLight,
  chartTitleLight,
} from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";

type AcademicLineChartProps = {
  chart: AcademicChart;
  empty?: boolean;
  hideLegend?: boolean;
  showTooltip?: boolean;
  showAllCategories?: boolean;
};

const MARKER_RADIUS = 5;

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

function buildPath(
  values: number[],
  min: number,
  max: number,
  plotWidth: number,
  plotHeight: number,
  offsetX: number,
  offsetY: number,
) {
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = offsetX + index * step;
      const y = scaleValue(value, min, max, plotHeight, offsetY);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function usesDecimalTicks(yTicks: number[]): boolean {
  return yTicks.some((tick) => !Number.isInteger(tick));
}

export function AcademicLineChart({
  chart,
  empty = false,
  hideLegend = false,
  showTooltip = false,
  showAllCategories = false,
}: AcademicLineChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const clipId = useId();

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const width = size.width;
  const height = size.height;
  const decimalTicks = usesDecimalTicks(chart.yTicks);
  const layout = useMemo(
    () =>
      getAcademicLineChartLayout(width, height, chart.categories.length, {
        decimalTicks,
        legendCount: chart.series.length,
      }),
    [width, height, chart.categories.length, decimalTicks, chart.series.length],
  );

  const {
    padding,
    plotWidth,
    plotHeight,
    plotInset,
    dataPlotLeft,
    dataPlotWidth,
    categoryStep,
  } = layout;
  const yMin = chart.yMin ?? chart.yTicks[0];
  const yMax = chart.yMax ?? chart.yTicks[chart.yTicks.length - 1];
  const titleUpper = chart.title.toUpperCase();
  const isPisaMath = titleUpper === "MATH";
  const isPisaReading = titleUpper === "READING";

  const buildPointTooltip = (
    series: AcademicChart["series"][number],
    index: number,
    value: number,
    x: number,
    y: number,
  ): ChartTooltipState => {
    if (isPisaMath) {
      const cpu = PISA_CPU_MINUTES[index] ?? 0;
      return {
        x,
        y,
        title: `Math ${series.label}`,
        accent: series.color,
        lines: [
          { label: "CPU", value: `${cpu} min/day` },
          {
            label: "Score",
            value: formatChartTooltipValue(value, { preferInteger: true }),
          },
        ],
      };
    }

    if (isPisaReading) {
      return {
        x,
        y,
        title: `Reading ${series.label}`,
        accent: series.color,
        lines: [
          {
            label: "Score",
            value: formatChartTooltipValue(value, { preferInteger: true }),
          },
        ],
      };
    }

    return {
      x,
      y,
      title: series.label,
      accent: series.color,
      lines: [
        {
          label: chart.yLabel || "Score",
          value: formatChartTooltipValue(value, { yLabel: chart.yLabel }),
        },
      ],
    };
  };

  const clearTooltip = () => {
    setTooltip(null);
    setActivePoint(null);
  };

  useDismissChartTooltip(plotRef, showTooltip && !!tooltip, clearTooltip);

  const categorySkip = showAllCategories ? 1 : layout.categorySkip;
  const showLegend = !hideLegend && !empty && chart.series.length > 0;
  const denseLegend = chart.series.length >= 4;
  const showZeroLine = yMin < 0 && yMax > 0;

  return (
    <div className="flex h-full w-full flex-col">
      {chart.title ? (
        <p className={`mb-4 shrink-0 text-center ${chartTitleLight}`}>
          {empty ? "\u00A0" : chart.title}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <div
          className="flex w-10 shrink-0 items-center justify-center sm:w-12"
          aria-hidden={empty}
        >
          {!empty && chart.yLabel ? (
            <p
              className={cn(
                chartCaptionLight,
                "origin-center -rotate-90 whitespace-nowrap leading-none",
              )}
            >
              {chart.yLabel}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={plotRef}
            className={cn(
              "relative w-full flex-1",
              denseLegend
                ? "min-h-[280px] sm:min-h-[320px]"
                : "min-h-[260px] sm:min-h-[300px] lg:min-h-[320px]",
            )}
            onMouseLeave={showTooltip ? clearTooltip : undefined}
            onClick={showTooltip ? clearTooltip : undefined}
          >
            {width > 0 && height > 0 && (
              <svg
                width={width}
                height={height}
                className="absolute inset-0 overflow-visible"
                role="img"
                aria-hidden={empty}
                aria-label={
                  empty
                    ? undefined
                    : chart.title
                      ? `${chart.title} line chart`
                      : "Academic data line chart"
                }
              >
                <defs>
                  <clipPath id={clipId}>
                    <rect
                      x={padding.left}
                      y={padding.top - plotInset}
                      width={plotWidth}
                      height={plotHeight + plotInset * 2}
                    />
                  </clipPath>
                </defs>

                {chart.yTicks.map((tick) => {
                  const y = scaleValue(tick, yMin, yMax, plotHeight, padding.top);
                  const isZero = tick === 0;
                  return (
                    <g key={tick}>
                      <line
                        x1={padding.left}
                        x2={width - padding.right}
                        y1={y}
                        y2={y}
                        stroke={
                          isZero
                            ? "rgba(255,255,255,0.35)"
                            : "rgba(255,255,255,0.1)"
                        }
                        strokeWidth={isZero ? 1.5 : 1}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 5}
                        textAnchor="end"
                        className={chartTickLight}
                      >
                        {formatChartTick(tick, decimalTicks)}
                      </text>
                    </g>
                  );
                })}

                {!empty && showTooltip && tooltip ? (
                  <ChartCrosshair
                    x={tooltip.x}
                    height={height}
                    top={padding.top}
                    bottom={padding.bottom}
                    visible
                  />
                ) : null}

                {!empty && (
                  <g clipPath={`url(#${clipId})`}>
                    {chart.series.map((series, seriesIndex) => {
                      const path = buildPath(
                        series.values,
                        yMin,
                        yMax,
                        dataPlotWidth,
                        plotHeight,
                        dataPlotLeft,
                        padding.top,
                      );
                      const seriesKey = `${series.label}-${seriesIndex}`;

                      return (
                        <g key={seriesKey}>
                          <path
                            d={path}
                            fill="none"
                            stroke={series.color}
                            strokeWidth={series.strokeWidth ?? 2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={series.dashArray}
                          />
                          {series.values.map((value, pointIndex) => {
                            const x = dataPlotLeft + pointIndex * categoryStep;
                            const y = scaleValue(
                              value,
                              yMin,
                              yMax,
                              plotHeight,
                              padding.top,
                            );
                            const pointId = `${seriesKey}-${pointIndex}`;
                            const isActive = activePoint === pointId;

                            return (
                              <g key={pointId}>
                                {showTooltip ? (
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={14}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    {...bindChartHitTarget({
                                      isActive,
                                      onActivate: () => {
                                        setActivePoint(pointId);
                                        setTooltip(
                                          buildPointTooltip(
                                            series,
                                            pointIndex,
                                            value,
                                            x,
                                            y,
                                          ),
                                        );
                                      },
                                      onClear: clearTooltip,
                                    })}
                                  />
                                ) : null}
                                {isActive ? (
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={10}
                                    fill={series.color}
                                    opacity={0.2}
                                  />
                                ) : null}
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={isActive ? MARKER_RADIUS + 1 : MARKER_RADIUS}
                                  fill={series.color}
                                  stroke="rgba(15, 23, 42, 0.45)"
                                  strokeWidth={1.5}
                                />
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            )}
            {showTooltip ? (
              <ChartTooltip
                tooltip={tooltip}
                containerWidth={width}
                containerHeight={height}
                onDismiss={clearTooltip}
              />
            ) : null}
          </div>

          {!empty && chart.categories.length > 0 && width > 0 && (
            <div
              className="relative w-full shrink-0"
              style={{
                height: layout.categoryBandHeight,
                paddingLeft: dataPlotLeft,
                paddingRight: padding.right + plotInset,
              }}
            >
              {chart.categories.map((category, index) => {
                if (
                  !shouldRenderCategory(
                    index,
                    chart.categories.length,
                    categorySkip,
                  )
                ) {
                  return null;
                }

                const labelStyle = getCategoryLabelStyle(
                  index,
                  chart.categories.length,
                );

                return (
                  <span
                    key={`${category}-${index}`}
                    className={cn(
                      "absolute top-0 leading-none",
                      chartCategoryLabelLight,
                      labelStyle.className,
                    )}
                    style={{
                      left: labelStyle.left,
                      right: labelStyle.right,
                    }}
                  >
                    {category}
                  </span>
                );
              })}
            </div>
          )}

          {!empty && chart.xLabel ? (
            <p
              className={cn(
                chartCaptionLight,
                "mt-2 shrink-0 px-1 text-center sm:mt-3",
              )}
            >
              {chart.xLabel}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-4 shrink-0 sm:mt-5",
              showLegend ? "" : "hidden",
              denseLegend
                ? "mx-auto grid w-full max-w-2xl grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2"
                : "flex flex-wrap items-center justify-center gap-x-8 gap-y-3",
            )}
            aria-hidden={!showLegend}
          >
            {chart.series.map((series, seriesIndex) => (
              <div
                key={`${series.label}-${seriesIndex}`}
                className={cn(
                  "flex items-center gap-2.5",
                  denseLegend ? "min-w-0 text-left" : "",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-0 w-7 shrink-0 self-start",
                    series.dashArray ? "border-t-2 bg-transparent" : "rounded-full",
                  )}
                  style={
                    series.dashArray
                      ? { borderTopColor: series.color, borderTopStyle: "dashed" }
                      : { backgroundColor: series.color, height: 4 }
                  }
                  aria-hidden
                />
                <span className={cn(chartLegendLight, "leading-snug")}>
                  {series.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
