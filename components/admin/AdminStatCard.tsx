import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendPositive?: boolean;
  showTrendIcon?: boolean;
  statusLabel?: string;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  showTrendIcon = true,
  statusLabel,
  className,
}: AdminStatCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[14px] border border-navy-800/8 bg-white p-5 shadow-[0_1px_3px_rgba(10,22,40,0.06)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-body-muted">
          {label}
        </p>
        {icon ? <div className="shrink-0 text-navy-800/50">{icon}</div> : null}
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-8 text-navy-800">{value}</p>
      <div className="mt-auto min-h-11 pt-2">
        {trend ? (
          <p
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs leading-4",
              trendPositive ? "text-emerald-600" : "text-red-600",
              !showTrendIcon && "text-body-muted",
            )}
          >
            {showTrendIcon ? <span aria-hidden>↗</span> : null}
            {trend}
          </p>
        ) : null}
        {statusLabel ? (
          <p className="font-mono text-xs leading-4 text-emerald-600">{statusLabel}</p>
        ) : null}
      </div>
    </article>
  );
}
