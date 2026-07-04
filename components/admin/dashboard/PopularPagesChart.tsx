import type { PopularPageRow } from "@/lib/admin/types";
import { formatCount } from "@/lib/admin/format";

type PopularPagesChartProps = {
  pages: PopularPageRow[];
};

export function PopularPagesChart({ pages }: PopularPagesChartProps) {
  const maxViews = Math.max(...pages.map((page) => page.views), 1);
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  if (pages.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-paper-300 bg-paper-50/60 px-6 text-center text-sm text-body-muted">
        No page views in this period yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between text-xs text-body-muted">
        <span className="font-medium uppercase tracking-[0.08em]">Top pages</span>
        <span>{formatCount(totalViews)} views total</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6">
        {pages.map((page) => {
          const widthPercent = Math.max((page.views / maxViews) * 100, 6);
          const share = Math.round((page.views / totalViews) * 100);

          return (
            <div key={page.path} className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-800">
                    {page.label}
                  </p>
                  <p className="truncate text-xs text-body-muted">{page.path}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xs text-navy-800">
                    {formatCount(page.views)}
                  </p>
                  <p className="text-[11px] text-body-muted">{share}%</p>
                </div>
              </div>
              <div className="mt-2 h-2 shrink-0 rounded-full bg-navy-50">
                <div
                  className="h-2 rounded-full bg-gold-500 transition-all duration-500"
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
