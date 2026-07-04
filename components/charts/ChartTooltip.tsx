"use client";

import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { positionChartTooltip } from "@/lib/charts/tooltip";
import {
  chartTooltipLabel,
  chartTooltipTitle,
  chartTooltipValue,
} from "@/components/charts/chart-theme";

type ChartTooltipProps = {
  tooltip: ChartTooltipState;
  containerWidth: number;
  containerHeight: number;
  onDismiss?: () => void;
};

function estimateTooltipSize(tooltip: NonNullable<ChartTooltipState>) {
  const longestContent = Math.max(
    tooltip.title.length,
    ...tooltip.lines.map(
      (line) => line.label.length + line.value.length + 4,
    ),
  );
  const width = Math.min(Math.max(240, longestContent * 6.8 + 40), 380);
  const titleLines = tooltip.title.length > 34 ? 2 : 1;
  const wrappedLabelLines = tooltip.lines.filter(
    (line) => line.label.length > 28,
  ).length;
  const height =
    52 + titleLines * 18 + tooltip.lines.length * 22 + wrappedLabelLines * 10;
  return { width, height };
}

function accentDotClass(accent?: string) {
  if (!accent) return "";
  const normalized = accent.toLowerCase();
  const needsRing =
    normalized === "#0f1f3d" ||
    normalized === "#0a1628" ||
    normalized === "#1a3353" ||
    normalized === "#000000" ||
    normalized === "#000";
  return needsRing ? "ring-1 ring-white/70" : "ring-1 ring-white/25";
}

export function ChartTooltip({
  tooltip,
  containerWidth,
  containerHeight,
  onDismiss,
}: ChartTooltipProps) {
  if (!tooltip) return null;

  const { width: tooltipWidth, height: tooltipHeight } =
    estimateTooltipSize(tooltip);

  const { left, top } = positionChartTooltip(
    containerWidth,
    containerHeight,
    tooltip.x,
    tooltip.y,
    tooltipWidth,
    tooltipHeight,
  );

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[240px] max-w-[380px] transition-all duration-200 ease-out"
      style={{ left, top, width: tooltipWidth }}
      role="tooltip"
    >
      <div className="relative rounded-md border border-gold-accent/25 bg-hero-dark shadow-[0_8px_24px_rgba(15,31,61,0.28)]">
        {onDismiss ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
            className="pointer-events-auto absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-100 [@media(pointer:fine)]:hidden"
            aria-label="Close tooltip"
          >
            <svg
              viewBox="0 0 12 12"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M2 2l8 8M10 2 2 10" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        <div
          className="flex items-center gap-2 border-b border-white/8 px-3 py-2"
          style={
            tooltip.accent
              ? { borderLeftWidth: 3, borderLeftColor: tooltip.accent }
              : undefined
          }
        >
          {tooltip.accent ? (
            <span
              className={`size-2.5 shrink-0 rounded-full ${accentDotClass(tooltip.accent)}`}
              style={{ backgroundColor: tooltip.accent }}
              aria-hidden
            />
          ) : null}
          <p
            className={`min-w-0 flex-1 pr-4 leading-snug ${chartTooltipTitle}`}
          >
            {tooltip.title}
          </p>
        </div>
        <dl className="flex flex-col gap-2 px-3 py-2.5">
          {tooltip.lines.map((line) => (
            <div
              key={`${line.label}-${line.value}`}
              className="flex items-start justify-between gap-x-4"
            >
              <dt className={`whitespace-nowrap ${chartTooltipLabel}`}>
                {line.label}
              </dt>
              <dd className={`whitespace-nowrap text-right ${chartTooltipValue}`}>
                {line.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

type ChartCrosshairProps = {
  x: number;
  height: number;
  top: number;
  bottom: number;
  visible: boolean;
};

export function ChartCrosshair({
  x,
  height,
  top,
  bottom,
  visible,
}: ChartCrosshairProps) {
  if (!visible) return null;

  return (
    <line
      x1={x}
      x2={x}
      y1={top}
      y2={height - bottom}
      stroke="rgba(244, 197, 66, 0.45)"
      strokeWidth={1}
      strokeDasharray="4 4"
      className="transition-opacity duration-150"
    />
  );
}
