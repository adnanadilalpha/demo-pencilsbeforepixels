"use client";

import { useEffect, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  CHART_RESEARCH_MARGIN,
  CHART_RESEARCH_MARGIN_COMPACT,
  getCategoryTickTextAnchor,
  getCategoryTickX,
  getChartLayout,
  getDataPlotBounds,
  scaleToPlotY,
} from "@/components/charts/chart-layout";
import {
  chartAxisLabelDark,
  chartTickDark,
  chartTitleDark,
  researchChartAxisLabelDark,
  researchChartTickDark,
  researchChartTitleDark,
  RESEARCH_CHART_PLOT_HEIGHT,
} from "@/components/charts/chart-theme";
import { isResearchDesktopWidth } from "@/lib/research/responsive";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import {
  formatChartTooltipValue,
  formatSeriesTooltipTitle,
} from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";

import { PISA_CPU_MINUTES } from "@/lib/charts/pisa-data";
import type {
  AcademicChart,
  ChartMarkerShape,
} from "@/lib/academic-data/types";

type EvidenceLineChartProps = {
  chart: AcademicChart;
  empty?: boolean;
  /** @deprecated Use `research` for the evidence research tab. */
  compact?: boolean;
  research?: boolean;
  hideTitle?: boolean;
  showTooltip?: boolean;
};

function buildPath(
  values: number[],
  min: number,
  max: number,
  layout: ReturnType<typeof getChartLayout>,
  step: number,
  dataPlotLeft: number,
) {
  return values
    .map((value, index) => {
      const x = dataPlotLeft + index * step;
      const y = scaleToPlotY(value, min, max, layout);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function renderMarker(
  shape: ChartMarkerShape,
  x: number,
  y: number,
  color: string,
  size: number,
) {
  if (shape === "diamond") {
    return (
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={color}
        transform={`rotate(45 ${x} ${y})`}
      />
    );
  }

  if (shape === "square") {
    return (
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={color}
      />
    );
  }

  return <circle cx={x} cy={y} r={size / 2} fill={color} />;
}

export function EvidenceLineChart({
  chart,
  empty = false,
  compact = false,
  research = false,
  hideTitle = true,
  showTooltip = false,
}: EvidenceLineChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

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
  const researchMargin =
    research && !isResearchDesktopWidth(width)
      ? CHART_RESEARCH_MARGIN_COMPACT
      : CHART_RESEARCH_MARGIN;
  const layout = getChartLayout(
    width,
    height,
    research ? researchMargin : undefined,
  );
  const tickClass = research ? researchChartTickDark : chartTickDark;
  const axisLabelClass = research
    ? researchChartAxisLabelDark
    : chartAxisLabelDark;
  const titleClass = research ? researchChartTitleDark : chartTitleDark;
  const yMin = chart.yMin ?? chart.yTicks[0];
  const yMax = chart.yMax ?? chart.yTicks[chart.yTicks.length - 1];
  const { dataPlotLeft, dataPlotWidth } = getDataPlotBounds(layout);
  const step =
    chart.categories.length > 1
      ? dataPlotWidth / (chart.categories.length - 1)
      : 0;

  const titleUpper = chart.title.toUpperCase();
  const isPisaMath = titleUpper === "MATH";
  const isPisaReading = titleUpper === "READING";
  const isParcc = chart.yLabel === "Std. Achievement";
  const isDeviceTime =
    chart.yLabel === "Mean Score in Mathematics" &&
    chart.series.length === 2;
  const isPerformance = chart.yLabel === "Average Scale Score";

  const buildPointTooltip = (
    series: AcademicChart["series"][number],
    index: number,
    value: number,
    x: number,
    y: number,
  ): ChartTooltipState => {
    const category = chart.categories[index] ?? "";

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

    if (isDeviceTime) {
      return {
        x,
        y,
        title: series.label,
        accent: series.color,
        lines: [
          { label: "Time", value: category },
          {
            label: "Score",
            value: formatChartTooltipValue(value, { yLabel: chart.yLabel }),
          },
        ],
      };
    }

    if (isParcc) {
      return {
        x,
        y,
        title: series.label,
        accent: series.color,
        lines: [
          { label: "Year", value: category },
          {
            label: "Std. Achievement",
            value: formatChartTooltipValue(value, { yLabel: chart.yLabel }),
          },
        ],
      };
    }

    if (isPerformance) {
      return {
        x,
        y,
        title: formatSeriesTooltipTitle(series.label),
        accent: series.color,
        lines: [
          { label: "School Year", value: category },
          {
            label: chart.yLabel,
            value: formatChartTooltipValue(value, { yLabel: chart.yLabel }),
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

  const wrapperClass = research
    ? "flex w-full flex-col gap-3 md:gap-4 lg:gap-6"
    : compact
      ? "flex h-[220px] w-full flex-col"
      : "flex h-[220px] min-h-[220px] w-full flex-col sm:h-[320px] sm:min-h-[320px] lg:h-auto lg:min-h-[400px] lg:flex-1";

  const plotClass = research
    ? `relative w-full ${RESEARCH_CHART_PLOT_HEIGHT}`
    : "relative min-h-0 w-full flex-1";

  return (
    <div className={wrapperClass}>
      {!hideTitle && (
        <p
          className={`shrink-0 text-center ${titleClass} ${
            research ? "pt-1" : "mb-3"
          }`}
        >
          {empty ? "\u00A0" : chart.title}
        </p>
      )}

      <div
        ref={plotRef}
        className={plotClass}
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
            aria-label={empty ? undefined : `${chart.title} line chart`}
          >
            {chart.yTicks.map((tick) => {
              const y = scaleToPlotY(tick, yMin, yMax, layout);
              return (
                <g key={tick}>
                  <line
                    x1={layout.plotLeft}
                    x2={layout.plotRight}
                    y1={y}
                    y2={y}
                    stroke="rgba(15,31,61,0.08)"
                    strokeWidth={1}
                  />
                  <text
                    x={layout.plotLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className={tickClass}
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <line
              x1={layout.plotLeft}
              x2={layout.plotRight}
              y1={layout.plotBottom}
              y2={layout.plotBottom}
              stroke="rgba(15,31,61,0.14)"
              strokeWidth={1}
            />

            <text
              x={12}
              y={layout.yAxisLabelY}
              transform={`rotate(-90 12 ${layout.yAxisLabelY})`}
              textAnchor="middle"
              className={axisLabelClass}
            >
              {chart.yLabel}
            </text>

            {chart.categories.map((category, index) => {
              const x = getCategoryTickX(
                index,
                chart.categories.length,
                layout,
              );
              return (
                <text
                  key={`${category}-${index}`}
                  x={x}
                  y={layout.tickY}
                  textAnchor={getCategoryTickTextAnchor(
                    index,
                    chart.categories.length,
                  )}
                  className={tickClass}
                >
                  {category}
                </text>
              );
            })}

            <text
              x={width / 2}
              y={layout.xLabelY}
              textAnchor="middle"
              className={axisLabelClass}
            >
              {chart.xLabel}
            </text>

            {!empty && showTooltip && tooltip && (
              <ChartCrosshair
                x={tooltip.x}
                height={height}
                top={layout.plotTop}
                bottom={layout.crosshairBottom}
                visible
              />
            )}

            {!empty &&
              chart.series.map((series) => {
                const path = buildPath(
                  series.values,
                  yMin,
                  yMax,
                  layout,
                  step,
                  dataPlotLeft,
                );
                const markerShape = series.markerShape ?? "circle";
                const markerSize = markerShape === "circle" ? 8 : 7;

                return (
                  <g key={series.label} opacity={series.opacity ?? 1}>
                    <path
                      d={path}
                      fill="none"
                      stroke={series.color}
                      strokeWidth={series.strokeWidth ?? 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={series.dashArray}
                    />
                    {series.values.map((value, index) => {
                      if (!Number.isFinite(value)) return null;

                      const x = dataPlotLeft + index * step;
                      const y = scaleToPlotY(value, yMin, yMax, layout);
                      const pointId = `${series.label}-${index}`;
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
                                      index,
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
                              opacity={0.18}
                            />
                          ) : null}
                          {renderMarker(
                            markerShape,
                            x,
                            y,
                            series.color,
                            isActive ? markerSize + 2 : markerSize,
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
          </svg>
        )}

        {showTooltip && (
          <ChartTooltip
            tooltip={tooltip}
            containerWidth={width}
            containerHeight={height}
            onDismiss={clearTooltip}
          />
        )}
      </div>
    </div>
  );
}
