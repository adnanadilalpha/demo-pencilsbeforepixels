"use client";

export const STATE_BENCHMARK_COLOR = "#B91C1C";
const DISTRICT_LINE_COLOR = "#94A3B8";

export type LegendMarkerShape = "circle" | "diamond" | "square";

type EvidenceLegendSwatchProps = {
  color?: string;
  dashArray?: string;
  marker?: LegendMarkerShape;
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export function EvidenceLegendSwatch({
  color = STATE_BENCHMARK_COLOR,
  dashArray,
  marker = "diamond",
  width = 36,
  height = 12,
  strokeWidth = 2.5,
}: EvidenceLegendSwatchProps) {
  const midX = width / 2;
  const midY = height / 2;

  return (
    <svg
      width={width}
      height={height}
      aria-hidden
      className="shrink-0"
      viewBox={`0 0 ${width} ${height}`}
    >
      <line
        x1={0}
        y1={midY}
        x2={width}
        y2={midY}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {marker === "circle" ? (
        <circle cx={midX} cy={midY} r={3.5} fill={color} />
      ) : null}
      {marker === "diamond" ? (
        <rect
          x={midX - 3}
          y={midY - 3}
          width={6}
          height={6}
          fill={color}
          transform={`rotate(45 ${midX} ${midY})`}
        />
      ) : null}
      {marker === "square" ? (
        <rect x={midX - 3.5} y={midY - 3.5} width={7} height={7} fill={color} />
      ) : null}
    </svg>
  );
}

type EvidenceLegendRowProps = {
  color?: string;
  dashArray?: string;
  marker?: LegendMarkerShape;
  title: string;
  subtitle?: string;
  className?: string;
  inactive?: boolean;
};

export function EvidenceLegendRow({
  color = STATE_BENCHMARK_COLOR,
  dashArray,
  marker = "diamond",
  title,
  subtitle,
  className = "",
  inactive = false,
}: EvidenceLegendRowProps) {
  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 ${inactive ? "opacity-35" : ""} ${className}`}
    >
      <EvidenceLegendSwatch
        color={color}
        dashArray={dashArray}
        marker={marker}
      />
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="text-sm text-navy-800/75 sm:text-base sm:leading-4">
          {title}
        </span>
        {subtitle ? (
          <span className="text-xs text-navy-800/50 sm:text-sm sm:leading-[14px]">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function StateBenchmarkLegendRow({
  subtitle = "Benchmark",
}: {
  subtitle?: string;
}) {
  return (
    <EvidenceLegendRow
      color={STATE_BENCHMARK_COLOR}
      dashArray="6 4"
      marker="diamond"
      title="State Average"
      subtitle={subtitle}
    />
  );
}

export const DISTRICT_LEGEND_COLOR = DISTRICT_LINE_COLOR;
