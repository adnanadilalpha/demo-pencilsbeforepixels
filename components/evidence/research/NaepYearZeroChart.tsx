"use client";

import { useEffect, useRef, useState } from "react";
import { ChartCrosshair, ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { formatScore } from "@/lib/charts/tooltip";
import type { NaepYearZeroChart as NaepChartData } from "@/lib/research/types";

const PADDING = { top: 16, right: 24, bottom: 40, left: 48 };

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

type NaepYearZeroChartProps = {
  chart: NaepChartData;
};

export function NaepYearZeroChart({ chart }: NaepYearZeroChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);

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
  const yearMin = chart.years[0] ?? -20;
  const yearMax = chart.years[chart.years.length - 1] ?? 10;

  const toX = (year: number) =>
    PADDING.left +
    ((year - yearMin) / (yearMax - yearMin || 1)) * plotWidth;
  const toY = (score: number) =>
    scaleValue(score, yMin, yMax, plotHeight, PADDING.top);

  const zeroX = toX(chart.yearZero);
  const zeroIndex = chart.years.findIndex((year) => year === chart.yearZero);
  const scoreAtZero = chart.scores[zeroIndex] ?? chart.scores[0] ?? 0;

  const preEndYear = chart.years[zeroIndex] ?? 0;
  const postEndYear = chart.years[chart.years.length - 1] ?? 10;
  const preEndScore = scoreAtZero + chart.preSlope * (preEndYear - chart.yearZero);
  const postEndScore =
    scoreAtZero + chart.postSlope * (postEndYear - chart.yearZero);

  const mainPath = chart.years
    .map((year, index) => {
      const x = toX(year);
      const y = toY(chart.scores[index] ?? 0);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const xTickYears = [-20, -10, 0, 10].filter(
    (year) => year >= yearMin && year <= yearMax,
  );

  const formatRelativeYear = (year: number) =>
    year > 0 ? `+${year}` : String(year);

  const clearTooltip = () => {
    setTooltip(null);
    setActiveYear(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-center text-lg leading-6 text-[#18263a]">
        {chart.title}
      </h3>

      <div
        ref={plotRef}
        className="relative h-[224px] w-full"
        onMouseLeave={clearTooltip}
      >
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            role="img"
            aria-label={`${chart.title} relative to digital adoption`}
          >
            {chart.yTicks.map((tick) => {
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
                    {tick}
                  </text>
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
              Mean Score
            </text>

            <rect
              x={zeroX}
              y={PADDING.top}
              width={Math.max(width - PADDING.right - zeroX, 0)}
              height={plotHeight}
              fill="rgba(248, 113, 113, 0.12)"
            />

            <line
              x1={zeroX}
              x2={zeroX}
              y1={PADDING.top}
              y2={height - PADDING.bottom}
              stroke="#f87171"
              strokeWidth={1}
            />

            <path
              d={mainPath}
              fill="none"
              stroke="#0f1f3d"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
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

            {chart.years.map((year, index) => {
              const x = toX(year);
              const y = toY(chart.scores[index] ?? 0);
              const score = chart.scores[index] ?? 0;
              const isActive = activeYear === year;

              return (
                <g key={year}>
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setActiveYear(year);
                      setTooltip({
                        x,
                        y,
                        title: `Year ${formatRelativeYear(year)}`,
                        accent: "#0f1f3d",
                        lines: [
                          {
                            label: "Mean Score",
                            value: formatScore(score),
                          },
                        ],
                      });
                    }}
                  />
                  {isActive ? (
                    <circle
                      cx={x}
                      cy={y}
                      r={9}
                      fill="#0f1f3d"
                      opacity={0.15}
                    />
                  ) : null}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 4.5 : 3}
                    fill="#0f1f3d"
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}

            <line
              x1={toX(chart.years[0] ?? yearMin)}
              y1={toY(
                scoreAtZero +
                  chart.preSlope * ((chart.years[0] ?? yearMin) - chart.yearZero),
              )}
              x2={toX(preEndYear)}
              y2={toY(preEndScore)}
              stroke="#16a34a"
              strokeWidth={2}
            />

            <line
              x1={toX(chart.yearZero)}
              y1={toY(scoreAtZero)}
              x2={toX(postEndYear)}
              y2={toY(postEndScore)}
              stroke="#dc2626"
              strokeWidth={2}
            />

            {xTickYears.map((year) => (
              <text
                key={year}
                x={toX(year)}
                y={height - 16}
                textAnchor="middle"
                className="fill-navy-800/60 text-[10px]"
              >
                {year > 0 ? `+${year}` : year}
              </text>
            ))}

            <text
              x={width / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-navy-800/60 text-[9px]"
            >
              Years Relative to digital lock-in
            </text>
          </svg>
        )}

        <ChartTooltip
          tooltip={tooltip}
          containerWidth={width}
          containerHeight={height}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-[0.12em] text-navy-800/50">
          Years Relative to digital lock-in
        </p>
        <div className="grid grid-cols-2 gap-4">
          <SlopeCard
            label={chart.slopes.pre.label}
            value={chart.slopes.pre.value}
            tone="pre"
          />
          <SlopeCard
            label={chart.slopes.post.label}
            value={chart.slopes.post.value}
            tone="post"
          />
        </div>
      </div>
    </div>
  );
}

function SlopeCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pre" | "post";
}) {
  return (
    <div
      className={`rounded-lg border px-8 py-3 text-center ${
        tone === "pre"
          ? "border-navy-50 bg-navy-50"
          : "border-red-100 bg-red-50"
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-navy-800/60">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-semibold ${
          tone === "pre" ? "text-navy-800" : "text-red-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
