"use client";

import { useEffect, useRef, useState } from "react";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  researchChartAxisLabelMutedDark,
  researchChartCategoryLabelCompactDark,
  researchChartTickMutedDark,
} from "@/components/charts/chart-theme";
import { isResearchDesktopWidth } from "@/lib/research/responsive";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  formatScore,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import type { OecdScatterChart } from "@/lib/research/types";

const OECD_CHART_HEIGHT =
  "h-[360px] min-h-[360px] md:h-[440px] md:min-h-[440px] lg:h-[520px] lg:min-h-[520px]";

const PADDING_DESKTOP = { top: 52, right: 28, bottom: 72, left: 68 };
const PADDING_COMPACT = { top: 44, right: 12, bottom: 64, left: 52 };

const DOMAIN = {
  xMin: 0,
  xMax: 10.5,
  yMin: -42,
  yMax: 35,
} as const;

/** Plotly text positions from nebaraska charts page — keeps labels readable. */
const OECD_LABEL_POSITIONS: Record<
  string,
  "top right" | "top center" | "top left" | "bottom center" | "bottom left" | "bottom right"
> = {
  Turkey: "top right",
  Mexico: "top center",
  Greece: "bottom center",
  Italy: "top center",
  Korea: "top left",
  Luxembourg: "bottom left",
  Germany: "top center",
  Japan: "bottom center",
  Switzerland: "top right",
  Austria: "top right",
  Netherlands: "bottom center",
  Canada: "bottom left",
  Belgium: "top left",
  Ireland: "bottom right",
  Spain: "top right",
  Norway: "bottom right",
  "United States": "top right",
  Denmark: "bottom center",
  France: "bottom left",
  Iceland: "bottom left",
  Hungary: "top right",
  Portugal: "top right",
  Poland: "top center",
  Finland: "bottom center",
  Sweden: "bottom center",
  "Slovak Republic": "bottom left",
  "Czech Republic": "bottom right",
  Australia: "bottom right",
  "New Zealand": "bottom right",
};

function countryLabelLayout(
  position: (typeof OECD_LABEL_POSITIONS)[string],
): { dx: number; dy: number; anchor: "start" | "middle" | "end" } {
  switch (position) {
    case "top center":
      return { dx: 0, dy: -10, anchor: "middle" };
    case "top left":
      return { dx: -8, dy: -8, anchor: "end" };
    case "top right":
      return { dx: 8, dy: -8, anchor: "start" };
    case "bottom center":
      return { dx: 0, dy: 16, anchor: "middle" };
    case "bottom left":
      return { dx: -8, dy: 16, anchor: "end" };
    case "bottom right":
      return { dx: 8, dy: 16, anchor: "start" };
    default:
      return { dx: 8, dy: -8, anchor: "start" };
  }
}

function generateYTicks(yMin: number, yMax: number): number[] {
  const range = yMax - yMin;
  const step =
    range <= 12 ? 3 : range <= 24 ? 5 : range <= 50 ? 10 : 15;
  const start = Math.ceil(yMin / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= yMax; value += step) {
    ticks.push(value);
  }
  if (ticks.length < 2) {
    return [yMin, yMax];
  }
  return ticks;
}

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
  const PADDING = isResearchDesktopWidth(width)
    ? PADDING_DESKTOP
    : PADDING_COMPACT;
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);

  const toX = (value: number) =>
    PADDING.left +
    ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin || 1)) * plotWidth;

  const toY = (value: number) =>
    PADDING.top +
    plotHeight -
    ((value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin || 1)) * plotHeight;

  const plotBounds = {
    left: PADDING.left,
    right: width - PADDING.right,
    top: PADDING.top,
    bottom: height - PADDING.bottom,
  };

  const clearTooltip = () => {
    setTooltip(null);
    setActiveCountry(null);
  };

  useDismissChartTooltip(plotRef, !!tooltip, clearTooltip);

  const trendPath = chart.trendLine
    .map((point, index) => {
      const x = toX(point.x);
      const y = toY(point.y);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yTicks = generateYTicks(DOMAIN.yMin, DOMAIN.yMax);

  return (
    <div
      ref={plotRef}
      className={`relative w-full ${OECD_CHART_HEIGHT}`}
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
          <text
            x={width / 2}
            y={20}
            textAnchor="middle"
            className="fill-[#374151] font-sans text-[10px] font-semibold uppercase tracking-wide md:text-[11px] lg:text-sm"
            pointerEvents="none"
          >
            OECD Countries
          </text>

          <g pointerEvents="none">
            <line
              x1={plotBounds.left}
              x2={plotBounds.right}
              y1={toY(0)}
              y2={toY(0)}
              stroke="#9ca3af"
              strokeWidth={1.5}
            />

            {yTicks.map((tick) => (
              <line
                key={tick}
                x1={plotBounds.left}
                x2={plotBounds.right}
                y1={toY(tick)}
                y2={toY(tick)}
                stroke="rgba(15,31,61,0.08)"
                strokeWidth={1}
              />
            ))}

            <path
              d={trendPath}
              fill="none"
              stroke="#bbd1f1"
              strokeWidth={2}
            />
          </g>

          {chart.points.map((point) => {
            const x = toX(point.x);
            const y = toY(point.y);
            const isActive = activeCountry === point.country;
            const label = countryLabelLayout(
              OECD_LABEL_POSITIONS[point.country] ?? "top right",
            );

            return (
              <g key={point.country}>
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer"
                  {...bindChartHitTarget({
                    isActive,
                    onActivate: () => {
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
                    },
                    onClear: clearTooltip,
                  })}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6.5 : 5}
                  fill="#0f1f3d"
                  opacity={isActive ? 1 : 0.8}
                  className="transition-all duration-150"
                />
                <text
                  x={x + label.dx}
                  y={y + label.dy}
                  textAnchor={label.anchor}
                      className={`pointer-events-none font-sans transition-colors ${
                        isActive
                          ? "fill-navy-800 font-semibold text-[9px] md:text-[10px] lg:text-[11px]"
                          : `${researchChartCategoryLabelCompactDark} text-[9px] md:text-[10px] lg:text-[11px]`
                      }`}
                >
                  {point.country}
                </text>
              </g>
            );
          })}

          {yTicks.map((tick) => (
            <text
              key={`tick-${tick}`}
              x={PADDING.left - 8}
              y={toY(tick) + 3}
              textAnchor="end"
              className={researchChartTickMutedDark}
              pointerEvents="none"
            >
              {tick}
            </text>
          ))}

          <text
            x={12}
            y={height / 2}
            transform={`rotate(-90 12 ${height / 2})`}
            textAnchor="middle"
            className={researchChartAxisLabelMutedDark}
            pointerEvents="none"
          >
            {chart.yLabel}
          </text>

          <text
            x={width / 2}
            y={height - 20}
            textAnchor="middle"
            className={researchChartAxisLabelMutedDark}
            pointerEvents="none"
          >
            {chart.xLabel}
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
  );
}
