"use client";

import { useEffect, useRef, useState } from "react";
import type { AcademicChart } from "@/lib/academic-data/types";

type AcademicLineChartProps = {
  chart: AcademicChart;
  empty?: boolean;
};

const PADDING = { top: 12, right: 16, bottom: 44, left: 44 };

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

export function AcademicLineChart({ chart, empty = false }: AcademicLineChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);
  const [yMin, , , yMax] = chart.yTicks;
  const step =
    chart.categories.length > 1 ? plotWidth / (chart.categories.length - 1) : 0;
  const showLegend = !empty && chart.series.length > 1;

  return (
    <div className="flex h-full w-full flex-col px-2 pb-2 pt-4">
      <p className="mb-3 shrink-0 text-center font-sans text-[9px] font-medium uppercase leading-[13.5px] tracking-[0.2em] text-white/60">
        {empty ? "\u00A0" : chart.title}
      </p>

      <div
        ref={plotRef}
        className="relative min-h-[248px] w-full flex-1 lg:min-h-0"
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
              const y = scaleValue(tick, yMin, yMax, plotHeight, PADDING.top);
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-white/60 font-sans text-[10px]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <text
              x={14}
              y={height / 2}
              transform={`rotate(-90 14 ${height / 2})`}
              textAnchor="middle"
              className="fill-white/60 text-[9px]"
            >
              {chart.yLabel}
            </text>

            {chart.categories.map((category, index) => {
              const x = PADDING.left + index * step;
              return (
                <text
                  key={`${category}-${index}`}
                  x={x}
                  y={height - 18}
                  textAnchor="middle"
                  className="fill-white/60 font-sans text-[10px]"
                >
                  {category}
                </text>
              );
            })}

            <text
              x={width / 2}
              y={height - 4}
              textAnchor="middle"
              className="fill-white/60 text-[9px]"
            >
              {chart.xLabel}
            </text>

            {!empty &&
              chart.series.map((series) => {
                const path = buildPath(
                  series.values,
                  yMin,
                  yMax,
                  plotWidth,
                  plotHeight,
                  PADDING.left,
                  PADDING.top,
                );

                return (
                  <g key={series.label}>
                    <path
                      d={path}
                      fill="none"
                      stroke={series.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {series.values.map((value, index) => {
                      const x = PADDING.left + index * step;
                      const y = scaleValue(
                        value,
                        yMin,
                        yMax,
                        plotHeight,
                        PADDING.top,
                      );
                      return (
                        <circle
                          key={`${series.label}-${index}`}
                          cx={x}
                          cy={y}
                          r={4}
                          fill={series.color}
                        />
                      );
                    })}
                  </g>
                );
              })}
          </svg>
        )}
      </div>

      <div
        className={`mt-2 flex shrink-0 flex-wrap items-center justify-center gap-4 py-1 ${
          showLegend ? "min-h-[28px]" : "min-h-0"
        } ${showLegend ? "" : "invisible"}`}
        aria-hidden={!showLegend}
      >
        {chart.series.map((series) => (
          <div key={series.label} className="flex items-center gap-2">
            <span
              className="h-0.5 w-5"
              style={{ backgroundColor: series.color }}
              aria-hidden
            />
            <span className="text-[11px] text-white/50">{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
