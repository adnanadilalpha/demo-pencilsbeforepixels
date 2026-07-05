"use client";

import { cn } from "@/lib/utils";
import type { ResourceTab } from "@/lib/admin/resources/types";

const TABS: { id: ResourceTab; label: string }[] = [
  { id: "books", label: "Books" },
  { id: "walled-garden", label: "Walled Garden" },
  { id: "research-papers", label: "Research Papers" },
  { id: "videos", label: "Videos" },
];

type ResourceTabBarProps = {
  active: ResourceTab;
  onChange: (tab: ResourceTab) => void;
};

export function ResourceTabBar({ active, onChange }: ResourceTabBarProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-8">
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

export function getAddLabel(tab: ResourceTab): string {
  switch (tab) {
    case "books":
      return "Add book";
    case "walled-garden":
      return "Add Walled Garden article";
    case "research-papers":
      return "Add research paper";
    case "videos":
      return "Add video";
  }
}

export function parseResourceTab(value: string | null): ResourceTab {
  if (value === "books") return "books";
  if (value === "videos") return "videos";
  if (value === "walled-garden") return "walled-garden";
  if (value === "research-papers" || value === "research") return "research-papers";
  if (value === "parent-resources" || value === "pdfs") return "books";
  return "books";
}
