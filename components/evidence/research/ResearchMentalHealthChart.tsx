"use client";

import { useEffect, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { formatScore } from "@/lib/charts/tooltip";
import type { MentalHealthSeries } from "@/lib/research/types";

const PADDING = { top: 24, right: 24, bottom: 64, left: 48 };

type ResearchMentalHealthChartProps = {
  series: MentalHealthSeries[];
};

export function ResearchMentalHealthChart({
  series,
}: ResearchMentalHealthChartProps) {
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

  const highlightStart = toX(2012);

  const clearTooltip = () => {
    setTooltip(null);
    setActivePoint(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={plotRef}
        className="relative h-[360px] w-full"
        onMouseLeave={clearTooltip}
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
              fill="rgba(59, 130, 246, 0.08)"
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
                    stroke="rgba(15,31,61,0.08)"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-navy-800/60 text-[10px]"
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
              stroke="#9ca3af"
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
                          onMouseEnter={() => {
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
                          }}
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
              className="fill-navy-800/70 text-[9px]"
            >
              Z-score
            </text>

            <text
              x={width / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-navy-800/60 text-[9px]"
            >
              Year
            </text>
          </svg>
        )}

        <ChartTooltip
          tooltip={tooltip}
          containerWidth={width}
          containerHeight={height}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {series.map((entry) => (
          <div key={entry.label} className="flex items-center gap-2">
            <span
              className="h-0.5 w-6"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-xs text-navy-800/70">{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
