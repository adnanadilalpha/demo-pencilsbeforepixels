"use client";

import { useEffect, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  formatScore,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import {
  RESEARCH_CHART_PLOT_HEIGHT,
  chartAxisLabelLight,
  chartTickLight,
  researchChartAxisLabelMutedDark,
  researchChartCaptionDark,
  researchChartTickMutedDark,
} from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";
import { isResearchDesktopWidth } from "@/lib/research/responsive";
import type { MentalHealthSeries } from "@/lib/research/types";

const PADDING_DESKTOP = { top: 36, right: 24, bottom: 108, left: 56 };
const PADDING_COMPACT = { top: 28, right: 10, bottom: 84, left: 44 };

type ResearchMentalHealthChartProps = {
  series: MentalHealthSeries[];
  variant?: "research" | "home";
  showLegend?: boolean;
};

export function ResearchMentalHealthChart({
  series,
  variant = "research",
  showLegend = true,
}: ResearchMentalHealthChartProps) {
  const isHome = variant === "home";
  const tickClass = isHome ? chartTickLight : researchChartTickMutedDark;
  const axisLabelClass = isHome
    ? chartAxisLabelLight
    : researchChartAxisLabelMutedDark;
  const legendClass = isHome
    ? "text-[10px] font-medium uppercase tracking-wide text-white/40 md:text-[11px] lg:text-sm"
    : researchChartCaptionDark;
  const gridStroke = isHome ? "rgba(255,255,255,0.08)" : "rgba(15,31,61,0.08)";
  const zeroLineStroke = isHome ? "rgba(255,255,255,0.25)" : "#9ca3af";
  const highlightFill = isHome
    ? "rgba(103, 232, 249, 0.1)"
    : "rgba(59, 130, 246, 0.08)";
  const annotationClass = isHome
    ? "fill-[#67e8f9] font-sans text-[10px] md:text-[11px] lg:text-sm"
    : "fill-[#3b82f6] font-sans text-[10px] md:text-[11px] lg:text-sm";
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

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
  const PADDING = isResearchDesktopWidth(width)
    ? PADDING_DESKTOP
    : PADDING_COMPACT;
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);

  const allYears = [
    ...new Set(series.flatMap((entry) => entry.years)),
  ].sort((a, b) => a - b);
  const yearMin = allYears[0] ?? 2001;
  const yearMax = allYears[allYears.length - 1] ?? 2018;
  const yMin = -2;
  const yMax = 2.1;

  const toX = (year: number) =>
    PADDING.left +
    ((year - yearMin) / (yearMax - yearMin || 1)) * plotWidth;
  const toY = (value: number) =>
    PADDING.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

  const plotBottom = PADDING.top + plotHeight;
  const yearTickY = plotBottom + 18;
  const xLabelY = height - 12;

  const highlightStart = toX(2012);

  const clearTooltip = () => {
    setTooltip(null);
    setActivePoint(null);
  };

  useDismissChartTooltip(plotRef, !!tooltip, clearTooltip);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={plotRef}
        className={`relative w-full ${RESEARCH_CHART_PLOT_HEIGHT}`}
        onMouseLeave={clearTooltip}
        onClick={clearTooltip}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            role="img"
            aria-label="Adolescent mental health indicators"
          >
            <rect
              x={highlightStart}
              y={PADDING.top}
              width={Math.max(width - PADDING.right - highlightStart, 0)}
              height={plotHeight}
              fill={highlightFill}
            />

            {[-1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((tick) => {
              const y = toY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke={gridStroke}
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className={tickClass}
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={toY(0)}
              y2={toY(0)}
              stroke={zeroLineStroke}
              strokeWidth={1.5}
            />

            {tooltip ? (
              <ChartCrosshair
                x={tooltip.x}
                height={height}
                top={PADDING.top}
                bottom={PADDING.bottom}
                visible
              />
            ) : null}

            {series.map((entry) => {
              const path = entry.years
                .map((year, index) => {
                  const x = toX(year);
                  const y = toY(entry.values[index] ?? 0);
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ");

              return (
                <g key={entry.label}>
                  <path
                    d={path}
                    fill="none"
                    stroke={entry.color}
                    strokeWidth={1.5}
                  />
                  {entry.years.map((year, index) => {
                    const x = toX(year);
                    const y = toY(entry.values[index] ?? 0);
                    const value = entry.values[index] ?? 0;
                    const pointId = `${entry.label}-${year}`;
                    const isActive = activePoint === pointId;

                    return (
                      <g key={pointId}>
                        <circle
                          cx={x}
                          cy={y}
                          r={12}
                          fill="transparent"
                          className="cursor-pointer"
                          {...bindChartHitTarget({
                            isActive,
                            onActivate: () => {
                              setActivePoint(pointId);
                              setTooltip({
                                x,
                                y,
                                title: entry.label,
                                accent: entry.color,
                                lines: [
                                  {
                                    label: String(year),
                                    value: formatScore(value, 2),
                                  },
                                ],
                              });
                            },
                            onClear: clearTooltip,
                          })}
                        />
                        {isActive ? (
                          <circle
                            cx={x}
                            cy={y}
                            r={8}
                            fill={entry.color}
                            opacity={0.2}
                          />
                        ) : null}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 4.5 : 3}
                          fill={entry.color}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            <text
              x={12}
              y={height / 2}
              transform={`rotate(-90 12 ${height / 2})`}
              textAnchor="middle"
              className={axisLabelClass}
            >
              Z-score
            </text>

            <text
              x={width / 2}
              y={xLabelY}
              textAnchor="middle"
              className={axisLabelClass}
            >
              Year
            </text>

            {allYears.map((year) => {
              const x = toX(year);
              return (
                <text
                  key={year}
                  x={x}
                  y={yearTickY}
                  textAnchor="end"
                  transform={`rotate(-90 ${x} ${yearTickY})`}
                  className={tickClass}
                >
                  {year}
                </text>
              );
            })}

            <text
              x={toX(2012) + 4}
              y={PADDING.top + 12}
              className={annotationClass}
            >
              Sustained rise begins →
            </text>
          </svg>
        )}

        <ChartTooltip
          tooltip={tooltip}
          containerWidth={width}
          containerHeight={height}
          onDismiss={clearTooltip}
        />
      </div>

      {showLegend ? (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {series.map((entry) => (
            <div key={entry.label} className="flex items-center gap-2">
              <span
                className={cn("h-0.5 w-5 lg:w-6", isHome && "w-6")}
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              <span className={legendClass}>{entry.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
