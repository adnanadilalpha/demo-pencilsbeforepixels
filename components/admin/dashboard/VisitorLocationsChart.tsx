import type { VisitorLocationRow } from "@/lib/admin/types";
import { formatCount } from "@/lib/admin/format";

type VisitorLocationsChartProps = {
  locations: VisitorLocationRow[];
};

export function VisitorLocationsChart({ locations }: VisitorLocationsChartProps) {
  const maxVisitors = Math.max(...locations.map((row) => row.visitors), 1);
  const totalVisitors = locations.reduce((sum, row) => sum + row.visitors, 0);

  if (locations.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-paper-300 bg-paper-50/60 px-6 text-center text-sm text-body-muted">
        Location data appears when visits have a resolved country (production traffic on Vercel).
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between text-xs text-body-muted">
        <span className="font-medium uppercase tracking-[0.08em]">Top locations</span>
        <span>{formatCount(totalVisitors)} visitors</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {locations.map((location) => {
          const widthPercent = Math.max((location.visitors / maxVisitors) * 100, 6);
          const share = Math.round((location.visitors / totalVisitors) * 100);

          return (
            <div key={location.key} className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-800">
                    {location.label}
                  </p>
                  {location.detail ? (
                    <p className="truncate text-xs text-body-muted">{location.detail}</p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xs text-navy-800">
                    {formatCount(location.visitors)}
                  </p>
                  <p className="text-[11px] text-body-muted">{share}%</p>
                </div>
              </div>
              <div className="mt-2 h-2 shrink-0 rounded-full bg-navy-50">
                <div
                  className="h-2 rounded-full bg-navy-800 transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
