"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { EquityDistrictPoint } from "@/lib/evidence/types";
import { formatDistrictLabel } from "@/lib/utils";

function RankingCard({
  title,
  description,
  tone,
  items,
}: {
  title: string;
  description: string;
  tone: "positive" | "negative";
  items: EquityDistrictPoint[];
}) {
  const isPositive = tone === "positive";

  return (
    <div className="flex flex-1 flex-col rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        {isPositive ? (
          <TrendingUp className="mt-0.5 size-5 text-[#16a34a]" />
        ) : (
          <TrendingDown className="mt-0.5 size-5 text-[#dc2626]" />
        )}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold leading-[18px] text-[#18263a]">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-[#6b7280]">{description}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`flex items-center justify-between gap-4 rounded-lg px-4 py-3 ${
              isPositive ? "bg-[#16a34a]/10" : "bg-[#dc2626]/10"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-sm font-medium text-[#18263a]/50">
                {index + 1}
              </span>
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="truncate text-sm font-medium uppercase text-[#18263a]/80">
                {formatDistrictLabel(item.name, 24)}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-semibold ${
                  isPositive ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {isPositive ? "+" : ""}
                {item.residual.toFixed(1)} pts
              </p>
              <p className="text-xs text-[#6b7280]">{item.frlPct}% FRL</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidenceEquityRankings({
  overperformers,
  underperformers,
}: {
  overperformers: EquityDistrictPoint[];
  underperformers: EquityDistrictPoint[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
      <RankingCard
        title="Top Overperformers"
        description="Scoring above expectations relative to their FRL rate."
        tone="positive"
        items={overperformers}
      />
      <RankingCard
        title="Underperformers"
        description="Scoring below expectations relative to their FRL rate."
        tone="negative"
        items={underperformers}
      />
    </div>
  );
}
