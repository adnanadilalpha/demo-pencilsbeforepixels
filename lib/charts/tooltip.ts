import { useEffect, type MouseEvent, type RefObject } from "react";

type ChartTooltipLine = {
  label: string;
  value: string;
  accent?: string;
};

export type ChartTooltipState = {
  x: number;
  y: number;
  title: string;
  lines: ChartTooltipLine[];
  accent?: string;
} | null;

export function positionChartTooltip(
  containerWidth: number,
  containerHeight: number,
  anchorX: number,
  anchorY: number,
  tooltipWidth = 168,
  tooltipHeight = 88,
) {
  const padding = 8;
  let left = anchorX + 14;
  let top = anchorY - tooltipHeight - 10;

  if (left + tooltipWidth > containerWidth - padding) {
    left = anchorX - tooltipWidth - 14;
  }
  if (left < padding) {
    left = padding;
  }
  if (top < padding) {
    top = anchorY + 14;
  }
  if (top + tooltipHeight > containerHeight - padding) {
    top = containerHeight - tooltipHeight - padding;
  }

  left = Math.max(padding, Math.min(left, containerWidth - tooltipWidth - padding));

  return { left, top };
}

export function formatScore(value: number, decimals = 0) {
  if (!Number.isFinite(value)) return "—";
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

/** Human-readable series name for performance chart tooltips. */
export function formatSeriesTooltipTitle(label: string): string {
  if (label === "State Average Benchmark") return "State Average";
  const stateSubgroup = label.match(/^State — (.+)$/);
  if (stateSubgroup) return `${stateSubgroup[1]} (State)`;
  return label;
}

export function formatChartTooltipValue(
  value: number,
  options?: { yLabel?: string; preferInteger?: boolean },
): string {
  if (!Number.isFinite(value)) return "—";
  if (options?.preferInteger) return String(Math.round(value));

  if (
    options?.yLabel === "Average Scale Score" ||
    options?.yLabel === "Std. Achievement" ||
    options?.yLabel === "Mean Score" ||
    options?.yLabel === "Mean Score in Mathematics"
  ) {
    return value.toFixed(2);
  }

  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 1e-9) return String(rounded);
  return value.toFixed(2);
}

/** Dismiss an open tooltip when the user taps or clicks outside the plot. */
export function useDismissChartTooltip(
  plotRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const plot = plotRef.current;
      if (plot && !plot.contains(event.target as Node)) {
        onDismiss();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onDismiss, plotRef]);
}

type ChartHitTargetOptions = {
  isActive: boolean;
  onActivate: () => void;
  onClear: () => void;
};

/** Hover on desktop; tap to toggle on touch devices. */
export function bindChartHitTarget({
  isActive,
  onActivate,
  onClear,
}: ChartHitTargetOptions) {
  return {
    onMouseEnter: onActivate,
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      if (isActive) {
        onClear();
      } else {
        onActivate();
      }
    },
  };
}
