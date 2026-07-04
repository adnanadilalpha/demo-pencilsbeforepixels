"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  ChartZoomResetButton,
  ChartZoomSelection,
} from "@/components/charts/ChartZoomUi";
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
  researchChartCategoryLabelDark,
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
import {
  generateZoomYTicks,
  useChartZoom,
} from "@/lib/charts/use-chart-zoom";

import { PISA_CPU_MINUTES } from "@/lib/charts/pisa-data";
import type {
  AcademicChart,
  ChartMarkerShape,
} from "@/lib/academic-data/types";

type EvidenceLineChartProps = {
  chart: AcademicChart;
  empty?: boolean;
  research?: boolean;
  hideTitle?: boolean;
  showTooltip?: boolean;
  enableZoom?: boolean;
  hiddenSeries?: ReadonlySet<string>;
};

function buildPath(
  values: number[],
  toX: (index: number) => number,
  toY: (value: number) => number,
) {
  return values
    .map((value, index) => {
      const x = toX(index);
      const y = toY(value);
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
  research = false,
  hideTitle = true,
  showTooltip = false,
  enableZoom: enableZoomProp,
  hiddenSeries,
}: EvidenceLineChartProps) {
  const enableZoom = enableZoomProp ?? (showTooltip && research);
  const plotRef = useRef<HTMLDivElement>(null);
  const clipId = useId();
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
  const crowdedCategories = research && chart.categories.length > 5;
  const margin = research
    ? {
        ...researchMargin,
        ...(crowdedCategories
          ? {
              tickBand: researchMargin.tickBand + 24,
              xLabel: researchMargin.xLabel + 6,
            }
          : {}),
      }
    : undefined;
  const layout = getChartLayout(
    width,
    height,
    research ? margin : undefined,
  );
  const tickClass = research ? researchChartTickDark : chartTickDark;
  const axisLabelClass = research
    ? researchChartAxisLabelDark
    : chartAxisLabelDark;
  const categoryLabelClass = research
    ? researchChartCategoryLabelDark
    : tickClass;
  const titleClass = research ? researchChartTitleDark : chartTitleDark;
  const yMin = chart.yMin ?? chart.yTicks[0];
  const yMax = chart.yMax ?? chart.yTicks[chart.yTicks.length - 1];
  const { dataPlotLeft, dataPlotWidth } = getDataPlotBounds(layout);
  const categoryCount = Math.max(chart.categories.length, 1);
  const fullDomain = useMemo(
    () => ({
      xMin: 0,
      xMax: Math.max(categoryCount - 1, 1),
      yMin,
      yMax,
    }),
    [categoryCount, yMin, yMax],
  );
  const plotBounds = useMemo(
    () => ({
      left: dataPlotLeft,
      right: dataPlotLeft + dataPlotWidth,
      top: layout.plotTop,
      bottom: layout.plotBottom,
    }),
    [dataPlotLeft, dataPlotWidth, layout.plotBottom, layout.plotTop],
  );
  const {
    viewDomain,
    isZoomed,
    resetZoom,
    dataToPixelX,
    dataToPixelY,
    selectionRect,
    onOverlayPointerDown,
    onOverlayPointerMove,
    onOverlayPointerUp,
    onOverlayDoubleClick,
  } = useChartZoom({
    enabled: enableZoom && width > 0 && height > 0,
    fullDomain,
    plotBounds,
    containerRef: plotRef,
  });
  const viewYMin = enableZoom ? viewDomain.yMin : yMin;
  const viewYMax = enableZoom ? viewDomain.yMax : yMax;
  const yTicks = enableZoom && isZoomed
    ? generateZoomYTicks(viewYMin, viewYMax)
    : chart.yTicks;
  const indexToX = (index: number) =>
    enableZoom
      ? dataToPixelX(index)
      : getCategoryTickX(index, chart.categories.length, layout);
  const valueToY = (value: number) =>
    enableZoom
      ? dataToPixelY(value)
      : scaleToPlotY(value, viewYMin, viewYMax, layout);

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
      const meta = series.pointMeta?.[index];
      const isStateSeries =
        series.label.includes("State Average") ||
        series.label.startsWith("State —");
      const lines = [
        { label: "School Year", value: category },
        {
          label: chart.yLabel,
          value: formatChartTooltipValue(value, { yLabel: chart.yLabel }),
        },
      ];

      if (meta?.grades && !isStateSeries) {
        lines.push({ label: "Grades", value: meta.grades });
      }
      if (meta?.studentsTested && !isStateSeries) {
        lines.push({
          label: "Students Tested",
          value: meta.studentsTested.toLocaleString(),
        });
      }

      return {
        x,
        y,
        title: formatSeriesTooltipTitle(series.label),
        accent: series.color,
        lines,
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
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={layout.plotLeft}
                  y={layout.plotTop}
                  width={layout.plotWidth}
                  height={layout.plotHeight}
                />
              </clipPath>
            </defs>

            {yTicks.map((tick) => {
              const y = valueToY(tick);
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

            {enableZoom ? (
              <rect
                x={plotBounds.left}
                y={plotBounds.top}
                width={plotBounds.right - plotBounds.left}
                height={plotBounds.bottom - plotBounds.top}
                fill="transparent"
                className="cursor-crosshair"
                onPointerDown={onOverlayPointerDown}
                onPointerMove={onOverlayPointerMove}
                onPointerUp={onOverlayPointerUp}
                onDoubleClick={onOverlayDoubleClick}
              />
            ) : null}

            <ChartZoomSelection rect={selectionRect} />

            {chart.categories.map((category, index) => {
              if (
                enableZoom &&
                (index < viewDomain.xMin - 0.05 ||
                  index > viewDomain.xMax + 0.05)
              ) {
                return null;
              }

              const x = indexToX(index);
              const tickY = crowdedCategories ? layout.tickY + 2 : layout.tickY;
              return (
                <text
                  key={`${category}-${index}`}
                  x={x}
                  y={tickY}
                  textAnchor={
                    crowdedCategories
                      ? "end"
                      : getCategoryTickTextAnchor(
                          index,
                          chart.categories.length,
                        )
                  }
                  transform={
                    crowdedCategories
                      ? `rotate(-38 ${x} ${tickY})`
                      : undefined
                  }
                  className={categoryLabelClass}
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

            <g clipPath={enableZoom ? `url(#${clipId})` : undefined}>
            {!empty &&
              chart.series
                .filter((series) => !hiddenSeries?.has(series.label))
                .map((series) => {
                const path = buildPath(series.values, indexToX, valueToY);
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

                      const x = indexToX(index);
                      const y = valueToY(value);
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
            </g>
          </svg>
        )}

        {enableZoom && isZoomed ? (
          <ChartZoomResetButton onReset={resetZoom} />
        ) : null}

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
