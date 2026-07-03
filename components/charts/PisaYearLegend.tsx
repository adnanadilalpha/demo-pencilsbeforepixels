import { researchChartCaptionDark } from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";

type LegendItem = {
  year: string;
  color: string;
  dashArray?: string;
};

type PisaYearLegendProps = {
  items: LegendItem[];
  variant?: "research" | "academic" | "light";
  className?: string;
};

function LegendSwatch({ color, dashArray }: Pick<LegendItem, "color" | "dashArray">) {
  if (dashArray) {
    return (
      <span
        className="h-0 w-5 shrink-0 border-t-2 bg-transparent lg:w-6"
        style={{ borderTopColor: color, borderTopStyle: "dashed" }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className="h-0.5 w-5 shrink-0 lg:w-6"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function PisaYearLegend({
  items,
  variant = "research",
  className,
}: PisaYearLegendProps) {
  const useDarkText = variant === "research" || variant === "light";

  return (
    <div
      className={cn(
        "flex flex-row flex-wrap gap-3 lg:flex-col lg:gap-2",
        className,
      )}
    >
      {items.map((entry) => (
        <div key={entry.year} className="flex items-center gap-2">
          <LegendSwatch color={entry.color} dashArray={entry.dashArray} />
          <span
            className={
              useDarkText
                ? researchChartCaptionDark
                : "font-sans text-xs text-white/70 sm:text-sm"
            }
          >
            {entry.year}
          </span>
        </div>
      ))}
    </div>
  );
}
