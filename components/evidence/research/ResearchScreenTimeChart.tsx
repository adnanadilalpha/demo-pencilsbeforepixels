"use client";

import { useEffect, useRef, useState } from "react";
import {
  chartTooltipTitle,
  researchBodyText,
  researchChartAxisLabelMutedDark,
  researchChartCategoryLabelDark,
  researchChartTickMutedDark,
} from "@/components/charts/chart-theme";
import { isResearchDesktopWidth } from "@/lib/research/responsive";
import {
  bindChartHitTarget,
  positionChartTooltip,
  useDismissChartTooltip,
} from "@/lib/charts/tooltip";
import type {
  ScreenTimeChartData,
  ScreenTimeRow,
  ScreenTimeTabData,
} from "@/lib/research/types";
type ScreenTimeKey = keyof ScreenTimeChartData["tabs"];

const TABS: { key: ScreenTimeKey; label: string }[] = [
  { key: "total", label: "Total screen time" },
  { key: "tv", label: "TV & digital media" },
  { key: "video", label: "Video games" },
];

const PADDING_DESKTOP = { top: 48, right: 44, bottom: 56, left: 158 };
const PADDING_COMPACT = { top: 40, right: 16, bottom: 48, left: 108 };

const MAX_PCT = 30;
const BAR_HEIGHT = 26;
const CHART_HEIGHT =
  "h-[300px] min-h-[300px] md:h-[340px] md:min-h-[340px] lg:h-[360px] lg:min-h-[360px]";

const GRADE3_COLOR = "#0f1f3d";
const GRADE6_COLOR = "#4a6fa5";
const CHANCE_COLOR = "#c8ddf2";
const CHANCE_BORDER = "#8aafd4";
const NO_DROP_FILL = "#e5e7eb";
const NO_DROP_BORDER = "#d1d5db";

function barColor(row: ScreenTimeRow) {
  if (row.pct < 0) return NO_DROP_FILL;
  if (!row.sig) return CHANCE_COLOR;
  return row.grade === 3 ? GRADE3_COLOR : GRADE6_COLOR;
}

function barBorder(row: ScreenTimeRow) {
  if (row.pct < 0) return NO_DROP_BORDER;
  if (!row.sig) return CHANCE_BORDER;
  return row.grade === 3 ? GRADE3_COLOR : GRADE6_COLOR;
}

function axisTitle(active: ScreenTimeKey) {
  return active === "video"
    ? "Drop in chances of meeting grade level (%) — any video game use vs. none"
    : "Drop in chances of meeting grade level (%) per hour/day of screen time";
}

type ScreenTimeTooltipProps = {
  row: ScreenTimeRow | null;
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  onDismiss?: () => void;
};

function ScreenTimeTooltip({
  row,
  x,
  y,
  containerWidth,
  containerHeight,
  onDismiss,
}: ScreenTimeTooltipProps) {
  if (!row) return null;

  const dropText =
    row.or > 1
      ? `No drop — slightly higher odds (OR ${row.or.toFixed(2)}, not confirmed)`
      : `~${row.pct}% lower chance of meeting grade level`;

  const tooltipWidth = Math.min(340, containerWidth - 16);
  const tooltipHeight = 168;

  const { left, top } = positionChartTooltip(
    containerWidth,
    containerHeight,
    x,
    y,
    tooltipWidth,
    tooltipHeight,
  );

  return (
    <div
      className="pointer-events-none absolute z-20 w-max min-w-[288px] max-w-[calc(100%-16px)] transition-all duration-200 ease-out"
      style={{ left, top }}
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
          className="flex items-center gap-2 border-b border-white/8 px-3.5 py-2.5"
          style={{ borderLeftWidth: 3, borderLeftColor: barColor(row) }}
        >
          <span
            className={`size-2.5 shrink-0 rounded-full ring-1 ${
              barColor(row) === GRADE3_COLOR ? "ring-white/70" : "ring-white/25"
            }`}
            style={{ backgroundColor: barColor(row) }}
            aria-hidden
          />
          <p className={`pr-8 ${chartTooltipTitle}`}>{row.label}</p>
        </div>
        <div className="space-y-1.5 px-3.5 py-3 font-sans text-xs leading-snug text-slate-50/85 lg:text-sm">
          <p className="text-slate-50">{dropText}</p>
          <p>
            {row.sig ? "✓ Confirmed finding" : "✗ Result may be due to chance"}
          </p>
          <div className="border-t border-white/10 pt-2">
            <p>
              Research figure (OR): {row.or.toFixed(2)}{" "}
              <span className="text-slate-50/70">(95% CI: {row.ci})</span>
            </p>
            <p>p value: {row.p}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type ScreenTimePlotProps = {
  tab: ScreenTimeTabData;
  active: ScreenTimeKey;
};

function ScreenTimePlot({ tab, active }: ScreenTimePlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeRow, setActiveRow] = useState<ScreenTimeRow | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState({ x: 0, y: 0 });
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
  const PADDING = isResearchDesktopWidth(width)
    ? PADDING_DESKTOP
    : PADDING_COMPACT;
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);
  const rowCount = tab.rows.length;
  const slotHeight = plotHeight / rowCount;

  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;

  const rowCenterY = (index: number) =>
    plotTop + index * slotHeight + slotHeight / 2;

  const barY = (index: number) => rowCenterY(index) - BAR_HEIGHT / 2;

  const clearTooltip = () => {
    setActiveRow(null);
    setActiveIndex(null);
  };

  useDismissChartTooltip(plotRef, !!activeRow, clearTooltip);

  return (
    <div
      ref={plotRef}
      className={`relative w-full ${CHART_HEIGHT}`}
      onMouseLeave={clearTooltip}
      onClick={clearTooltip}
    >
      {width > 0 && height > 0 && (
        <svg
          width={width}
          height={height}
          className="absolute inset-0"
          role="img"
          aria-label={`Screen time impact on academic achievement for ${active}`}
        >
          <text
            x={PADDING.left + plotWidth / 2}
            y={24}
            textAnchor="middle"
            className={researchChartAxisLabelMutedDark}
          >
            {axisTitle(active)}
          </text>

          {[0, 5, 10, 15, 20, 25, 30].map((tick) => {
            const x = PADDING.left + (tick / MAX_PCT) * plotWidth;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  x2={x}
                  y1={plotTop}
                  y2={plotBottom}
                  stroke="rgba(15,31,61,0.08)"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={plotBottom + 22}
                  textAnchor="middle"
                  className={researchChartTickMutedDark}
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {tab.rows.map((row, index) => {
            const y = barY(index);
            const centerY = rowCenterY(index);
            const displayPct = row.pct < 0 ? 0.6 : row.pct;
            const barWidth = (displayPct / MAX_PCT) * plotWidth;
            const fill = barColor(row);
            const stroke = barBorder(row);
            const isActive = activeIndex === index;

            return (
              <g key={row.label}>
                <text
                  x={PADDING.left - 12}
                  y={centerY}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className={researchChartCategoryLabelDark}
                >
                  {row.label}
                </text>

                <rect
                  x={PADDING.left}
                  y={y}
                  width={Math.max(barWidth, row.pct < 0 ? 10 : 0)}
                  height={BAR_HEIGHT}
                  rx={5}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={row.sig ? 0 : 1}
                  opacity={isActive ? 1 : activeIndex === null ? 1 : 0.55}
                  className="transition-opacity duration-150"
                />

                <rect
                  x={PADDING.left}
                  y={y - 6}
                  width={plotWidth}
                  height={BAR_HEIGHT + 12}
                  fill="transparent"
                  className="cursor-pointer"
                  {...bindChartHitTarget({
                    isActive,
                    onActivate: () => {
                      setActiveIndex(index);
                      setActiveRow(row);
                      setTooltipAnchor({
                        x: PADDING.left + barWidth,
                        y: centerY,
                      });
                    },
                    onClear: clearTooltip,
                  })}
                />
              </g>
            );
          })}
        </svg>
      )}

      <ScreenTimeTooltip
        row={activeRow}
        x={tooltipAnchor.x}
        y={tooltipAnchor.y}
        containerWidth={width}
        containerHeight={height}
        onDismiss={clearTooltip}
      />
    </div>
  );
}

type ResearchScreenTimeChartProps = {
  data: ScreenTimeChartData;
};

export function ResearchScreenTimeChart({ data }: ResearchScreenTimeChartProps) {
  const [active, setActive] = useState<ScreenTimeKey>("total");
  const tab = data.tabs[active];

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4">
        {data.statPills.map((pill) => (
          <div
            key={pill.value}
            className="rounded-xl border border-navy-50 bg-navy-50 px-3 py-2.5 text-center md:px-4 md:py-3"
          >
            <p className="text-sm font-semibold text-navy-800 md:text-base">
              {pill.value}
            </p>
            <p className="mt-1 text-xs leading-snug tracking-wide text-navy-800/60 lg:text-sm">
              {pill.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 md:px-4 md:py-3 lg:px-5">
        <p className={`${researchBodyText} text-amber-900`}>
          <span className="font-semibold">How to read this chart: </span>
          Each bar shows how much a child&apos;s{" "}
          <strong>chance of meeting their grade-level standard drops</strong> for
          each extra hour of that screen type per day. A longer bar = a bigger
          drop. <em>Faded bars</em> mean the result could be due to chance (not
          a confirmed finding). Hover any bar to see the exact research figures.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active === key
                ? "border border-navy-800 bg-navy-800 text-white"
                : "border border-navy-50 bg-navy-50 text-navy-800 hover:bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ScreenTimePlot key={active} tab={tab} active={active} />
    </div>
  );
}
