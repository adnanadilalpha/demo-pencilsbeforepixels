"use client";

import { useEffect, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  getChartLayout,
  scaleToPlotY,
} from "@/components/charts/chart-layout";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import type {
  AcademicChart,
  ChartMarkerShape,
} from "@/lib/academic-data/types";

type EvidenceLineChartProps = {
  chart: AcademicChart;
  empty?: boolean;
  compact?: boolean;
  hideTitle?: boolean;
  showTooltip?: boolean;
};

function buildPath(
  values: number[],
  min: number,
  max: number,
  layout: ReturnType<typeof getChartLayout>,
  step: number,
) {
  return values
    .map((value, index) => {
      const x = layout.plotLeft + index * step;
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
  const layout = getChartLayout(width, height);
  const [yMin, , , yMax] = chart.yTicks;
  const step =
    chart.categories.length > 1
      ? layout.plotWidth / (chart.categories.length - 1)
      : 0;

  const subjectLabel =
    chart.title.charAt(0) + chart.title.slice(1).toLowerCase();
  const isPisaMath = chart.title.toUpperCase() === "MATH";

  const clearTooltip = () => {
    setTooltip(null);
    setActivePoint(null);
  };

  return (
    <div
      className={`flex w-full flex-col ${
        compact
          ? "h-[220px]"
          : "h-[220px] min-h-[220px] sm:h-[320px] sm:min-h-[320px] lg:h-auto lg:min-h-[400px] lg:flex-1"
      }`}
    >
      {!hideTitle && (
        <p className="mb-3 shrink-0 text-center font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-navy-800/50">
          {empty ? "\u00A0" : chart.title}
        </p>
      )}

      <div
        ref={plotRef}
        className="relative min-h-0 w-full flex-1"
        onMouseLeave={showTooltip ? clearTooltip : undefined}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
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
                    className="fill-navy-800 font-sans text-[10px]"
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
              className="fill-navy-800 text-[9px]"
            >
              {chart.yLabel}
            </text>

            {chart.categories.map((category, index) => {
              const x = layout.plotLeft + index * step;
              return (
                <text
                  key={`${category}-${index}`}
                  x={x}
                  y={layout.tickY}
                  textAnchor="middle"
                  className="fill-navy-800 font-sans text-[10px]"
                >
                  {category}
                </text>
              );
            })}

            <text
              x={width / 2}
              y={layout.xLabelY}
              textAnchor="middle"
              className="fill-navy-800 text-[9px]"
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
                      if (!Number.isFinite(value) || value <= 0) return null;

                      const x = layout.plotLeft + index * step;
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
                              onMouseEnter={() => {
                                const category = chart.categories[index] ?? "";
                                setActivePoint(pointId);
                                setTooltip({
                                  x,
                                  y,
                                  title: `${subjectLabel} ${series.label}`,
                                  accent: series.color,
                                  lines: isPisaMath
                                    ? [
                                        {
                                          label: "CPU",
                                          value: `${category} min/day`,
                                        },
                                        { label: "Score", value: String(value) },
                                      ]
                                    : [{ label: "Score", value: String(value) }],
                                });
                              }}
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
          />
        )}
      </div>
    </div>
  );
}
