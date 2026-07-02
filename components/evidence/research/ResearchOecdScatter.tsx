"use client";

import { useEffect, useRef, useState } from "react";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { formatScore } from "@/lib/charts/tooltip";
import type { OecdScatterChart } from "@/lib/research/types";

const PADDING = { top: 24, right: 24, bottom: 56, left: 56 };

type ResearchOecdScatterProps = {
  chart: OecdScatterChart;
};

export function ResearchOecdScatter({ chart }: ResearchOecdScatterProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

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

  const xMin = 0;
  const xMax = 10.5;
  const yMin = -42;
  const yMax = 35;

  const toX = (value: number) =>
    PADDING.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const toY = (value: number) =>
    PADDING.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

  const trendPath = chart.trendLine
    .map((point, index) => {
      const x = toX(point.x);
      const y = toY(point.y);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const clearTooltip = () => {
    setTooltip(null);
    setActiveCountry(null);
  };

  return (
    <div
      ref={plotRef}
      className="relative h-[420px] w-full"
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
          <line
            x1={PADDING.left}
            x2={width - PADDING.right}
            y1={toY(0)}
            y2={toY(0)}
            stroke="#9ca3af"
            strokeWidth={1.5}
          />

          {[-30, -15, 0, 15, 30].map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={toY(tick)}
                y2={toY(tick)}
                stroke="rgba(15,31,61,0.08)"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={toY(tick) + 3}
                textAnchor="end"
                className="fill-navy-800/60 text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}

          <path
            d={trendPath}
            fill="none"
            stroke="#bbd1f1"
            strokeWidth={2}
          />

          {chart.points.map((point) => {
            const x = toX(point.x);
            const y = toY(point.y);
            const isActive = activeCountry === point.country;

            return (
              <g key={point.country}>
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setActiveCountry(point.country);
                    setTooltip({
                      x,
                      y,
                      title: point.country,
                      accent: "#0f1f3d",
                      lines: [
                        {
                          label: "Score change",
                          value: formatScore(point.y),
                        },
                      ],
                    });
                  }}
                />
                {isActive ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={10}
                    fill="#0f1f3d"
                    opacity={0.15}
                  />
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6.5 : 5}
                  fill="#0f1f3d"
                  opacity={isActive ? 1 : 0.8}
                  className="transition-all duration-150"
                />
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
            {chart.yLabel}
          </text>

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-navy-800/60 text-[9px]"
          >
            {chart.xLabel}
          </text>
        </svg>
      )}

      <ChartTooltip
        tooltip={tooltip}
        containerWidth={width}
        containerHeight={height}
      />
    </div>
  );
}
