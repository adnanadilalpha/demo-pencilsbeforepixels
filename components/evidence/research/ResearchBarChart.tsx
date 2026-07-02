"use client";

import { useEffect, useRef, useState } from "react";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { formatScore } from "@/lib/charts/tooltip";
import type { BarChartData } from "@/lib/research/types";

const PADDING = { top: 20, right: 16, bottom: 56, left: 48 };

type ResearchBarChartProps = {
  chart: BarChartData;
  horizontal?: boolean;
};

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

export function ResearchBarChart({
  chart,
  horizontal = false,
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
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);
  const [yMin, , , yMax] = chart.yTicks;
  const colors = chart.colors ?? ["#0f1f3d", "#2d5282", "#4a6fa5", "#7fa3cc"];
  const barCount = chart.values.length;
  const gap = horizontal ? 12 : 16;
  const barThickness = horizontal
    ? (plotHeight - gap * (barCount - 1)) / barCount
    : (plotWidth - gap * (barCount - 1)) / barCount;

  const clearTooltip = () => {
    setTooltip(null);
    setActiveIndex(null);
  };

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
    <div className="flex flex-col gap-3">
      <h4 className="text-center text-sm font-medium text-[#18263a]">
        {chart.title}
      </h4>
      <div
        ref={plotRef}
        className="relative h-[240px] w-full"
        onMouseLeave={clearTooltip}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            role="img"
            aria-label={chart.title}
          >
            {chart.yTicks.map((tick) => {
              const y = scaleValue(tick, yMin, yMax, plotHeight, PADDING.top);
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
                    {tick}
                  </text>
                </g>
              );
            })}

            {!horizontal &&
              chart.values.map((value, index) => {
                const x =
                  PADDING.left + index * (barThickness + gap);
                const y = scaleValue(value, yMin, yMax, plotHeight, PADDING.top);
                const barHeight = height - PADDING.bottom - y;
                const color = colors[index % colors.length];
                const isActive = activeIndex === index;
                return (
                  <g key={chart.categories[index]}>
                    <rect
                      x={x}
                      y={y}
                      width={barThickness}
                      height={barHeight}
                      rx={4}
                      fill={color}
                      opacity={isActive ? 1 : activeIndex === null ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={barThickness + 8}
                      height={barHeight + 8}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        showBarTooltip(
                          index,
                          x + barThickness / 2,
                          y,
                          color,
                        )
                      }
                    />
                  </g>
                );
              })}

            {horizontal &&
              chart.values.map((value, index) => {
                const y =
                  PADDING.top + index * (barThickness + gap);
                const xStart = PADDING.left;
                const xEnd = scaleValue(
                  value,
                  yMin,
                  yMax,
                  plotWidth,
                  PADDING.left,
                );
                const color = colors[index % colors.length];
                const isActive = activeIndex === index;
                return (
                  <g key={chart.categories[index]}>
                    <rect
                      x={xStart}
                      y={y}
                      width={Math.max(xEnd - xStart, 0)}
                      height={barThickness}
                      rx={4}
                      fill={color}
                      opacity={isActive ? 1 : activeIndex === null ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                    <rect
                      x={xStart}
                      y={y - 4}
                      width={Math.max(xEnd - xStart, 0)}
                      height={barThickness + 8}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        showBarTooltip(
                          index,
                          xEnd,
                          y + barThickness / 2,
                          color,
                        )
                      }
                    />
                  </g>
                );
              })}

            {!horizontal &&
              chart.categories.map((category, index) => {
                const x =
                  PADDING.left +
                  index * (barThickness + gap) +
                  barThickness / 2;
                return (
                  <text
                    key={category}
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-navy-800/60 text-[8px]"
                  >
                    {category}
                  </text>
                );
              })}

            <text
              x={horizontal ? width / 2 : 12}
              y={horizontal ? height - 4 : height / 2}
              transform={
                horizontal
                  ? undefined
                  : `rotate(-90 12 ${height / 2})`
              }
              textAnchor="middle"
              className="fill-navy-800/70 text-[9px]"
            >
              {horizontal ? chart.xLabel : chart.yLabel}
            </text>

            {!horizontal && (
              <text
                x={width / 2}
                y={height - 24}
                textAnchor="middle"
                className="fill-navy-800/70 text-[9px]"
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
        />
      </div>
    </div>
  );
}
