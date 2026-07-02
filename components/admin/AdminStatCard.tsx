import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendPositive?: boolean;
  statusLabel?: string;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  statusLabel,
  className,
}: AdminStatCardProps) {
  return (
    <article
      className={cn(
        "rounded-[14px] border border-navy-800/8 bg-white p-5 shadow-[0_1px_3px_rgba(10,22,40,0.06)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-body-muted">
          {label}
        </p>
        {icon ? <div className="text-navy-800/50">{icon}</div> : null}
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-8 text-navy-800">
        {value}
      </p>
      {trend ? (
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 font-mono text-xs",
            trendPositive ? "text-emerald-600" : "text-red-600",
          )}
        >
          <span aria-hidden>↗</span>
          {trend}
        </p>
      ) : null}
      {statusLabel ? (
        <p className="mt-2 font-mono text-xs text-emerald-600">{statusLabel}</p>
      ) : null}
    </article>
  );
}
