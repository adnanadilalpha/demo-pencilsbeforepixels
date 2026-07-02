"use client";

import type { ChartTooltipState } from "@/lib/charts/tooltip";
import { positionChartTooltip } from "@/lib/charts/tooltip";

type ChartTooltipProps = {
  tooltip: ChartTooltipState;
  containerWidth: number;
  containerHeight: number;
};

export function ChartTooltip({
  tooltip,
  containerWidth,
  containerHeight,
}: ChartTooltipProps) {
  if (!tooltip) return null;

  const { left, top } = positionChartTooltip(
    containerWidth,
    containerHeight,
    tooltip.x,
    tooltip.y,
  );

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[148px] max-w-[220px] transition-all duration-200 ease-out"
      style={{ left, top }}
      role="tooltip"
    >
      <div className="overflow-hidden rounded-md border border-gold-accent/25 bg-hero-dark shadow-[0_8px_24px_rgba(15,31,61,0.28)]">
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
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: tooltip.accent }}
              aria-hidden
            />
          ) : null}
          <p className="text-xs font-semibold leading-tight text-slate-50">
            {tooltip.title}
          </p>
        </div>
        <dl className="flex flex-col gap-1.5 px-3 py-2.5">
          {tooltip.lines.map((line) => (
            <div
              key={`${line.label}-${line.value}`}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="text-[10px] leading-tight text-slate-50/55">
                {line.label}
              </dt>
              <dd className="text-right text-[11px] font-medium leading-tight text-gold-accent">
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
