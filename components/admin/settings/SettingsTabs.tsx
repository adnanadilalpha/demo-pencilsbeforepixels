"use client";

import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/lib/admin/settings/types";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
];

type SettingsTabsProps = {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-[10px] px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-navy-800 text-white"
                : "text-body-muted hover:bg-paper-200/60 hover:text-navy-800",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
