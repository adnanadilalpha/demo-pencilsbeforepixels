"use client";

import { useEffect, useRef, useState } from "react";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  getChartLayout,
  scaleToPlotY,
} from "@/components/charts/chart-layout";
import {
  chartAxisLabelDark,
  chartTickDark,
} from "@/components/charts/chart-theme";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import {
  bindChartHitTarget,
  formatScore,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import type { EquityDistrictPoint, EquityScatterPanelData } from "@/lib/evidence/types";

type EvidenceScatterChartProps = {
  panel: EquityScatterPanelData;
};

function buildTicks(min: number, max: number, count = 4) {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) =>
    Math.round(min + step * index),
  );
}

function formatGap(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded.toFixed(1);
}

function buildScatterTooltip(
  point: EquityDistrictPoint,
  x: number,
  y: number,
): ChartTooltipState {
  const lines = [
    { label: "FRL", value: `${point.frlPct.toFixed(1)}%` },
    {
      label: "Students on FRL",
      value:
        point.studentsOnFrl != null
          ? point.studentsOnFrl.toLocaleString()
          : "N/A",
    },
    {
      label: "Students Tested",
      value: point.studentsTested?.toLocaleString() ?? "N/A",
    },
    { label: "Score", value: point.score.toFixed(1) },
    { label: "Predicted", value: point.predicted.toFixed(1) },
    { label: "vs. Expected", value: formatGap(point.residual) },
    {
      label: "Weighted avg of Grade(s)",
      value: point.gradesPresent || "N/A",
    },
  ];

  if (
    point.isPartialGrade &&
    point.gradesUsed != null &&
    point.totalSelectedGrades != null
  ) {
    lines.push({
      label: "Grades available",
      value: `${point.gradesUsed} of ${point.totalSelectedGrades} selected grades`,
    });
  }

  return {
    x,
    y,
    title: point.name,
    accent: point.color,
    lines,
  };
}

export function EvidenceScatterChart({ panel }: EvidenceScatterChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activePointId, setActivePointId] = useState<string | null>(null);

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
  const layout = getChartLayout(width, height);

  const highlightSet = new Set(
    panel.highlightedDistricts.map((district) => district.id),
  );
  const hasHighlights = panel.highlightedDistricts.length > 0;

  const xValues =
    panel.points.length > 0
      ? panel.points.map((point) => point.frlPct)
      : panel.trendLine.map((point) => point.frlPct);
  const yValues =
    panel.points.length > 0
      ? panel.points.map((point) => point.score)
      : panel.trendLine.map((point) => point.score);

  const xMin = Math.max(0, Math.floor(Math.min(...xValues) - 5));
  const xMax = Math.min(100, Math.ceil(Math.max(...xValues) + 5));
  const yMin = Math.floor(Math.min(...yValues) - 10);
  const yMax = Math.ceil(Math.max(...yValues) + 10);
  const xTicks = buildTicks(xMin, xMax);
  const yTicks = buildTicks(yMin, yMax);

  const toX = (frlPct: number) =>
    layout.plotLeft +
    ((frlPct - xMin) / (xMax - xMin || 1)) * layout.plotWidth;
  const toY = (score: number) => scaleToPlotY(score, yMin, yMax, layout);

  const trendPath =
    panel.trendLine.length === 2
      ? `M ${toX(panel.trendLine[0].frlPct)} ${toY(panel.trendLine[0].score)} L ${toX(panel.trendLine[1].frlPct)} ${toY(panel.trendLine[1].score)}`
      : "";

  const clearTooltip = () => {
    setTooltip(null);
    setActivePointId(null);
  };

  useDismissChartTooltip(plotRef, !!tooltip, clearTooltip);

  return (
    <div className="flex h-[280px] min-h-[280px] w-full flex-1 flex-col sm:h-[360px] sm:min-h-[360px] lg:h-auto lg:min-h-[420px]">
      <div
        ref={plotRef}
        className="relative min-h-0 w-full flex-1"
        onMouseLeave={clearTooltip}
        onClick={clearTooltip}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0 overflow-visible"
            role="img"
            aria-label={`${panel.title} scatter chart`}
          >
            {yTicks.map((tick) => {
              const y = toY(tick);
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
                    className={chartTickDark}
                  >
                    {formatScore(tick)}
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

            {xTicks.map((tick) => {
              const x = toX(tick);
              return (
                <text
                  key={tick}
                  x={x}
                  y={layout.tickY}
                  textAnchor="middle"
                  className={chartTickDark}
                >
                  {tick}%
                </text>
              );
            })}

            <text
              x={12}
              y={layout.yAxisLabelY}
              transform={`rotate(-90 12 ${layout.yAxisLabelY})`}
              textAnchor="middle"
              className={chartAxisLabelDark}
            >
              {panel.yLabel}
            </text>

            <text
              x={width / 2}
              y={layout.xLabelY}
              textAnchor="middle"
              className={chartAxisLabelDark}
            >
              {panel.xLabel}
            </text>

            {trendPath && (
              <path
                d={trendPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}

            {panel.points.map((point) => {
              const x = toX(point.frlPct);
              const y = toY(point.score);
              const highlighted = highlightSet.has(point.id);
              const dimmed = hasHighlights;
              const isActive = activePointId === point.id;

              return (
                <ScatterDot
                  key={point.id}
                  point={point}
                  x={x}
                  y={y}
                  highlighted={highlighted}
                  dimmed={dimmed}
                  isActive={isActive}
                  onActivate={() => {
                    setActivePointId(point.id);
                    setTooltip(buildScatterTooltip(point, x, y));
                  }}
                  onClear={clearTooltip}
                />
              );
            })}
          </svg>
        )}

        <ChartTooltip
          tooltip={tooltip}
          containerWidth={width}
          containerHeight={height}
          onDismiss={clearTooltip}
        />
      </div>
    </div>
  );
}

function ScatterDot({
  point,
  x,
  y,
  highlighted,
  dimmed,
  isActive,
  onActivate,
  onClear,
}: {
  point: EquityDistrictPoint;
  x: number;
  y: number;
  highlighted: boolean;
  dimmed: boolean;
  isActive: boolean;
  onActivate: () => void;
  onClear: () => void;
}) {
  const showHighlightRing = highlighted && dimmed;
  const radius =
    dimmed && highlighted ? 7 : highlighted ? 5 : point.isPartialGrade ? 4.5 : 4;
  const fill =
    dimmed && !highlighted ? "#d1d5db" : point.isPartialGrade ? "#ffffff" : point.color;
  const stroke =
    dimmed && !highlighted
      ? "#d1d5db"
      : point.isPartialGrade
        ? point.color
        : point.color;
  const strokeWidth = point.isPartialGrade ? 2.5 : 0;
  const opacity = dimmed && !highlighted ? 0.25 : 1;

  return (
    <g opacity={opacity}>
      <circle
        cx={x}
        cy={y}
        r={16}
        fill="transparent"
        className="cursor-pointer"
        {...bindChartHitTarget({
          isActive,
          onActivate,
          onClear,
        })}
      />
      {showHighlightRing && (
        <circle
          cx={x}
          cy={y}
          r={11}
          fill="none"
          stroke={point.color}
          strokeWidth={2}
        />
      )}
      {isActive && (
        <circle cx={x} cy={y} r={12} fill={point.color} opacity={0.15} />
      )}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}
