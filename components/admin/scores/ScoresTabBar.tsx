"use client";

import { cn } from "@/lib/utils";
import type { ScoreDataset } from "@/lib/admin/scores/types";

const TABS: { id: ScoreDataset; label: string }[] = [
  { id: "math", label: "Math" },
  { id: "english", label: "English" },
  { id: "frl", label: "FRL" },
];

type ScoresTabBarProps = {
  active: ScoreDataset;
  onChange: (tab: ScoreDataset) => void;
};

export function ScoresTabBar({ active, onChange }: ScoresTabBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-[10px] px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-navy-800 text-white"
              : "border border-navy-800/10 bg-white text-body-muted hover:text-navy-800",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function parseScoresTab(value: string | null): ScoreDataset {
  if (value === "english" || value === "frl" || value === "math") return value;
  return "math";
}
