type ChartZoomResetButtonProps = {
  onReset: () => void;
};

export function ChartZoomResetButton({ onReset }: ChartZoomResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="absolute right-2 top-2 z-10 rounded-full border border-navy-800/15 bg-white/95 px-2.5 py-1 font-sans text-xs font-medium text-navy-800 shadow-sm transition-colors hover:bg-white lg:text-sm"
    >
      Reset zoom
    </button>
  );
}

type ChartZoomSelectionProps = {
  rect: { x: number; y: number; width: number; height: number } | null;
};

export function ChartZoomSelection({ rect }: ChartZoomSelectionProps) {
  if (!rect || rect.width < 1 || rect.height < 1) return null;

  return (
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="rgba(15,31,61,0.06)"
      stroke="rgba(15,31,61,0.35)"
      strokeWidth={1}
      strokeDasharray="4 3"
      pointerEvents="none"
    />
  );
}
